import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getPrintOverviewTitle } from 'frontend-kaleidos/utils/print-overview-util';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({
  titleTranslationKey: 'press-agenda',
  titlePrintKey: 'press-agenda-pdf-name',
  routeModel: 'print-overviews.press-agenda',
  intl: inject(),

  title: computed('model.createdFor.plannedStart', 'titleTranslationKey', async function() {
    const date = this.get('model.createdFor.plannedStart');
    const translatedTitle = this.intl.t(this.titleTranslationKey);
    return getPrintOverviewTitle(translatedTitle, date);
  }),
});