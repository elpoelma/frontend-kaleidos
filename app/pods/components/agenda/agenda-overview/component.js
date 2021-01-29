import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setAgendaitemsPriority } from 'fe-redpencil/utils/agendaitem-utils';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';

class AgendaitemGroup {
  @tracked mandatees;
  @tracked agendaitems;

  constructor(mandatees, firstAgendaItem) {
    this.mandatees = mandatees;
    this.agendaitems = A([firstAgendaItem]);
  }

  get sortedMandatees() {
    return this.mandatees.sortBy('priority');
  }

  async itemBelongsToThisGroup(agendaitem) {
    const mandatees = await agendaitem.get('mandatees');
    mandatees.sortBy('priority');
    return mandatees.mapBy('id').join() === this.sortedMandatees.mapBy('id').join(); // Compare by value
  }
}

export default class AgendaOverview extends Component {
  /**
   * @argument notas
   * @argument announcements
   * @argument currentAgenda
   */
  @service sessionService;
  @service agendaService;

  @service('current-session') currentSessionService;

  dragHandleClass = '.ki-drag-handle-2';

  @tracked isEditingOverview = null;
  @tracked isShowingChanges = null;
  @tracked showLoader = null;
  @tracked groupedNotas;

  constructor() {
    super(...arguments);
    this.groupNotasOnGroupName.perform(this.regularNotas);
  }

  get approvalNotas() {
    return this.args.notas.filterBy('isApproval', true);
  }

  get regularNotas() {
    return this.args.notas.filterBy('isApproval', false);
  }

  @action
  selectAgendaitemAction(agendaitem) {
    this.selectAgendaitem(agendaitem);
  }

  @action
  async setFormallyOkAction(agendaitem, formallyOkUri) {
    this.showLoader = true;
    agendaitem.formallyOk = formallyOkUri;
    await agendaitem
      .save()
      .catch(() => {
        this.toaster.error();
      })
      .finally(() => {
        this.showLoader = false;
      });
  }

  @action
  toggleIsEditingOverview() {
    this.isEditingOverview = !this.isEditingOverview;
  }

  @action
  toggleChangesOnly() {
    this.isShowingChanges = ! this.isShowingChanges;
  }

  @action
  async reorderItems(itemModels) {
    const isEditor = this.currentSessionService.isEditor;
    const isDesignAgenda = this.args.currentAgenda.isDesignAgenda;
    this.showLoader = true;
    await setAgendaitemsPriority(itemModels, isEditor, isDesignAgenda);
    this.showLoader = false;
  }

  @task
  *groupNotasOnGroupName(agendaitems) {
    const agendaitemsArray = agendaitems.toArray();
    const agendaitemGroups = [];
    let currentAgendaitemGroup;
    for (const agendaitem of agendaitemsArray) {
      if (currentAgendaitemGroup && (yield currentAgendaitemGroup.itemBelongsToThisGroup(agendaitem))) {
        currentAgendaitemGroup.agendaitems.pushObject(agendaitem);
      } else {
        const mandatees = yield agendaitem.get('mandatees');
        mandatees.sortBy('priority');
        currentAgendaitemGroup = new AgendaitemGroup(mandatees, agendaitem);
        agendaitemGroups.push(currentAgendaitemGroup);
      }
    }
    this.groupedNotas = agendaitemGroups;
  }
}
