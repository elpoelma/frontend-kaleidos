import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { getPublicationStatusPillKey, getPublicationStatusPillStep } from 'frontend-kaleidos/utils/publication-auk';

export default class PublicationsTableRowComponent extends Component {
  @service router;
  @service store;
  @service publicationService;

  @tracked isViaCouncilOfMinisters;
  @tracked publicationDate;
  @tracked numberOfPages;
  @tracked translationRequestDate;
  @tracked proofRequestDate;
  @tracked proofReceivedDate;
  @tracked publicationStatus;

  constructor() {
    super(...arguments);
    this.loadData.perform();
    if (this.args.tableColumnDisplayOptions.status) {
      this.loadPublicationStatus.perform();
    }
  }

  @task
  *loadData() {
    if (this.args.tableColumnDisplayOptions.source) {
      this.isViaCouncilOfMinisters =
      yield this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.translationRequestDate) {
      this.translationRequestDate = yield this.getTranslationRequestDate(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.proofRequestDate) {
      this.proofRequestDate = yield this.getProofRequestDate(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.proofReceivedDate) {
      this.proofReceivedDate = yield this.getProofReceivedDate(this.args.publicationFlow);
    }
    if (this.args.tableColumnDisplayOptions.publicationDate) {
      this.publicationDate = yield this.publicationService.getPublicationDate(
        this.args.publicationFlow
      );
    }
  }

  @task
  *loadPublicationStatus() {
    this.publicationStatus = yield this.args.publicationFlow.status;
  }

  get publicationStatusPillKey() {
    return this.publicationStatus && getPublicationStatusPillKey(this.publicationStatus);
  }

  get publicationStatusPillStep() {
    return this.publicationStatus && getPublicationStatusPillStep(this.publicationStatus);
  }

  /** @returns {Date?} undefined if no translation-activities */
  async getTranslationRequestDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.translationSubcase;
    const translationActivities = await publicationSubcase.translationActivities;
    const requestDates = translationActivities.mapBy('startDate');
    const mostRecentDate = this.getMaxDate(requestDates);
    return mostRecentDate;
  }

  /** @returns {Date?} undefined if no ProofingActivities */
  async getProofRequestDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const proofingActivities = await publicationSubcase.proofingActivities;
    const requestDates = proofingActivities.mapBy('startDate');
    const mostRecentDate = this.getMaxDate(requestDates);
    return mostRecentDate;
  }

  getMaxDate(dates) {
    // default .sort() of Date objects does not give expected results
    dates = dates.sortBy();
    const max = dates.lastObject;
    return max;
  }

  /** @returns {Date?} undefined if no ProofingActivities or a ProofingActivity is not finished */
  async getProofReceivedDate(publicationFlow) {
    const publicationSubcase = await publicationFlow.publicationSubcase;
    const proofingActivities = await publicationSubcase.proofingActivities;
    let receivedDates = proofingActivities.mapBy('endDate');
    // default .sort() of Date objects does not give expected results
    // JS sorts `undefined` after Date objects
    // if there is a ProofingActivity which is not finished (endDate === undefined)
    // undefined will be the .lastObject
    // not using Embers .sortBy() to avoid sort algorithm changes
    receivedDates = receivedDates.sort((a, b) => a - b);
    const mostRecentDate = receivedDates.lastObject;
    return mostRecentDate;
  }

  // TODO: review async getter once ember-resources can be used
  get isTranslationOverdue() {
    return (
      !this.args.publicationFlow.status.get('isFinal') &&
      this.args.publicationFlow.translationSubcase.get('isOverdue')
    );
  }

  // TODO: review async getter once ember-resources can be used
  get isPublicationOverdue() {
    return (
      !this.args.publicationFlow.status.get('isFinal') &&
      this.args.publicationFlow.publicationSubcase.get('isOverdue')
    );
  }

  @action
  navigateToPublication() {
    this.router.transitionTo(
      'publications.publication',
      this.args.publicationFlow.id
    );
  }
}
