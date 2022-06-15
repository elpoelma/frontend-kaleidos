import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({
  intl: inject(),
  store: inject(),
  newsletterService: inject(),

  columns: computed(function() {
    return [{
      label: '#',
      width: '50px',
      sortable: true,
      valuePath: 'number',
    }, {
      label: this.intl.t('title-and-content'),
      classNames: ['auk-table__col--7'],
      cellClassNames: ['auk-table__col--7'],
      sortable: false,
      width: '58.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      cellComponent: 'web-components/vl-agendaitem-content-column',
    },
    {
      label: this.intl.t('ministers'),
      classNames: ['auk-table__col--2'],
      cellClassNames: ['auk-table__col--2'],
      sortable: false,
      width: '16.66%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'sortedMandatees',
      cellComponent: 'web-components/vl-mandatees-column',
    },
    {
      label: this.intl.t('decided'),
      classNames: ['auk-table__col--1'],
      cellClassNames: ['auk-table__col--1'],
      width: '8.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      sortable: false,
      cellComponent: 'web-components/vl-decisions-column',
    },
    {
      label: this.intl.t('latest-modified'),
      classNames: ['auk-table__col--2'],
      cellClassNames: ['auk-table__col--2'],
      breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'modified',
      sortable: true,
      width: '16.66%',
      cellComponent: 'web-components/vl-modified-column',
    },
    {
      width: '144px',
      sortable: false,
      cellComponent: 'web-components/vl-table-actions',
    }];
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    // TODO: this should be "addDecisionActivity" instead.
    async addTreatment(agendaitemRow) {
      const now = new Date();
      const agendaitem = await this.store.findRecord('agendaitem', agendaitemRow.content.id, {
        include: 'agenda,agenda.created-for',
      });
      const agenda = await agendaitem.agenda;
      const meeting = await agenda.createdFor;
      const startDate = meeting.plannedStart;
      const agendaActivity = await agendaitem.agendaActivity;
      const subcase =  await agendaActivity.subcase;
      const decisionActivity = this.store.createRecord('decision-activity', {
        startDate: startDate,
        subcase: subcase,
      });
      await decisionActivity.save();
      const treatment = this.store.createRecord('agenda-item-treatment', {
        created: now,
        modified: now,
        agendaitem,
        decisionActivity
      });
      await treatment.save();
      await this.newsletterService.linkNewsItemToNewTreatment(agendaitem); // TODO: this can be removed?
    },
  },
});
