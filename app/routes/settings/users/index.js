import Route from '@ember/routing/route';
import { isPresent } from '@ember/utils';
import { inject as service } from '@ember/service';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import parseDate from 'frontend-kaleidos/utils/parse-date-search-param';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';

export default class SettingsUsersIndexRoute extends Route {
  @service store;

  queryParams = {
    filter: {
      refreshModel: true,
    },
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
    organizations: {
      refreshModel: true,
      as: 'organisaties',
    },
    dateFrom: {
      refreshModel: true,
      as: 'vanaf',
    },
    dateTo: {
      refreshModel: true,
      as: 'tot',
    },
  };

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  model(params) {
    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const filter = {};

    if (params.organizations.length) {
      filter.memberships = {
        organization: {
          ':id:': params.organizations.join(','),
        },
      };
    }

    if (params.dateFrom) {
      filter['login-activity'] = {
        ':gte:start-date': startOfDay(parseDate(params.dateFrom)).toISOString(),
      };
    }

    if (params.dateTo) {
      filter['login-activity'] = {
        ':lte:start-date': endOfDay(parseDate(params.dateTo)).toISOString(),
      };
    }

    const options = {
      filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: 'memberships.organization,memberships.role,memberships.status,status,login-activity',
    };

    if (isPresent(params.filter)) {
      options['filter'] = params.filter;
    }

    this.lastParams.commit();

    return this.store.query('user', options);
  }

  async setupController(controller) {
    super.setupController(...arguments);

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
    controller.searchTextBuffer = this.lastParams.committed.filter;

    const organizationIds = this.lastParams.committed.organizations;
    controller.selectedOrganizations = await Promise.all(organizationIds.map((id) => this.store.findRecord('user-organization', id)));

    controller.dateFromBuffer = parseDate(this.lastParams.committed.dateFrom);
    controller.dateToBuffer = parseDate(this.lastParams.committed.dateTo);
  }
}
