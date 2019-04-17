import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { inject } from '@ember/service';
import { on } from '@ember/object/evented';

export default Component.extend({
	store: inject(),
  sessionService: inject(),
  agendaService: inject(),
	classNames:['vlc-scroll-wrapper__body'],
	agendaToCompare: null,
	currentAgenda: null,
  currentAgendaGroups: null,
  agendaToCompareGroups: null,
  agendaOne: null,
  agendaTwo: null,

	currentAgendaItemsObserver: on('init', observer('agendaOne', async function () {

    let agenda = await this.get('agendaOne');
		if(!agenda) return;
		let agendaItems = await this.store.query('agendaitem', {
			filter: {
				'agenda': { id: agenda.id },
			},
      include: 'subcase.phases.code,agenda,subcase,subcase.case,subcase.themes,subcase.mandatees,postponed-to,subcase.phases'
		});

    const groups = await this.reduceGroups(agendaItems, agenda);
		this.set('currentAgendaGroups', groups);
	})),

	agendaToCompareAgendaItemsObserver: on('init', observer('agendaTwo', async function () {
		let agenda = await this.get('agendaTwo');
		if(!agenda) return;
		let agendaItems = await this.store.query('agendaitem', {
			filter: {
				'agenda': { id: agenda.id }
			},
      include: 'subcase.phases.code,agenda,subcase,subcase.case,subcase.themes,subcase.mandatees,postponed-to,subcase.phases'
		});
    const groups = await this.reduceGroups(agendaItems, agenda);
		this.set('agendaToCompareGroups', groups);
	})),

  changedGroups: computed('currentAgendaGroups.@each', 'agendaToCompareGroups.@each', function () {
		let groups = {};

		(this.currentAgendaGroups || []).flat().map(item => {
			let groupName = item.groupName;
      groups[groupName] = { current: item };
		});

		(this.agendaToCompareGroups || []).flat().map(item => {
      let groupName = item.groupName;
      groups[groupName] = groups[groupName] || {};
      groups[groupName].previous = item;
		});

		return Object.keys(groups).map((key) => {
			return groups[key];
		});
	}),

  async reduceGroups(agendaitems, agenda) {
    const { agendaService } = this;
    const sortedAgendaItems = await agendaService.getSortedAgendaItems(agenda);
    const itemsAddedAfterwards = [];

    const filteredAgendaItems = agendaitems.filter(agendaitem => {
      if (agendaitem && agendaitem.id) {
        if (agendaitem.priority) {
          const foundItem = sortedAgendaItems.find(item => item.uuid === agendaitem.id);
          if (foundItem) {
            agendaitem.set('foundPriority', foundItem.priority);
            return agendaitem;
          }
        } else {
          itemsAddedAfterwards.push(agendaitem);
        }
      }
    });
    const filteredAgendaGroupList = await agendaService.reduceAgendaitemsByMandatees(filteredAgendaItems);
    const filteredAgendaGroupListAddedAfterwards = await agendaService.reduceAgendaitemsByMandatees(itemsAddedAfterwards);

    return [
      Object.values(filteredAgendaGroupList).sortBy('foundPriority'),
      Object.values(filteredAgendaGroupListAddedAfterwards).sortBy('foundPriority')
    ];
  },

  actions : {
    chooseAgendaOne (agenda){
      this.set('agendaOne', agenda);
    },
    chooseAgendaTwo (agenda){
      this.set('agendaTwo', agenda);
    }
  }
})
