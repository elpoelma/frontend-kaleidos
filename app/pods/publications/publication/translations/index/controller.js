import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, dropTask } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { PUBLICATION_EMAIL } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationTranslationsIndexController extends Controller {
  @service store;
  @service publicationService;

  @tracked publicationFlow;
  @tracked translationSubcase;

  @tracked showTranslationUploadModal = false;
  @tracked showTranslationRequestModal = false;

  get isTranslationUploadDisabled() {
    return this.latestTranslationActivity == null;
  }

  get latestTranslationActivity() {
    const timelineActivity = this.model.find((timelineActivity) => timelineActivity.isTranslationActivity);
    return timelineActivity ? timelineActivity.activity : null;
  }

  @task
  *saveTranslationUpload(translationUpload) {
    const translationActivity = this.latestTranslationActivity;

    const pieceSaves = [];
    const containerSaves = [];

    const language = yield translationActivity.language;
    for (let piece of translationUpload.uploadedPieces) {
      piece.receivedDate = translationUpload.receivedDate;
      piece.language = language;
      piece.translationActivityGeneratedBy = translationActivity;
      pieceSaves.push(piece.save());
    }

    translationActivity.endDate = translationUpload.receivedDate;
    const translationActivitySave = translationActivity.save();

    let translationSubcaseSave;
    if (
      !this.translationSubcase.receivedDate ||
      translationUpload.receivedDate < this.translationSubcase.receivedDate
    ) {
      this.translationSubcase.receivedDate = translationUpload.receivedDate;
      translationSubcaseSave = this.translationSubcase.save();
    }

    if (translationUpload.mustUpdatePublicationStatus) {
      yield this.publicationService.updatePublicationStatus(
        this.publicationFlow,
        CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_RECEIVED,
        translationUpload.receivedDate
      );

      this.translationSubcase.endDate = translationUpload.receivedDate;
      translationSubcaseSave = this.translationSubcase.save();
    }

    yield Promise.all([
      translationActivitySave,
      ...pieceSaves,
      containerSaves,
      translationSubcaseSave,
    ]);

    this.send('refresh');
    this.showTranslationUploadModal = false;
  }

  @task
  *saveTranslationRequest(translationRequest) {
    const now = new Date();

    const uploadedPieces = translationRequest.uploadedPieces;
    const dutch = yield this.store.findRecordByUri('language', CONSTANTS.LANGUAGES.NL);
    yield Promise.all(uploadedPieces.map((piece) => {
      piece.translationSubcaseSourceFor = this.translationSubcase;
      piece.language = dutch;
      return piece.save();
    }));

    const requestActivity = this.store.createRecord('request-activity', {
      startDate: now,
      translationSubcase: this.translationSubcase,
      usedPieces: uploadedPieces,
    });
    yield requestActivity.save();

    const translationActivity = this.store.createRecord(
      'translation-activity',
      {
        startDate: now,
        dueDate: translationRequest.translationDueDate,
        title: translationRequest.subject,
        subcase: this.translationSubcase,
        requestActivity: requestActivity,
        usedPieces: uploadedPieces,
        language: yield this.store.findRecordByUri(
          'language',
          CONSTANTS.LANGUAGES.FR
        ),
      }
    );
    yield translationActivity.save();

    this.translationSubcase.dueDate = translationRequest.translationDueDate;
    if (this.translationSubcase.hasDirtyAttributes) {
      yield this.translationSubcase.save();
    }

    const [files, outbox, mailSettings] = yield Promise.all([
      Promise.all(uploadedPieces.mapBy('file')),
      this.store.findRecordByUri('mail-folder', PUBLICATION_EMAIL.OUTBOX),
      this.store.queryOne('email-notification-setting'),
    ]);
    const mail = this.store.createRecord('email', {
      to: mailSettings.translationRequestToEmail,
      from: mailSettings.defaultFromEmail,
      folder: outbox,
      attachments: files,
      requestActivity: requestActivity,
      subject: translationRequest.subject,
      message: translationRequest.message,
    });
    yield mail.save();

    // PUBLICATION-STATUS
    yield this.publicationService.updatePublicationStatus(
      this.publicationFlow,
      CONSTANTS.PUBLICATION_STATUSES.TRANSLATION_REQUESTED
    );

    this.send('refresh');
    this.showTranslationRequestModal = false;
  }

  @dropTask
  *deleteRequest(requestActivity) {
    const deletePromises = [];

    const translationActivity = yield requestActivity.translationActivity;
    deletePromises.push(translationActivity.destroyRecord());

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

  @action
  openTranslationUploadModal() {
    this.showTranslationUploadModal = true;
  }

  @action
  closeTranslationUploadModal() {
    this.showTranslationUploadModal = false;
  }

  @action
  openTranslationRequestModal() {
    this.showTranslationRequestModal = true;
  }

  @action
  closeTranslationRequestModal() {
    this.showTranslationRequestModal = false;
  }
}
