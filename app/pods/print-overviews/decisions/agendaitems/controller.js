import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Controller.extend({
  intl: inject(),

  columns: computed(function() {
    return [{
      label: '#',
      width: '50px',
      sortable: true,
      valuePath: 'priority',
    }, {
      label: this.intl.t('title-and-content'),
      classNames: ['vl-data-table-col-7 vl-data-table__header-title'],
      cellClassNames: ['vl-data-table-col-7'],
      sortable: false,
      width: '58.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      cellComponent: 'web-components/vl-agendaitem-content-column',
    },
    {
      label: this.intl.t('ministers'),
      classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
      cellClassNames: ['vl-data-table-col-2'],
      sortable: false,
      width: '16.66%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      valuePath: 'sortedMandatees',
      cellComponent: 'web-components/vl-mandatees-column',
    },
    {
      label: this.intl.t('decided'),
      classNames: ['vl-data-table-col-1 vl-data-table__header-title'],
      cellClassNames: ['vl-data-table-col-1'],
      width: '8.33%',
      breakpoints: ['mobile', 'tablet', 'desktop'],
      sortable: false,
      cellComponent: 'web-components/vl-decisions-column',
    },
    {
      label: this.intl.t('latest-modified'),
      classNames: ['vl-data-table-col-2 vl-data-table__header-title'],
      cellClassNames: ['vl-data-table-col-2'],
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

  actions: {
    async addDecision(agendaitemRow) {
      const agendaActivity = await agendaitemRow.get('agendaActivity');
      const subcase = await agendaActivity.get('subcase');
      const decision = this.store.createRecord('decision', {
        subcase,
        title: subcase.get('title'),
        shortTitle: subcase.get('shortTitle'),
        approved: false,
      });
      const savedDecision = await decision.save();
      (await subcase.get('decisions')).addObject(savedDecision);
    },
  },
});
