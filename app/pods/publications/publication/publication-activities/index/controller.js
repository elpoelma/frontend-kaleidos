import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// TODO
// For now, we limit the number of request- and publication-activities to 1
// We will need to figure out whether multiple publication-activities are possible

export default class PublicationsPublicationPublicationActivitiesIndexController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked isOpenRequestModal = false;
  @tracked isOpenRegistrationModal = false;

  get latestPublicationActivity() {
    const timelineActivity = this.model.find(
      (timelineActivity) => timelineActivity.isPublicationActivity
    );
    return timelineActivity?.activity;
  }

  // Currently only one publication request is allowed
  get isRequestDisabled() {
    return this.model.some((activity) => activity.isRequestActivity);
  }

  get isRegistrationDisabled() {
    return this.latestPublicationActivity?.isFinished;
  }

  @task
  *saveRequest(publicationRequest) {
    yield this.publicationService.createPublicationRequest(
      publicationRequest,
      this.publicationFlow
    );

    this.send('refresh');
    this.closeRequestModal();
  }

  @task
  *registerPublication(publication) {
    let publicationActivity = this.latestPublicationActivity;
    const publicationDate = publication.publicationDate;
    const saves = [];

    if (!publicationActivity) {
      // Publication registration without a request
      publicationActivity = this.store.createRecord(
        'publication-activity',
        {
          startDate: new Date(),
          subcase: this.publicationSubcase,
        }
      );
    }
    publicationActivity.endDate = publicationDate;
    yield publicationActivity.save();

    const decision = this.store.createRecord('decision', {
      publicationDate: publicationDate,
      publicationActivity: publicationActivity,
    });
    saves.push(decision.save());

    if (publication.mustUpdatePublicationStatus) {
      const statusUpdate = this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PUBLISHED,
        publication.publicationDate
      );
      saves.push(statusUpdate);

      this.publicationSubcase.endDate = publication.publicationDate;
      saves.push(this.publicationSubcase.save());
    }

    yield Promise.all(saves);
    this.send('refresh');
    this.closeRegistrationModal();
  }

  @action
  async editPublication(publication) {
    const decision = publication.decision;
    decision.publicationDate = publication.publicationDate;

    const publicationActivity = await decision.publicationActivity;
    publicationActivity.endDate = publication.publicationDate;

    await Promise.all([decision.save(), publicationActivity.save()]);
  }

  @task
  *deleteRequest(requestActivityArgs) {
    yield this.performDeleteRequest(requestActivityArgs);
    // separate from this.performDeleteRequest(...):
    //    refresh is OK to be aborted
    this.send('refresh');
  }

  // separate method to prevent ember-concurrency from saving only partially
  async performDeleteRequest(requestActivity) {
    const deletes = [];

    const publicationActivity = await requestActivity.publicationActivity;
    deletes.push(publicationActivity.destroyRecord());

    const mail = await requestActivity.email;
    // legacy activities may not have an email so only try to delete if one exists
    deletes.push(mail?.destroyRecord());

    const pieces = await requestActivity.usedPieces;
    for (const piece of pieces.toArray()) {
      const proofingActivity = await piece.proofingActivityGeneratedBy;

      // The pieces that are used in a proofingActivity should not be deleted
      // Only proof (result/generated) pieces are uploaded, so they
      //    so no check whether they are linked to a translationActivity is required
      if (!proofingActivity) {
        const pieceDelete = this.publicationService.deletePiece(piece);
        deletes.push(pieceDelete)
      }
    }

    await Promise.all(deletes);

    // delete after previous records have been destroyed
    // destroying in parallel throws occasional errors
    await requestActivity.destroyRecord();
  }

  @action
  openRequestModal() {
    this.isOpenRequestModal = true;
  }

  @action
  closeRequestModal() {
    this.isOpenRequestModal = false;
  }

  @action
  openRegistrationModal() {
    this.isOpenRegistrationModal = true;
  }

  @action
  closeRegistrationModal() {
    this.isOpenRegistrationModal = false;
  }
}
