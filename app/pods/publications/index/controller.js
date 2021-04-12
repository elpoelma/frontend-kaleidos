import Controller from '@ember/controller';
import {
  action,
  set
} from '@ember/object';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class PublicationsIndexController extends Controller {
  @tracked filterTableColumnOptionKeys = JSON.parse(localStorage.getItem('filterTableColumnOptionKeys'))
    || {
      caseNameFilterOption: true,
      publicationNumberFilterOption: true,
      regulationTypeFilterOption: true,
      onMeetingFilterOption: true,
      requestedPublicationDateFilterOption: true,
      finalPublicationDateFilterOption: true,
      publicationDateFilterOption: true,
      numacNumberFilterOption: true,
      caseManagerFilterOption: true,
      lastEditedFilterOption: true,
      lastEditedByFilterOption: true,
      withdrawnDateFilterOption: true,
      pauseDateFilterOption: true,
      translateRequestsFilterOption: true,
      signRequestsFilterOption: true,
      publishPreviewRequestsFilterOption: true,
      speedProcedureFilterOption: true,
      commentFilterOption: true,
      fromDesignAgendaFilterOption: true,
    };

  @tracked showFilterTableModal = false;
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

  sizeOptions = Object.freeze([5, 10, 25, 50, 100, 200]);
  urgencyLevels =  CONFIG.URGENCY_LEVELS;

  @tracked page = 0;
  @tracked size = 25;
  @tracked sort = '-created';

  @action
  navigateToPublication(publicationFlowRow) {
    this.transitionToRoute('publications.publication', publicationFlowRow.get('id'));
  }

  @action
  filterTables() {
    this.showFilterTableModal = true;
  }

  @action
  closeFilterTableModal() {
    localStorage.setItem('filterTableColumnOptionKeys', JSON.stringify(this.filterTableColumnOptionKeys));
    this.showFilterTableModal = false;
  }

  @action
  toggleFilterOption(event) {
    const tempArr = this.get('filterTableColumnOptionKeys');
    set(tempArr, event.target.name, !tempArr[event.target.name]);
    this.set('filterTableColumnOptionKeys', tempArr);
  }

}
