import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const PROOF_STATUSES_URIS = [
  CONSTANTS.PUBLICATION_STATUSES.PROOF_REQUESTED,
  CONSTANTS.PUBLICATION_STATUSES.PROOF_RECALLED,
];

export default class PublicationsOverviewProofRoute extends PublicationsOverviewBaseRoute {
  defaultColumns = [
    'isUrgent',
    'publicationNumber',
    'numacNumber',
    'shortTitle',
    'numberOfPages',
    'proofRequestDate',
    'publicationDueDate',
  ];
  tableConfigStorageKey = "publication-table.proof";

  beforeModel() {
    super.beforeModel(...arguments)
    const proofStatuses = this.store.peekAll('publication-status').filter((it) => {
      return PROOF_STATUSES_URIS.includes(it.uri);
    });
    this.filter = {
      status: {
        ':id:': proofStatuses.mapBy('id').join(','),
      },
    };
  }

  renderTemplate(controller) {
    this.render('publications.overview.all', {
      controller: controller
    });
  }
}