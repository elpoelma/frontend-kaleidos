import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import { task, timeout } from 'ember-concurrency';
import { isPresent, isEmpty } from '@ember/utils';
import ENV from 'frontend-kaleidos/config/environment';
import { DOCUMENT_DELETE_UNDO_TIME_MS } from 'frontend-kaleidos/config/config';
import { deleteDocumentContainer, deletePiece } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DocumentsDocumentCardComponent extends Component {
  /**
   * A document card with expandable document history .
   * By default uses the @piece argument, but can fall back to @documentContainer when
   * no piece is provided. In this case the latest version within the container will be shown.
   *
   * @argument piece: a Piece object
   * @argument documentContainer: a DocumentContainer object
   * @argument didDeleteContainer: action triggered when a container has been deleted
   * @argument onOpenUploadModal: action triggered before the modal to upload a new version opens
   * @argument onAddPiece: action triggered when a new version has been added
   * @argument bordered: determines if the card has a border
   * @argument label: used to determine what label should be used with the date
   * @argument decisionActivity: if a decision-activity is linked (specifically via agenda-item-treatment)
   */
  @service store;
  @service currentSession;
  @service toaster;
  @service intl;
  @service pieceAccessLevelService;
  @service signatureService;

  @tracked isOpenUploadModal = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isEditingPiece = false;

  @tracked piece;
  @tracked documentContainer;
  @tracked isDraftAccessLevel;
  @tracked signFlow;
  @tracked signMarkingActivity;

  @tracked uploadedFile;
  @tracked newPiece;
  @tracked defaultAccessLevel;
  @tracked pieces = A();

  @tracked hasSignFlow = false;
  @tracked hasMarkedSignFlow = false;

  @tracked altLabel;

  constructor() {
    super(...arguments);
    this.loadCodelists.perform();
    this.loadPieceRelatedData.perform();
    this.loadFiles.perform();
    this.signaturesEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
  }

  get label() {
    if (isPresent(this.args.label)) {
      return this.intl.t(this.args.label);
    }
    if (isPresent(this.altLabel)) {
      return this.altLabel;
    }
    return this.intl.t('uploaded-at');
  }

  get bordered() {
    return isPresent(this.args.bordered) ? this.args.bordered : true;
  }

  get mayCreateSignMarkingActivity() {
    return !this.signMarkingActivity
      && this.signaturesEnabled
      && this.currentSession.may('manage-signatures')
  }

  get mayShowEditDropdown() {
    return (
      this.args.isEditable
      && this.currentSession.may('manage-documents')
      && this.markDocumentForSigning.isIdle
      && this.deleteMarkedSignFlow.isIdle
      && this.loadSignatureRelatedData.isIdle
      && this.loadSignatureRelatedData.performCount > 0
      && (!this.hasSignFlow || this.hasMarkedSignFlow)
    );
  }

  get mayShowUploadNewVersion() {
    return (
      !this.args.hideUpload
        && (!this.hasSignFlow
            || (this.hasMarkedSignFlow && !!this.args.decisionActivity))
    );
  }

  get showSignatureLoader() {
    return this.loadSignatureRelatedData.isRunning ||
           this.markDocumentForSigning.isRunning ||
           this.deleteMarkedSignFlow.isRunning;
  }

  get showSignaturePill() {
    const isEnabled = !isEmpty(ENV.APP.ENABLE_SIGNATURES);
    const hasPermission = this.currentSession.may('manage-signatures');
    return isEnabled && hasPermission;
  }

  @task
  *loadCodelists() {
    this.defaultAccessLevel = yield this.store.findRecordByUri(
      'concept',
      CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );
  }

  @task
  *loadPieceRelatedData() {
    const loadPiece = (id) =>
      this.store.queryOne('piece', {
        'filter[:id:]': id,
        include: 'document-container,document-container.type,access-level',
      });
    const loadReportPiecePart = (id) =>
      this.store.queryOne('piece-part', {
        'filter[report][:id:]': id,
      });
    const loadMinutesPiecePart = (id) =>
      this.store.queryOne('piece-part', {
        'filter[minutes][:id:]': id,
      });
    if (this.args.piece) {
      this.piece = this.args.piece; // Assign what we already have, so that can be rendered already
      this.piece = yield loadPiece(this.piece.id);
      this.documentContainer = yield this.piece.documentContainer;
      yield this.loadVersionHistory.perform();
      // check for alternative label
      const modelName = this.args.piece.constructor.modelName;
      if (!isPresent(this.args.label)) {
        let piecePart;
        if (modelName === 'report') {
          piecePart = yield loadReportPiecePart(this.piece.id);
        } else if (modelName === 'minutes') {
          piecePart = yield loadMinutesPiecePart(this.piece.id);
        }
        this.altLabel = piecePart ? this.intl.t('created-on') : null;
      }
    } else if (this.args.documentContainer) {
      // This else does not seem used (no <Documents::DocumentCard> that passes this arg)
      this.documentContainer = this.args.documentContainer;
      yield this.loadVersionHistory.perform();
      const lastPiece = this.reverseSortedPieces.lastObject;
      this.piece = yield loadPiece(lastPiece.id);
    } else {
      throw new Error(
        `You should provide @piece or @documentContainer as an argument to ${this.constructor.name}`
      );
    }
    // When this task is done, we can trigger the other less important tasks
    this.loadAccessLevelRelatedData.perform();
    this.loadPublicationFlowRelatedData.perform();
    this.loadSignatureRelatedData.perform();
  }

  @task
  *loadFiles() {
    const sourceFile = yield this.args.piece.file;
    yield sourceFile?.derived;
  }


  @task
  *loadAccessLevelRelatedData() {
    const accessLevel = yield this.piece.accessLevel;
    const context = this.args.agendaContext || {};
    this.isDraftAccessLevel = yield this.pieceAccessLevelService.isDraftAccessLevel(accessLevel, context, this.piece);
  }

  @task
  *loadPublicationFlowRelatedData() {
    if (this.currentSession.may('manage-publication-flows')) {
      const publicationFlow = yield this.piece.publicationFlow;
      yield publicationFlow?.identification;
    }
  }

  @task
  *loadSignatureRelatedData() {
    this.signMarkingActivity = yield this.args.piece.belongsTo('signMarkingActivity').reload();
    const signSubcase = yield this.signMarkingActivity?.signSubcase;
    this.signFlow = yield signSubcase?.signFlow;
    this.hasSignFlow = yield this.signatureService.hasSignFlow(this.piece);
    this.hasMarkedSignFlow = yield this.signatureService.hasMarkedSignFlow(this.piece);
  }

  @task
  *loadVersionHistory() {
    this.pieces = yield this.documentContainer.hasMany('pieces').reload();
    for (const piece of this.pieces.toArray()) {
      yield piece.belongsTo('accessLevel').reload();
    }
  }

  get sortedPieces() {
    return A(sortPieces(this.pieces.toArray()).reverse());
  }

  get reverseSortedPieces() {
    return this.sortedPieces.slice(0).reverse(); // slice(0) as a hack to create a new array, since "reverse" happens in-place
  }

  get visiblePieces() {
    const idx = this.reverseSortedPieces.indexOf(this.piece) + 1;
    return A(this.reverseSortedPieces.slice(idx));
  }

  @action
  async openUploadModal() {
    if (this.args.onOpenUploadModal) {
      // opening model depending on calculations made in parent
      const shouldOpen = await this.args.onOpenUploadModal();
      if (shouldOpen === false) { // explicit checking on boolean
        return;
      }
    }
    this.isOpenUploadModal = true;
  }

  @task
  *uploadPiece(file) {
    yield this.loadVersionHistory.perform();
    const previousPiece = this.sortedPieces.lastObject;
    const previousAccessLevel = yield previousPiece.accessLevel;
    const now = new Date();
    this.newPiece = this.store.createRecord(this.args.pieceSubtype ?? 'piece', {
      created: now,
      modified: now,
      file: file,
      previousPiece: previousPiece,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      documentContainer: this.documentContainer,
    });
    this.newPiece.name = new VRDocumentName(
      previousPiece.name
    ).withOtherVersionSuffix(this.sortedPieces.length);
  }

  @task
  *addPiece() {
    if (this.signFlow) {
      const status = yield this.signFlow.belongsTo('status').reload();
      if (status.uri !== CONSTANTS.SIGNFLOW_STATUSES.MARKED) {
        yield this.deleteUploadedPiece.perform();
        yield this.loadPieceRelatedData.perform();
        this.toaster.error(
          this.intl.t('sign-flow-was-sent-while-you-were-editing-could-not-add-new-version'),
          this.intl.t('action-could-not-be-executed-title'),
        );
        this.isOpenUploadModal = false;
        return;
      }
    }

    try {
      this.newPiece.name = this.newPiece.name.trim();
      yield this.args.onAddPiece(this.newPiece, this.signFlow);
      this.pieceAccessLevelService.updatePreviousAccessLevel(this.newPiece);
      this.loadVersionHistory.perform();
      this.newPiece = null;
      this.isOpenUploadModal = false;
    } catch (error) {
      yield this.deleteUploadedPiece.perform();
      this.isOpenUploadModal = false;
      throw error;
    }
  }

  @task
  *deleteUploadedPiece() {
    if (this.newPiece) {
      this.pieces.removeObject(this.newPiece);
      yield deletePiece(this.newPiece);
      this.newPiece = null;
    }
  }

  @task
  *cancelUploadPiece() {
    yield this.deleteUploadedPiece.perform();
    this.isOpenUploadModal = false;
  }

  @action
  deleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = true;
  }

  @action
  cancelDeleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  async verifyDeleteDocumentContainer() {
    if (this.signFlow) {
      const status = await this.signFlow.belongsTo('status').reload();
      if (status.uri !== CONSTANTS.SIGNFLOW_STATUSES.MARKED) {
        await this.loadPieceRelatedData.perform();
        this.isOpenVerifyDeleteModal = false;
        this.toaster.error(
          this.intl.t('sign-flow-was-sent-while-you-were-editing-could-not-delete'),
          this.intl.t('action-could-not-be-executed-title'),
        );
        return;
      }
    }

    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.deleteDocumentContainerWithUndo.cancelAll();
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deleteDocumentContainerWithUndo.perform();
    this.isOpenVerifyDeleteModal = false;
  }

  @task
  *deleteDocumentContainerWithUndo() {
    yield timeout(DOCUMENT_DELETE_UNDO_TIME_MS);
    if (this.signFlow) {
      yield this.signatureService.removeSignFlow(this.signFlow);
    }
    yield deleteDocumentContainer(this.documentContainer);
    this.args.didDeleteContainer?.(this.documentContainer);
  }

  @task
  *deleteMarkedSignFlow() {
    const status = yield this.signFlow.belongsTo('status').reload();
    if (status.uri !== CONSTANTS.SIGNFLOW_STATUSES.MARKED) {
      this.toaster.error(
        this.intl.t('sign-flow-was-sent-cannot-stop-it'),
        this.intl.t('action-could-not-be-executed-title'),
      );
      yield this.loadPieceRelatedData.perform();
      return;
    }
    yield this.signatureService.removeSignFlow(this.signFlow);
    yield this.loadPieceRelatedData.perform();
  }

  @task
  *markDocumentForSigning() {
    yield this.signatureService.markDocumentForSignature(this.piece, this.args.decisionActivity);
    yield this.loadPieceRelatedData.perform();
  }

  @action
  changeAccessLevel(accessLevel) {
    this.piece.accessLevel = accessLevel;
  }

  @action
  async saveAccessLevel() {
    // TODO make sure not to overwrite things
    await this.piece.save();
    await this.pieceAccessLevelService.updatePreviousAccessLevels(this.piece);
    await this.loadPieceRelatedData.perform();
  }

  @action
  changeAccessLevelOfPiece(piece, accessLevel) {
    piece.accessLevel = accessLevel;
  }

  @action
  async saveAccessLevelOfPiece(piece) {
    await piece.save();
    await this.pieceAccessLevelService.updatePreviousAccessLevels(piece);
  }

  @action
  async reloadAccessLevel() {
    await this.loadPieceRelatedData.perform();
  }

  canViewConfidentialPiece = async () => {
    return await this.pieceAccessLevelService.canViewConfidentialPiece(this.args.piece);
  }

  canViewSignedPiece = async () => {
    if (this.currentSession.may('manage-signatures')) {
      return await this.signatureService.canManageSignFlow(this.args.piece);
    }
    return false;
  }

  @action
  async cancelEditPiece() {
    await this.loadPieceRelatedData.perform();
    this.isEditingPiece = false;
  }
}
