import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { translationRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { Validator, ValidatorSet } from 'frontend-kaleidos/utils/validators';
import { isPresent } from '@ember/utils';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument dueDate
   * @argument publicationFlow
   * @argument onSave
   * @argument onCancel
   */
  @service publicationService;

  @tracked uploadedPieces = [];
  @tracked numberOfPages;
  @tracked numberOfWords;
  @tracked translationDueDate = this.args.dueDate;
  @tracked subject;
  @tracked message;
  @tracked mustUpdatePublicationStatus = true;

  validators;

  constructor() {
    super(...arguments);
    this.initValidators();
    this.setEmailFields.perform();
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return (
      this.uploadedPieces.length === 0 ||
      !this.validators.areValid ||
      this.cancel.isRunning
    );
  }

  @task
  *save() {
    yield this.args.onSave({
      pieces: this.uploadedPieces,
      translationDueDate: this.translationDueDate,
      subject: this.subject,
      message: this.message,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }

  @dropTask
  *cancel() {
    yield Promise.all(
      this.uploadedPieces.map((piece) =>
        this.deleteUploadedPiece.perform(piece)
      )
    );
    this.args.onCancel();
  }

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    const identification = yield publicationFlow.identification;
    const contactPersons = yield publicationFlow.contactPersons;
    const urgencyLevel = yield publicationFlow.urgencyLevel;
    const mailParams = {
      identifier: identification.idName,
      title: publicationFlow.shortTitle,
      urgent: urgencyLevel?.isUrgent,
      dueDate: this.translationDueDate,
      numberOfPages: this.numberOfPages,
      numberOfWords: this.numberOfWords,
      numberOfDocuments: this.uploadedPieces.length,
      contactPersons: contactPersons.toArray(),
    };

    const mailTemplate = yield translationRequestEmail(mailParams);
    this.message = mailTemplate.message;
    this.subject = mailTemplate.subject;
  }

  @action
  setTranslationDueDate(selectedDate) {
    this.translationDueDate = selectedDate;
    this.setEmailFields.perform();
  }

  @action
  async uploadPiece(file) {
    const piece = await this.publicationService.createPiece(file);
    this.uploadedPieces.pushObject(piece);
    this.setEmailFields.perform();
  }

  @action
  setTranslationRequestedStatus(event) {
    this.mustUpdatePublicationStatus = event.target.checked;
  }

  @task
  *deleteUploadedPiece(piece) {
    yield this.publicationService.deletePiece(piece);
    this.uploadedPieces.removeObject(piece);
    this.setEmailFields.perform();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      translationDueDate: new Validator(() =>
        isPresent(this.translationDueDate)
      ),
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
    });
  }
}
