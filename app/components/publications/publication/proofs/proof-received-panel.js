import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';

/**
 * @argument {proofingActivity}
 * @argument {proofPrintCorrector} from publicationSubcase
 * @argument {onEditProofingActivity}
 */
export default class PublicationsPublicationProofProofReceivedPanel extends Component {
  @tracked showEditProofModal = false;
  @tracked showPublicationRequestModal = false;

  @tracked newReceivedDate;
  @tracked newProofPrintCorrector;

  get isCancelDisabled() {
    return this.save.isRunning;
  }

  get isSaveDisabled() {
    return isEmpty(this.newReceivedDate);
  }

  @task
  *save() {
    yield this.args.onEditProofingActivity({
      proofingActivity: this.args.proofingActivity,
      receivedDate: this.newReceivedDate,
      proofPrintCorrector: this.newProofPrintCorrector,
    });
    this.showEditProofModal = false;
  }

  @task
  *createPublicationRequest(publicationRequestArgs) {
    yield this.args.onCreatePublicationRequest(publicationRequestArgs);
    this.showPublicationRequestModal = false;
  }

  @action
  openEditProofModal() {
    this.showEditProofModal = true;
    this.newReceivedDate = this.args.proofingActivity.endDate;
    this.newProofPrintCorrector = this.args.proofPrintCorrector;
  }

  @action
  closeEditProofModal() {
    this.showEditProofModal = false;
  }

  @action
  openPublicationRequestModal() {
    this.showPublicationRequestModal = true;
  }

  @action
  closePublicationRequestModal() {
    this.showPublicationRequestModal = false;
  }

  @action
  setNewReceivedDate(selectedDates) {
    if (selectedDates.length) {
      this.newReceivedDate = selectedDates[0];
    } else {
      // this case occurs when users manually empty the date input-field
      this.newReceivedDate = undefined;
    }
  }
}
