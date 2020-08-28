import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getPrintOverviewTitle } from 'fe-redpencil/utils/print-overview-util';

export default Controller.extend({
  titleTranslationKey: 'agenda-notes',
  titlePrintKey: 'agenda-notes',
  routeModel: 'print-overviews.notes',
  intl: inject(),

  title: computed('model.createdFor', 'titleTranslationKey', async function() {
    const date = this.get('model.createdFor.plannedStart');
    const translatedTitle = this.intl.t(this.titleTranslationKey);
    return getPrintOverviewTitle(translatedTitle, date);
  }),

  actions: {
    async navigateBackToAgenda() {
      const currentSessionId = await this.get('model.createdFor.id');
      const selectedAgendaid = await this.get('model.id');
      this.transitionToRoute('agenda.agendaitems', currentSessionId, selectedAgendaid);
    },
  },
});
