import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class PublicationStatusModal extends Component {
  @service store;

  @tracked publicationStatus;
  @tracked changeDate;

  constructor() {
    super(...arguments);
    this.publicationStatus = this.args.publicationStatus;
    this.changeDate = new Date();
  }

  get publicationStatusses() {
    return this.store.peekAll('publication-status').sortBy('position');
  }

  get isDisabledSave() {
    return this.publicationStatus == this.args.publicationStatus; // no new status selected
  }

  @action
  selectPublicationStatus(status) {
    this.publicationStatus = status;
  }

  @action
  setChangeDate(selectedDates) {
    this.changeDate = selectedDates[0];
  }

  @task
  *savePublicationStatus() {
    yield this.args.onSave(this.publicationStatus, this.changeDate);
  }
}