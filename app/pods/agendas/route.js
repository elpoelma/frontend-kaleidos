import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendasRoute extends Route {
  @service store;
  @service router;
  @service('session') simpleAuthSession;

  dateRegex = /^(?:(\d{1,2})[/-])??(?:(\d{1,2})[/-])?(\d{4})$/;

  queryParams = {
    filter: {
      refreshModel: true,
    },
    page: {
      refreshModel: true,
    },
    size: {
      refreshModel: true,
    },
    sort: {
      refreshModel: true,
    },
  };

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  async model(params) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: 'status,created-for,created-for.kind',
      'filter[:has-no:next-version]': true,
    };

    if (params.filter) {
      const date = params.filter.split('/').join('-');
      const match = this.dateRegex.exec(date);

      if (match) {
        const [, day, month, year] = match.map(num => parseInt(num, 10));
        const from = new Date(year, (month - 1) || 0, day || 1);
        const to = new Date(from);
        if (day) {
          to.setDate(day + 1);
        } else if (month) {
          to.setMonth(month); // months are 0-indexed, no +1 required
        } else {
          to.setYear(year + 1);
        }

        queryParams['filter[created-for][:gte:planned-start]'] = from.toISOString();
        queryParams['filter[created-for][:lte:planned-start]'] = to.toISOString();
      }
    }

    return await this.store.query('agenda', queryParams);
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });

   // only bubble loading event when transitioning between tabs
   // to enable loading template to be shown
   if (transition.from && transition.to) {
     return transition.from.name != transition.to.name;
   } else {
     return true;
   }
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
