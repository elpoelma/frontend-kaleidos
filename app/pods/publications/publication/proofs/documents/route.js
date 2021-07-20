import Route from '@ember/routing/route';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

import { Model } from './controller';

export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  async model() {
    this.publicationSubcase = this.modelFor('publications.publication.proofs');

    const queryProperties = {
      include: [
        'file',
        'publication-subcase-correction-for'
      ].join(','),
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
    };

    // Fetching all documents for the publication-subcase is split into multiple requests on purpose.
    // It seems when using a single request on publication-subcase with an include query param
    // for pieces (via the different paths) ember-data does not catch the inverse relation
    // from piece to publication-subcase. This results in an additional request per piece
    // when piece.publicationSubcaseCorrectionFor is used in the template.

    // Source documents uploaded on the publication subcase
    const sourceDocumentsPromise = this.store.query('piece', {
      'filter[publication-subcase-source-for][:id:]': this.publicationSubcase.id,
      ...queryProperties,
    });

    // Correction documents uploaded on the publication subcase
    const correctionDocumentsPromise = this.store.query('piece', {
      'filter[publication-subcase-correction-for][:id:]': this.publicationSubcase.id,
      ...queryProperties,
    });

    // Received proofing documents generated by a proofing-activity
    const receivedProofingDocumentsPromise = this.store.query('piece', {
      'filter[proofing-activity-generated-by][subcase][:id:]': this.publicationSubcase.id,
      ...queryProperties,
    });

    const decisionsPromise = this.store.query('decision', {
      'filter[publication-activity][subcase][:id:]': this.publicationSubcase.id,
      sort: 'publication-date',
    });

    // disable lint: decisions is constant, but pieces is variable
    // eslint-disable-next-line prefer-const
    let [decisions, ...pieces] = await Promise.all([
      decisionsPromise,
      correctionDocumentsPromise,
      sourceDocumentsPromise,
      receivedProofingDocumentsPromise
    ]);
    pieces = pieces.flatMap((pieces) => pieces.toArray());
    pieces = new Set(pieces); // using set to ensure a collection of unique pieces
    pieces = [...pieces];

    return new Model({
      pieces: pieces,
      decisions: decisions,
    });
  }

  afterModel() {
    // translationSubcase.publicationFlow causes additional network request
    // while the request is already made in 'publications.publication'
    this.publicationFlow = this.modelFor('publications.publication');
  }

  async setupController(controller) {
    super.setupController(...arguments);

    controller.publicationFlow = this.publicationFlow;
    controller.publicationSubcase = this.publicationSubcase;
    controller.selectedPieces = [];
    controller.initSort();
  }
}
