import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { setAgendaitemFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import * as AgendaPublicationUtils from 'frontend-kaleidos/utils/agenda-publication';
import {
  constructArchiveName,
  fetchArchivingJobForAgenda,
  fileDownloadUrlFromJob,
} from 'frontend-kaleidos/utils/zip-agenda-files';

/**
 * @argument {Meeting} meeting
 * @argument {Agenda} currentAgenda
 * @argument {function} didApproveAgendaitems
 * @argument onStartLoading
 * @argument onStopLoading
 */
export default class AgendaAgendaHeaderAgendaActions extends Component {
  @service store;
  @service router;
  @service currentSession;
  @service intl;
  @service jobMonitor;
  @service toaster;

  @tracked isAddingAgendaitems = false;
  @tracked isEditingMeeting = false;
  @tracked showConfirmApprovingAllAgendaitems = false;
  @tracked showConfirmPublishInternalDecisions = false;
  @tracked showPlanPublicationModal = false;
  @tracked showConfirmPublishThemis = false;
  @tracked showConfirmUnpublishThemis = false;

  @tracked internalDecisionPublicationActivity;
  @tracked internalDocumentPublicationActivity;
  @tracked themisPublicationActivities;
  @tracked latestThemisPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadPublicationActivities.perform();
  }

  get showPrintButton() {
    return this.router.currentRouteName === 'agenda.print';
  }

  get canEditDesignAgenda() {
    return (
      this.currentSession.isEditor && this.args.currentAgenda.isDesignAgenda
    );
  }

  get canPublishInternalDecisions() {
    if (this.loadPublicationActivities.isRunning) {
      return false;
    }

    return (
      this.currentSession.isEditor &&
      this.args.meeting.isFinal &&
      this.internalDecisionPublicationActivity != null && // disable for the old data-model (without decision-publication-activity)
      AgendaPublicationUtils.getIsCertainlyNotStarted(this.internalDecisionPublicationActivity)
    );
  }

  // Plan publication of documents internally (=Vrijgeven) and on Themis
  get canPlanPublication() {
    if (this.loadPublicationActivities.isRunning) {
      return false;
    }
    let can = this.currentSession.isEditor;
    can &&= this.args.meeting.isFinal;
    if (this.themisPublicationActivities.length === 1) {
      can &&= AgendaPublicationUtils.getIsCertainlyNotStarted(this.latestThemisPublicationActivity);
      can &&= AgendaPublicationUtils.getHasScope(this.latestThemisPublicationActivity, AgendaPublicationUtils.THEMIS_PUBLICATION_SCOPE_INITIAL);
    } else {
      // cases:
      //  - old data-model (no themis-publication-activity)
      //  - next publication already scheduled
      can = false;
    }
    return can;
  }

  get canPublishThemis() {
    if (this.loadPublicationActivities.isRunning) {
      return false;
    }
    let can = this.args.meeting.isFinal;

    const isInternalDecisionPublicationScheduled = this.internalDecisionPublicationActivity?.startDate != null;
    if (isInternalDecisionPublicationScheduled) {
      const isInternalDecisionsPublished = this.internalDocumentPublicationActivity.startDate < new Date();
      can &&= isInternalDecisionsPublished;
    }

    const isInternalDocumentPublicationScheduled = this.internalDocumentPublicationActivity?.startDate != null;
    if (isInternalDocumentPublicationScheduled) {
      const isInternalDocumentsPublished = this.internalDocumentPublicationActivity.startDate < new Date();
      can &&= isInternalDocumentsPublished;
    }

    return can;
  }

  get isAlreadyPublished() {
    return this.latestThemisPublicationActivity != null;
  }

  @task
  *loadPublicationActivities() {
    const meeting = yield this.store.queryOne('meeting', {
      'filter[:uri:]': this.args.meeting.uri,
      include: [
        'decision-publication-activity',
        'document-publication-activity',
        'themis-publication-activities',
      ].join(','),
    });

    this.internalDecisionPublicationActivity = yield meeting.decisionPublicationActivity;
    this.internalDocumentPublicationActivity = yield meeting.documentPublicationActivity;

    const themisPublicationActivities = yield meeting.themisPublicationActivities;
    this.themisPublicationActivities = themisPublicationActivities.toArray();
    let latestThemisPublicationActivity = this.themisPublicationActivities.find((it) => it.startDate == null);
    if (latestThemisPublicationActivity == null) {
      latestThemisPublicationActivity = this.themisPublicationActivities.sortBy('startDate').reverse()[0]
    }
    this.latestThemisPublicationActivity = latestThemisPublicationActivity;
  }

  /**
   * This task will reload the agendaitems of the current agenda
   * Any new agendaitem or changed formality is picked up by this, to avoid stale data created by concurrent edits of agendaitem
   */
  @task
  *reloadAgendaitemsData() {
    /**
     * This hasMany reload will:
     * - Refresh the amount of agendaitems there are (if new were added)
     * - Reload the agendaitems attributes (titles, formal ok status (uri), etc)
     * - Reload the agendaitems concurrency (modified attribute)
     */
    yield this.args.currentAgenda.hasMany('agendaitems').reload();
    // When reloading the data for this use-case, only the agendaitems that are not "formally ok" have to be fully reloaded
    // If not reloaded, any following PATCH call on these agendaitems will succeed (due to the hasMany reload above) but with old relation data
    // *NOTE* since we only load the "nok/not yet ok" items, it is still possible to save old relations on formally ok items (although most changes should reset the formality)
    const agendaitemsNotOk = yield this.args.currentAgenda.get(
      'allAgendaitemsNotOk'
    );
    for (const agendaitem of agendaitemsNotOk) {
      // Reloading some relationships of agendaitem most likely to be changed by concurrency
      yield agendaitem.reload();
      yield agendaitem.hasMany('pieces').reload();
      yield agendaitem.hasMany('treatments').reload();
      yield agendaitem.hasMany('mandatees').reload();
      yield agendaitem.hasMany('linkedPieces').reload();
    }
  }

  @task
  *publishThemis(scope) {
    try {
      const themisPublicationActivity = this.store.createRecord(
        'themis-publication-activity',
        {
          startDate: new Date(),
          meeting: this.args.meeting,
          scope,
        }
      );
      yield themisPublicationActivity.save();
      yield this.loadLatestPublicationActivity.perform();
      this.toaster.success(this.intl.t('success-publish-to-web'));
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-publish-to-web'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmPublishThemis = false;
  }

  @action
  openConfirmUnpublishThemis() {
    this.showConfirmUnpublishThemis = true;
  }

  @action
  cancelUnpublishThemis() {
    this.showConfirmUnpublishThemis = false;
  }

  @task
  *unpublishThemis(scope) {
    try {
      const themisPublicationActivity = this.store.createRecord(
        'themis-publication-activity',
        {
          startDate: new Date(),
          meeting: this.args.meeting,
          scope,
        }
      );
      yield themisPublicationActivity.save();
      this.toaster.success(this.intl.t('success-unpublish-from-web'));
    } catch (e) {
      this.toaster.error(
        this.intl.t('error-unpublish-from-web'),
        this.intl.t('warning-title')
      );
    }
    this.showConfirmUnpublishThemis = false;
  }

  @action
  async downloadAllDocuments() {
    // timeout options is in milliseconds. when the download is ready, the toast should last very long so users have a time to click it
    const fileDownloadToast = {
      title: this.intl.t('file-ready'),
      message: this.intl.t('agenda-documents-download-ready'),
      type: 'download-file',
      options: {
        timeOut: 60 * 10 * 1000,
      },
    };

    const namePromise = constructArchiveName(this.args.currentAgenda);
    debug('Checking if archive exists ...');
    const jobPromise = fetchArchivingJobForAgenda(
      this.args.currentAgenda,
      this.store
    );
    const [name, job] = await all([namePromise, jobPromise]);
    if (!job) {
      this.toaster.warning(
        this.intl.t('no-documents-to-download-warning-text'),
        this.intl.t('no-documents-to-download-warning-title'),
        {
          timeOut: 10000,
        }
      );
      return;
    }
    if (!job.hasEnded) {
      debug('Archive in creation ...');
      const inCreationToast = this.toaster.loading(
        this.intl.t('archive-in-creation-message'),
        this.intl.t('archive-in-creation-title'),
        {
          timeOut: 3 * 60 * 1000,
        }
      );
      this.jobMonitor.register(job);
      job.on('didEnd', this, async function (status) {
        this.toaster.clear(inCreationToast);
        if (status === job.SUCCESS) {
          const url = await fileDownloadUrlFromJob(job, name);
          debug(`Archive ready. Prompting for download now (${url})`);
          fileDownloadToast.options.downloadLink = url;
          fileDownloadToast.options.fileName = name;
          this.toaster.displayToast.perform(fileDownloadToast);
        } else {
          debug('Something went wrong while generating archive.');
          this.toaster.error(
            this.intl.t('error'),
            this.intl.t('warning-title')
          );
        }
      });
    } else {
      const url = await fileDownloadUrlFromJob(job, name);
      debug(`Archive ready. Prompting for download now (${url})`);
      fileDownloadToast.options.downloadLink = url;
      fileDownloadToast.options.fileName = name;
      this.toaster.displayToast.perform(fileDownloadToast);
    }
  }

  @action
  async approveAllAgendaitems() {
    this.showConfirmApprovingAllAgendaitems = false;
    this.args.onStartLoading(this.intl.t('approve-all-agendaitems-message'));
    const allAgendaitemsNotOk = await this.args.currentAgenda.get(
      'allAgendaitemsNotOk'
    );
    for (const agendaitem of allAgendaitemsNotOk) {
      try {
        await setAgendaitemFormallyOk(agendaitem);
      } catch {
        await agendaitem.rollbackAttributes();
      }
    }
    this.args.onStopLoading();
    this.args.didApproveAgendaitems();
  }

  @action
  print() {
    window.print();
  }

  @action
  openConfirmPublishInternalDecisions() {
    this.showConfirmPublishInternalDecisions = true;
  }

  @action
  cancelPublishInternalDecisions() {
    this.showConfirmPublishInternalDecisions = false;
  }

  @action
  publishInternalDecisions() {
    this.showConfirmPublishInternalDecisions = false;
    this.internalDecisionPublicationActivity.startDate = new Date();
    this.internalDecisionPublicationActivity.save();
  }

  @action
  openPlanPublicationModal() {
    this.showPlanPublicationModal = true;
  }

  @action
  cancelPlanPublication() {
    this.showPlanPublicationModal = false;
  }

  @action
  didSavePlanPublication() {
    this.showPlanPublicationModal = false;
  }

  @action
  openConfirmPublishThemis() {
    this.showConfirmPublishThemis = true;
  }

  @action
  cancelPublishThemis() {
    this.showConfirmPublishThemis = false;
  }

  @action
  toggleEditingMeeting() {
    this.isEditingMeeting = !this.isEditingMeeting;
  }

  @action
  openConfirmApproveAllAgendaitems() {
    this.reloadAgendaitemsData.perform();
    this.showConfirmApprovingAllAgendaitems = true;
  }

  @action
  cancelApproveAllAgendaitems() {
    this.showConfirmApprovingAllAgendaitems = false;
  }

  @action
  openAddAgendaitemsModal() {
    this.isAddingAgendaitems = true;
  }
}
