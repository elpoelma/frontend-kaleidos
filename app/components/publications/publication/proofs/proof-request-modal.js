import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency-decorators';
import { proofRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';
import { inject as service } from '@ember/service';

/**
 * @argument {PublicationFlow} publicationFlow includes: identification
 * @argument {usedPieces} UsedPieces from a TranslationActivity if proof is requested from a translation. These cannot be deleted
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofRequestModalComponent extends Component {
  @service store;

  @tracked subject;
  @tracked message;
  @tracked uploadedPieces = [];

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
    const totalPieces = this.uploadedPieces.length + (this.args.usedPieces ? this.args.usedPieces.length : 0)
    return (
      totalPieces === 0 ||
      !this.validators.areValid ||
      this.cancel.isRunning
    );
  }

  @task
  *save() {
    if (this.args.usedPieces) {
      this.uploadedPieces.push(...this.args.usedPieces.toArray())
    }
    yield this.args.onSave({
      subject: this.subject,
      message: this.message,
      uploadedPieces: this.uploadedPieces,
    });
  }

  @dropTask
  *cancel() {
    // necessary because close-button is not disabled when saving
    if (this.save.isRunning) {
      return;
    }
    yield Promise.all(this.uploadedPieces.map((piece) => this.deleteUploadedPiece.perform(piece)));
    this.args.onCancel();
  }

  @task
  *deleteUploadedPiece(piece) {
    const file = yield piece.file;
    const documentContainer = yield piece.documentContainer;
    this.uploadedPieces.removeObject(piece);

    yield Promise.all([
      file.destroyRecord(),
      documentContainer.destroyRecord(),
      piece.destroyRecord()
    ]);
  }

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    const identification = yield publicationFlow.identification;

    const mailParams = {
      identifier: identification.idName,
      shortTitle: publicationFlow.shortTitle,
      longTitle: publicationFlow.longTitle? publicationFlow.longTitle:publicationFlow.shortTitle,
    };

    const mailTemplate = proofRequestEmail(mailParams);

    this.message = mailTemplate.message;
    this.subject = mailTemplate.subject;
  }

  @action
  async uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    await documentContainer.save();
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });

    this.uploadedPieces.pushObject(piece);
  }

  initValidators() {
    this.validators = new ValidatorSet({
      subject: new Validator(() => isPresent(this.subject)),
      message: new Validator(() => isPresent(this.message)),
    });
  }
}
