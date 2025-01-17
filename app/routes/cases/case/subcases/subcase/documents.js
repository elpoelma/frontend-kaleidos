import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject as service } from '@ember/service';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import VrLegacyDocumentName,
{ compareFunction as compareLegacyDocuments } from 'frontend-kaleidos/utils/vr-legacy-document-name';

export default class DocumentsSubcaseSubcasesRoute extends Route {
  @service store;
  @service currentSession;

  // Query for pieces of submission-activity is a 2-step process (submission-activity -> pieces). 
  // Querying pieces directly doesn't work since the inverse isn't present in API config
  async model() {
    this.subcase = this.modelFor('cases.case.subcases.subcase');
    // Get any submission that is not yet on a meeting
    const submissionActivitiesWithoutActivity = await this.store.queryAll('submission-activity', {
      'filter[subcase][:id:]': this.subcase.id,
      'filter[:has-no:agenda-activity]': true,
      include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
    });
    let submissionActivities = [...submissionActivitiesWithoutActivity.slice()];
    // Get the submission from latest meeting if applicable
    const agendaActivities = await this.subcase.agendaActivities;
    const latestActivity = agendaActivities
      .slice()
      .sort((a1, a2) => a1.startDate - a2.startDate)
      .at(-1);
    if (latestActivity) {
      this.latestMeeting = await this.store.queryOne('meeting', {
        'filter[agendas][agendaitems][agenda-activity][:id:]': latestActivity.id,
        sort: '-planned-start',
      });
      const submissionActivitiesFromLatestMeeting = await this.store.queryAll('submission-activity', {
        'filter[subcase][:id:]': this.subcase.id,
        'filter[agenda-activity][:id:]': latestActivity.id,
        include: 'pieces,pieces.document-container', // Make sure we have all pieces, unpaginated
      });
      submissionActivities.addObjects(submissionActivitiesFromLatestMeeting.slice());
    }

    const pieces = [];
    for (const submissionActivity of submissionActivities.slice()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.slice();
      pieces.push(...submissionPieces);
    }

    let sortedPieces;
    if (this.latestMeeting?.isPreKaleidos) {
      sortedPieces = sortPieces(pieces, VrLegacyDocumentName, compareLegacyDocuments);
    } else {
      sortedPieces = sortPieces(pieces);
    }

    return {
      pieces: sortedPieces,
      // linkedPieces: this.modelFor('cases.case.subcases.subcase').get('linkedPieces')
    };
  }

  async afterModel() {
    this.defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      this.subcase.confidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    // Additional failsafe check on document visibility. Strictly speaking this check
    // is not necessary since documents are not propagated by Yggdrasil if they
    // should not be visible yet for a specific profile.
    if (this.currentSession.may('view-documents-before-release')) {
      this.documentsAreVisible = true;
    } else {
      const documentPublicationActivity = await this.latestMeeting?.internalDocumentPublicationActivity;
      const documentPublicationStatus = await documentPublicationActivity?.status;
      this.documentsAreVisible = documentPublicationStatus?.uri === CONSTANTS.RELEASE_STATUSES.RELEASED;
    }
    const decisionmakingFlow = this.modelFor('cases.case');
    this.case = await decisionmakingFlow.case;
  }

  setupController(controller) {
    super.setupController(...arguments);
    const subcase = this.modelFor('cases.case.subcases.subcase');
    controller.subcase = subcase;
    controller.case = this.case;
    controller.documentsAreVisible = this.documentsAreVisible;
    controller.defaultAccessLevel = this.defaultAccessLevel;
  }
}
