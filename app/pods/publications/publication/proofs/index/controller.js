import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationProofsController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked publicationSubcase;

  @tracked showProofUploadModal = false;
  @tracked showProofRequestModal = false;

  get isProofUploadDisabled() {
    return this.latestProofingActivity == null;
  }

  get latestProofingActivity() {
    const timelineActivity = this.model.find(
      (timelineActivity) => timelineActivity.isProofingActivity
    );
    return timelineActivity ? timelineActivity.activity : null;
  }

  @task
  *saveProofUpload(proofUpload) {
    const proofingActivity = this.latestProofingActivity;

    const pieceSaves = [];
    const language = yield proofingActivity.language;
    for (let piece of proofUpload.uploadedPieces) {
      piece.receivedDate = proofUpload.receivedDate;
      piece.language = language;
      piece.proofingActivityGeneratedBy = proofingActivity;
      pieceSaves.push(piece.save());
    }

    proofingActivity.endDate = proofUpload.receivedDate;
    const proofingActivitySave = proofingActivity.save();

    let publicationSubcaseSave;
    if (
      proofUpload.receivedDate < this.publicationSubcase.receivedDate ||
      !this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = proofUpload.receivedDate;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.proofPrintCorrector) {
      this.publicationSubcase.proofPrintCorrector = proofUpload.proofPrintCorrector;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    if (proofUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.PROOF_IN,
        proofUpload.receivedDate
      );

      this.publicationSubcase.endDate = proofUpload.receivedDate;
      publicationSubcaseSave = this.publicationSubcase.save();
    }

    yield Promise.all([
      proofingActivitySave,
      ...pieceSaves,
      publicationSubcaseSave,
    ]);

    this.send('refresh');
    this.showProofUploadModal = false;
  }

  @task
  *saveProofRequest(proofRequest) {
    yield this.publicationService.createProofRequestActivity(proofRequest,this.publicationSubcase,this.publicationFlow)

    this.send('refresh');
    this.showProofRequestModal = false;
  }

  @dropTask
  *deleteRequest(requestActivity) {
    const deletePromises = [];

    const proofingActivity = yield requestActivity.proofingActivity;
    deletePromises.push(proofingActivity.destroyRecord());

    const mail = yield requestActivity.email;
    if (mail) {
      deletePromises.push(mail.destroyRecord());
    }
    deletePromises.push(requestActivity.destroyRecord());

    const pieces = yield requestActivity.usedPieces;

    for (const piece of pieces.toArray()) {
      const [file, documentContainer] = yield Promise.all([
        piece.file,
        piece.documentContainer,
      ]);

      deletePromises.push(piece.destroyRecord());
      deletePromises.push(file.destroyRecord());
      deletePromises.push(documentContainer.destroyRecord());
    }
    yield Promise.all(deletePromises);
    this.send('refresh');
  }

  @task
  *saveEditReceivedProof(proofEdit) {
    const saves = [];

    const proofingActivity = proofEdit.proofingActivity;
    proofingActivity.endDate = proofEdit.receivedDate;
    saves.push(proofingActivity.save());

    if (
      proofEdit.receivedDate < this.publicationSubcase.receivedDate ||
      !this.publicationSubcase.receivedDate
    ) {
      this.publicationSubcase.receivedDate = proofEdit.receivedDate;
    }
    this.publicationSubcase.proofPrintCorrector = proofEdit.proofPrintCorrector;
    saves.push(this.publicationSubcase.save());

    yield Promise.all(saves);
    this.send('refresh');
  }

  @action
  openProofUploadModal() {
    this.showProofUploadModal = true;
  }

  @action
  closeProofUploadModal() {
    this.showProofUploadModal = false;
  }

  @action
  openProofRequestModal() {
    this.showProofRequestModal = true;
  }

  @action
  closeProofRequestModal() {
    this.showProofRequestModal = false;
  }
}
