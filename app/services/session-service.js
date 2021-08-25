import Service, { inject } from '@ember/service';
import { computed } from '@ember/object';

import { PromiseArray } from '@ember-data/store/-private';
import { all } from 'rsvp';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  store: inject(),
  router: inject(),
  currentSession: null,

  agendas: computed('currentSession.agendas.[]', function() {
    if (!this.get('currentSession')) {
      return [];
    }
    return PromiseArray.create({
      promise: this.get('currentSession.agendas').then(async(agendas) => {
        await all(agendas.map((agenda) => agenda.load('status')));
        return agendas.sortBy('serialnumber').reverse();
      }),
    });
  }),

  currentAgendaitems: computed('currentAgenda.agendaitems.[]', function() {
    const currentAgenda = this.get('currentAgenda');
    if (currentAgenda) {
      return this.store.query('agendaitem', {
        filter: {
          agenda: {
            id: currentAgenda.id,
          },
        },
        include: ['agenda-activity,agenda-activity.subcase,agenda-activity.subcase.case'],
        sort: 'number',
      });
    }
    return [];
  }),

  announcements: computed('currentAgenda.announcements.[]', function() {
    const currentAgenda = this.get('currentAgenda');
    if (currentAgenda) {
      const announcements = this.store.query('announcement', {
        filter: {
          agenda: {
            id: currentAgenda.id,
          },
        },
      });
      return announcements;
    }
    return [];
  }),

  async findPreviousAgendaOfSession(session, agenda) {
    const agendas = await session.get('sortedAgendas');
    if (agendas) {
      const foundIndex = agendas.indexOf(agenda);
      const agendasLength = agendas.get('length');
      if (foundIndex + 1 !== agendasLength) {
        const previousAgenda = agendas.objectAt(foundIndex + 1);
        return previousAgenda;
      }
      return null;
    }
    return null;
  },

  async deleteSession(session) {
    const newsletter = await session.get('newsletter');
    if (newsletter) {
      await newsletter.destroyRecord();
    }

    await session.destroyRecord();
  },

});
