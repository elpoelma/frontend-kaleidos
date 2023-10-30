import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class SendToVpModalComponent extends Component {
  @service store;
  @service conceptStore;
  @service intl;
  @service toaster;

  @tracked pgSubcasesWithPieces;
  @tracked dgSubcaseWithPieces;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    await Promise.all([this.loadSubcaseWithPieces(), this.loadDocumentTypes()]);
  });

  loadPiecesForSubcase = async (subcase) => {
    const latestAgendaActivity = await this.store.queryOne('agenda-activity', {
      'filter[subcase][:id:]': subcase.id,
      sort: '-start-date',
    });

    if (latestAgendaActivity) {
      const latestAgendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda-activity][:id:]': latestAgendaActivity.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });

      const pieces = await this.store.query('piece', {
        'filter[agendaitems][:id:]': latestAgendaitem.id,
        include: 'document-container.type,signed-piece,file',
      });
      return {
        subcase,
        pieces,
      };
    }
  };

  async loadSubcaseWithPieces() {
    this.decisionmakingFlow = await this.args.definitieveGoedkeuringSubcase
      .decisionmakingFlow;
    let dgSubcase = this.store.queryOne('subcase', {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      'filter[type][:uri:]': CONSTANTS.SUBCASE_TYPES.DEFINITIEVE_GOEDKEURING,
      sort: '-created',
    });

    let pgSubcases = this.store.queryAll('subcase', {
      'filter[decisionmaking-flow][:id:]': this.decisionmakingFlow.id,
      'filter[type][:uri:]': CONSTANTS.SUBCASE_TYPES.PRINCIPIELE_GOEDKEURING,
      sort: 'created',
    });

    [dgSubcase, pgSubcases] = await Promise.all([dgSubcase, pgSubcases]);

    [this.dgSubcaseWithPieces, this.pgSubcasesWithPieces] = await Promise.all([
      this.loadPiecesForSubcase(dgSubcase),
      Promise.all(pgSubcases.toArray().map(this.loadPiecesForSubcase)),
    ]);
  }

  sendToVP = task(async () => {
    const resp = await fetch(
      `/vlaams-parlement-sync/?uri=http://themis.vlaanderen.be/id/besluitvormingsaangelegenheid/${this.decisionmakingFlow.id}`,
      { headers: { Accept: 'application/vnd.api+json' }, method: 'POST' }
    );

    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-sending-to-VP'));
      return;
    } else {
      this.toaster.success(this.intl.t('case-was-sent-to-VP'));
    }

    this.args?.onClose();
  });

  async loadDocumentTypes() {
    this.documentTypes = await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.DOCUMENT_TYPES
    );

    const BESLISSINGSFICHE = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.BESLISSINGSFICHE
    );
    const ONTWERPDECREET = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.ONTWERPDECREET
    );
    const MEMORIE = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.MEMORIE
    );
    const NOTA = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.NOTA
    );
    const ADVIES = this.documentTypes.find(
      (type) => type.uri === CONSTANTS.DOCUMENT_TYPES.ADVIES
    );

    // Principiele goedkeuring
    this.subcaseSpecs = [
      { type: BESLISSINGSFICHE, wordRequired: false, signed: true },
      { type: ONTWERPDECREET, wordRequired: true, signed: false },
      { type: MEMORIE, wordRequired: true, signed: false },
      { type: NOTA, wordRequired: false, signed: false },
      { type: ADVIES, wordRequired: false, signed: false },
    ];

    // Definitieve goedkeuring
    this.dgkSpec = [
      { type: BESLISSINGSFICHE, wordRequired: false, signed: true },
      { type: ONTWERPDECREET, wordRequired: true, signed: true },
      { type: MEMORIE, wordRequired: true, signed: true },
      { type: NOTA, wordRequired: false, signed: false },
      { type: ADVIES, wordRequired: false, signed: false },
    ];
  }

  missingDocsForSubcase = (subcaseWithPieces) => {
    // We want to move this logic to the backend so it will always be
    // consistent with the actual data being sent.
    const formattedMissingFiles = [];
    const subcaseSpecs = [
      ...this.pgSubcasesWithPieces.map((subcaseWithPieces) => ({
        pieces: subcaseWithPieces.pieces,
        name:
          subcaseWithPieces.subcase.subcaseName ??
          // question: maybe we want to use the subcase-type concept instead?
          this.intl.t('principal-approval').toLowerCase(),
        spec: this.pgkSpec,
      })),
      {
        pieces: this.dgSubcaseWithPieces.pieces,
        name:
          this.dgSubcaseWithPieces.subcase.subcaseName ??
          // question: maybe we want to use the subcase-type concept instead?
          this.intl.t('definitive-approval').toLowerCase(),
        spec: this.dgkSpec,
      },
    ];
    for (const subcase of subcaseSpecs) {
      for (const docSpec of subcase.spec) {
        if (
          docSpec.signed &&
          !hasSignedPieceOfType(subcase.pieces, docSpec.type)
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} (ondertekend)`
          );
        } else if (
          !hasPieceOfType(
            subcase.pieces,
            docSpec.type,
            'application/pdf; charset=binary'
          )
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name}`
          );
        }

        if (
          docSpec.wordRequired &&
          !hasPieceOfType(
            subcase.pieces,
            docSpec.type,
            // question: is this enough for all Word documents?
            // or do we need to check more mimeTypes?
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=binary'
          )
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} goedkeuring (in Word)`
          );
        }
      }
    }

    return formattedMissingFiles;
  };

  get missingDocs() {
    // We want to move this logic to the backend so it will always be
    // consistent with the actual data being sent.
    const formattedMissingFiles = [];
    const subcaseSpecs = [
      ...this.pgSubcasesWithPieces.map((subcaseWithPieces) => ({
        pieces: subcaseWithPieces.pieces,
        name:
          subcaseWithPieces.subcase.subcaseName ??
          // question: maybe we want to use the subcase-type concept instead?
          this.intl.t('principal-approval').toLowerCase(),
        spec: this.pgkSpec,
      })),
      {
        pieces: this.dgSubcaseWithPieces.pieces,
        name:
          this.dgSubcaseWithPieces.subcase.subcaseName ??
          // question: maybe we want to use the subcase-type concept instead?
          this.intl.t('definitive-approval').toLowerCase(),
        spec: this.dgkSpec,
      },
    ];
    for (const subcase of subcaseSpecs) {
      for (const docSpec of subcase.spec) {
        if (
          docSpec.signed &&
          !hasSignedPieceOfType(subcase.pieces, docSpec.type)
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} (ondertekend)`
          );
        } else if (
          !hasPieceOfType(
            subcase.pieces,
            docSpec.type,
            'application/pdf; charset=binary'
          )
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name}`
          );
        }

        if (
          docSpec.wordRequired &&
          !hasPieceOfType(
            subcase.pieces,
            docSpec.type,
            // question: is this enough for all Word documents?
            // or do we need to check more mimeTypes?
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document; charset=binary'
          )
        ) {
          formattedMissingFiles.push(
            `${docSpec.type.altLabel} van ${subcase.name} goedkeuring (in Word)`
          );
        }
      }
    }

    return formattedMissingFiles;
  }
}

function findPieceOfType(pieces, type, mimeType) {
  return pieces.find((piece) => {
    const documentContainer = piece.belongsTo('documentContainer').value();
    const pieceType = documentContainer.belongsTo('type').value();

    if (mimeType) {
      const pieceMimeType = piece.belongsTo('file').value().format;
      return pieceType === type && pieceMimeType === mimeType;
    } else {
      return pieceType === type;
    }
  });
}

function hasPieceOfType(pieces, type, mimeType) {
  return !!findPieceOfType(pieces, type, mimeType);
}

function hasSignedPieceOfType(pieces, type, mimeType) {
  const foundPiece = findPieceOfType(pieces, type, mimeType);

  return !!foundPiece?.belongsTo('signedPiece').value();
}
