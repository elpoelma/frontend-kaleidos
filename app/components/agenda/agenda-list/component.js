import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default Component.extend(isAuthenticatedMixin, {
  sessionService: inject(),
  agendaService: inject(),
  classNames: ['vlc-agenda-items'],
  classNameBindings: ['getClassNames'],
  selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
  agendaitems: null,
  isEditingOverview: null,
  isShowingChanges: null,
  dragHandleClass: ".vlc-agenda-items__sub-item",

  getClassNames: computed('selectedAgendaItem', function() {
    if (this.get('selectedAgendaItem')) {
      return 'vlc-agenda-items--small';
    } else {
      return 'vl-u-spacer-extended-l vlc-agenda-items--spaced';
    }
  }),

  reAssignPriorities: task(function*(agendaitems) {
    yield agendaitems.map((item) => {
      if (isPresent(item.changedAttributes().priority)) {
        return item.save();
      }
    });
  }).restartable(),

  actions: {
    selectAgendaItem(agendaitem) {
      this.selectAgendaItem(agendaitem);
    },

    toggleIsEditingOverview() {
      this.toggleProperty('isEditingOverview');
    },

    toggleChangesOnly() {
      this.toggleProperty('isShowingChanges');
    },

    reorderItems(itemModels) {
      itemModels.map((item, index) => {
        item.set('priority', index + 1);
      });
      this.reAssignPriorities.perform(itemModels);
      // this.refresh();
      this.agendaService.groupAgendaItemsOnGroupName(itemModels);
      this.set('agendaitems', itemModels);
    },

    reorderAnnouncements(itemModels) {
      itemModels.map((item, index) => {
        item.set('priority', index + 1);
      });
      this.reAssignPriorities.perform(itemModels);
      // this.refresh();
      this.set('announcements', itemModels);
    }
  }
});
