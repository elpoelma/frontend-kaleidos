import Component from '@glimmer/component';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { setAgendaItemsPriority } from 'fe-redpencil/utils/agenda-item-utils';

export default class AgendaSidebar extends Component {
  @service sessionService;
  @service('current-session') currentSessionService;
  @service agendaService;
  @alias('sessionService.selectedAgendaItem') selectedAgendaItem;

  @tracked isShowingChanges = false;
  @tracked isReAssigningPriorities = false;

  classNames = ['vlc-agenda-items'];
  overviewEnabled = null;
  dragHandleClass = '.vlc-agenda-detail-sidebar__sub-item';

  @action
  selectAgendaItemAction(agendaitem) {
    this.args.selectAgendaItem(agendaitem);
  }

  @action
  toggleChangesOnly() {
    this.isShowingChanges = !this.isShowingChanges;
  }

  @action
  reorderItems(itemModels) {
    const isEditor = this.currentSessionService.isEditor;
    const isDesignAgenda = this.args.currentAgenda.isDesignAgenda;
    this.isReAssigningPriorities = true;
    setAgendaItemsPriority(itemModels, isEditor, isDesignAgenda);
    this.isReAssigningPriorities = false;
  }
}
