import PublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewTranslationRoute extends PublicationsOverviewBaseRoute {
  modelGetQueryFilter() {
    const filter = {
      status: {
        ':uri:': CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS,
      },
    };
    return filter;
  }
}
