import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';

export default class InProgressNotRoute extends Route {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  async model() {
    return this.store.query('publication-flow', {
      filter: {
        status: {
          id: CONFIG.publicationStatusToPublish.id,
        },
      },
      include: 'case,status',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }
}
