import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'frontend-kaleidos/utils/config';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';
import moment from 'moment';

export default class PublicationsIndexController extends Controller {
  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  @service publicationService;

  page = 0;
  size = 25;
  sort = '-created';
  sizeOptions = Object.freeze([5, 10, 25, 50, 100, 200]);
  urgencyLevels =  CONFIG.URGENCY_LEVELS;

  @tracked tableColumnDisplayOptions = JSON.parse(localStorage.getItem('tableColumnDisplayOptions'))
    || tableColumns.reduce((accumulator, currentValue) => {
      accumulator[currentValue.keyName] = currentValue.showByDefault;
      return accumulator;
    }, {});
  tableColumns = tableColumns;

  @tracked showTableDisplayOptions = false;
  @tracked isShowPublicationModal = false;
  @tracked showLoader = false;
  @tracked isShowPublicationFilterModal = false;

  @tracked publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  @action
  closeFilterTableModal() {
    localStorage.setItem('tableColumnDisplayOptions', JSON.stringify(this.tableColumnDisplayOptions));
    this.showTableDisplayOptions = false;
  }

  @action
  changeColumnDisplayOptions(options) {
    this.tableColumnDisplayOptions = options;
    localStorage.setItem('tableColumnDisplayOptions', JSON.stringify(this.tableColumnDisplayOptions));
  }

  @action
  openColumnDisplayOptionsModal() {
    this.showTableDisplayOptions = true;
  }

  @action
  closeColumnDisplayOptionsModal() {
    this.showTableDisplayOptions = false;
  }

  @action
  showPublicationModal() {
    this.isShowPublicationModal = true;
  }

  @action
  closePublicationModal() {
    this.isShowPublicationModal = false;
  }

  @action
  async saveNewPublication(publication) {
    const newPublication = await this.createNewPublication(publication.number, publication.suffix, publication.longTitle, publication.shortTitle);
    this.closePublicationModal();
    this.transitionToRoute('publications.publication', newPublication.get('id'));
  }

  @action
  showFilterModal() {
    this.isShowPublicationFilterModal = true;
  }

  @action
  cancelPublicationsFilter() {
    this.isShowPublicationFilterModal = false;
  }

  @action
  savePublicationsFilter(publicationFilter) {
    this.publicationFilter = publicationFilter;
    localStorage.setItem('publicationFilter', this.publicationFilter.toString());
    this.isShowPublicationFilterModal = false;
    this.send('refreshModel');
  }

  async createNewPublication(publicationNumber, publicationSuffix, title, shortTitle) {
    const creationDatetime = new Date();
    const caze = this.store.createRecord('case', {
      title,
      shortTitle,
      created: creationDatetime,
    });
    await caze.save();

    const toPublishStatus = (await this.store.queryOne('publication-status',  {
      'filter[:id:]': CONFIG.publicationStatusToPublish.id,
    }));

    const publicationFlow = this.store.createRecord('publication-flow', {
      publicationNumber,
      publicationSuffix,
      case: caze,
      created: creationDatetime,
      openingDate: new Date(),
      status: toPublishStatus,
      modified: creationDatetime,
    });
    await publicationFlow.save();
    return publicationFlow;
  }
}
