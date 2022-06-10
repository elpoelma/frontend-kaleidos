import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import { inject as service } from '@ember/service';
import {
  getPublicationStatusPillKey,
  getPublicationStatusPillStep
} from 'frontend-kaleidos/utils/publication-auk';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { warn } from '@ember/debug';

export default class PublicationFlowSearchRoute extends Route {
  @service store;
  @service router;
  @service currentSession;

  queryParams = {
    regulationTypeIds: {
      refreshModel: true,
      as: 'types_regelgeving',
    },
    publicationStatusIds: {
      refreshModel: true,
      as: 'statussen',
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
  };

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async beforeModel() {
    if (!this.currentSession.may('search-publication-flows')) {
      this.router.transitionTo('agendas');
      return;
    }
    this.publicationStatuses = await this.store.query('publication-status', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    this.regulationTypes = await this.store.query('regulation-type', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = {...searchParams, ...filterParams};

    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const textSearchFields = ['title', 'shortTitle', 'identification', 'numacNumbers'];

    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {};

    const searchText = isEmpty(params.searchText) ? '*' : params.searchText;
    filter[searchModifier + textSearchKey] = searchText;

    if (!isEmpty(params.mandatees)) {
      filter['mandateeFirstNames,mandateeFamilyNames'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.date)) {
      const from = moment(params.date, 'DD-MM-YYYY').startOf('day');
      const to = moment(params.date, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte,gte:' + params.publicationDateTypeKey] = [
        to.utc().toISOString(),
        from.utc().toISOString(),
      ].join(',');
    }

    // ":terms:" required to be able to filter on multiple values as "OR"
    if (!isEmpty(params.regulationTypeIds)) {
      filter[':terms:regulationTypeId'] = params.regulationTypeIds.join(',');
    }

    if (!isEmpty(params.publicationStatusIds)) {
      filter[':terms:statusId'] = params.publicationStatusIds;
    }

    this.lastParams.commit();

    return search('publication-flows', params.page, params.size, params.sort, filter, (searchData) => {
      const entry = searchData.attributes;
      entry.id = searchData.id;
      this.postProcessSearchEntry(entry);
      return entry;
    });
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.publicationStatuses = this.publicationStatuses.toArray();
    controller.regulationTypes = this.regulationTypes.toArray();

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    return true;
  }

  postProcessSearchEntry(attributes) {
    // post-process publication-status
    let statusId = attributes.statusId;
    if (statusId) {
      const hasMultipleStatuses = Array.isArray(statusId);
      if (hasMultipleStatuses) {
        // due to inserts of double statuses we take the first one to not break the search
        statusId = statusId.firstObject;
        warn(`Publication flow ${attributes.id} contains multiple statusses in search index`, !hasMultipleStatuses, { id: 'search.invalid-data' });
      }
      const status = this.publicationStatuses.find((status) => status.id === statusId);
      attributes.status = status;
      attributes.statusPillKey = getPublicationStatusPillKey(status);
      attributes.statusPillStep = getPublicationStatusPillStep(status);
    }
    // post-process numac numbers
    if (!attributes.numacNumbers) {
      attributes.numacNumbers = [];
    } else if (!Array.isArray(attributes.numacNumbers)) {
      attributes.numacNumbers = [attributes.numacNumbers];
    }
  }
}