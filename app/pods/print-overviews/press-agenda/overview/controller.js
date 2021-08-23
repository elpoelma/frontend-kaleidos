import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({
  intl: inject(),
  queryParams: ['definite'],

  title: computed('model.currentAgenda.createdFor.plannedStart', function() {
    const date = this.get('model.currentAgenda.createdFor.plannedStart');
    return `${this.intl.t('press-agenda')} ${moment(date).format('dddd DD-MM-YYYY')}`;
  }),

  documentTitle: computed('model.currentAgenda.createdFor.plannedStart', 'definite', function() {
    const date = this.get('model.currentAgenda.createdFor.plannedStart');
    let prefix = '';

    if (this.definite === 'false') {
      prefix = 'Klad ';
    }
    return `${prefix}${this.intl.t('agendaitem-press-agenda')} van ${moment(date).format('DD-MM-YYYY')}`;
  }),

  filteredGroups: computed('model', 'definite', async function() {
    return this.model.get('groups').then((agenda) => {
      agenda.groups.map((group) => {
        group.agendaitems.filter((agendaitem) => agendaitem.forPress);
      });
    });
  }),
});
