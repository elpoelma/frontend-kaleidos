import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class CasesIndexController extends Controller {
  // Services
  @service router;
  @service store;

  queryParams = [
    {
      page: {
        type: 'number',
      },
    },
    {
      size: {
        type: 'number',
      },
    },
    {
      sort: {
        type: 'string',
      },
    },
    {
      showArchivedOnly: {
        type: 'boolean',
      },
    }
  ];
  page = 0;
  size = PAGINATION_SIZES[2];

  sort = '-opened';
  showArchivedOnly = false;
  @tracked isLoadingModel;
  @tracked selectedCase = null;
  @tracked caseToEdit = null;
  @tracked showEditCaseModal = false;
  @tracked isNotArchived = false;
  @tracked isArchivingCase = false;

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  async openEditCaseModal(_case) {
    this.caseToEdit = await _case;
    this.showEditCaseModal = true;
  }

  @action
  closeEditCaseModal() {
    this.showEditCaseModal = false;
    this.caseToEdit = null;
  }

  @action
  async saveEditCase(_case) {
    await _case.save();
    this.closeEditCaseModal();
  }

  @action
  async archiveCase() {
    const caseModel = await this.store.findRecord('case', this.selectedCase.get('id')); // this.selectedCase is a proxy
    const decisionmakingFlow = await caseModel.decisionmakingFlow;
    decisionmakingFlow.closed = new Date();
    await decisionmakingFlow.save();
    this.selectedCase = null;
    this.router.refresh();
    this.isArchivingCase = false;
  }

  @action
  async unarchiveCase(_case) {
    const caseModel = await this.store.findRecord('case', _case.get('id')); // _case is a proxy
    const decisionmakingFlow = await caseModel.decisionmakingFlow;
    decisionmakingFlow.closed = null;
    await decisionmakingFlow.save();
    this.router.refresh();
  }

  @action
  requestArchiveCase(_case) {
    this.selectedCase = _case;
    this.isArchivingCase = true;
  }

  @action
  cancelArchiveCase() {
    this.isArchivingCase = false;
    this.selectedCase = null;
  }

  @action
  navigateToDecisionmakingFlow(decisionmakingFlow) {
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }
}
