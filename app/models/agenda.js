import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import CONSTANTS from 'frontend-kaleidos/config/constants';
// LoadableModel is still depended upon here and there. Should refactor out in the more general direction the codebase handles these load operations.
// eslint-disable-next-line ember/no-mixins
import LoadableModel from 'ember-data-storefront/mixins/loadable-model';
import { A } from '@ember/array';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend(LoadableModel, {
  name: computed.alias('serialnumber'),
  title: attr('string'),
  serialnumber: attr('string'),
  issued: attr('datetime'),
  createdFor: belongsTo('meeting'),
  status: belongsTo('agendastatus', {
    inverse: null,
  }),
  agendaitems: hasMany('agendaitem', {
    inverse: null,
    serialize: false,
  }),
  created: attr('datetime'),
  modified: attr('datetime'),

  // the next and previous version of agenda is set in agenda-approve-service, read-only in frontend
  previousVersion: belongsTo('agenda', {
    inverse: 'nextVersion',
    serialize: false,
  }),
  nextVersion: belongsTo('agenda', {
    inverse: 'previousVersion',
    serialize: false,
  }),
  isDesignAgenda: reads('status.isDesignAgenda'),

  isApproved: reads('status.isApproved'),

  async asyncCheckIfDesignAgenda() {
    await this.get('status');

    return this.get('isDesignAgenda');
  },

  // TODO This computed property is used in:
  // - agenda template
  // - agenda::AgendaHeader::AgendaVersionActions
  // Refactor these uses and remove this computed property
  agendaName: computed('serialnumber', 'status.isDesignAgenda', function() {
    const isDesignAgenda = this.get('status.isDesignAgenda');
    const agendaName = this.serialnumber || '';
    let prefix;
    if (isDesignAgenda) {
      prefix = 'Ontwerpagenda';
    } else {
      prefix = 'Agenda';
    }
    return `${prefix} ${agendaName}`;
  }),

  // TODO this computed property is used in:
  // - agenda.agendaitems.agendaitem.index template
  // Refactor this use and remove this computed property
  isFinal: computed.alias('status.isFinal'),


  // TODO this computed property is used in:
  // - Agenda::AgendaHeader::AgendaVersionActions
  // Refactor this use and remove this computed property
  canBeApproved: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const approvedAgendaitems = agendaitems.filter((agendaitem) => [CONSTANTS.ACCEPTANCE_STATUSSES.OK].includes(agendaitem.get('formallyOk')));
      return approvedAgendaitems.get('length') === agendaitems.get('length');
    });
  }),

  // TODO this computed property is used in:
  // - agenda#allAgendaitemsNotOkLength
  // - Agenda::AgendaHeader::AgendaActions
  // - Agenda::AgendaHeader::AgendaVersionActions
  // Refactor these uses and remove this computed property
  allAgendaitemsNotOk: computed('agendaitems.@each.formallyOk', function() {
    return this.get('agendaitems').then((agendaitems) => {
      const allAgendaitemsNotOk = agendaitems.filter((agendaitem) => [CONSTANTS.ACCEPTANCE_STATUSSES.NOT_OK, CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK].includes(agendaitem.get('formallyOk')));
      return allAgendaitemsNotOk.sortBy('number');
    });
  }),

  // TODO this computed property is used in:
  // - Agenda::AgendaHeader::AgendaActions
  // Refactor this use and remove this computed property
  allAgendaitemsNotOkLength: computed('allAgendaitemsNotOk', async function() {
    const agendaitemsToCount = await this.get('allAgendaitemsNotOk');
    return agendaitemsToCount.length;
  }),

  // TODO this computed property is used in:
  // - Agenda::AgendaHeader::AgendaVersionActions
  // Refactor this use and remove this computed property
  newAgendaitemsNotOk: computed('allAgendaitemsNotOk', async function() {
    const agendaitemsToFilter = await this.get('allAgendaitemsNotOk');
    const newAgendaitems = A([]);
    for (const agendaitem of agendaitemsToFilter) {
      const previousVersion = await agendaitem.get('previousVersion');
      if (!previousVersion) {
        newAgendaitems.pushObject(agendaitem);
      }
    }
    return newAgendaitems;
  }),

  // TODO this computed property is used in:
  // - Agenda::AgendaHeader::AgendaActions
  // Refactor this use and remove this computed property
  approvedAgendaitemsNotOk: computed('allAgendaitemsNotOk', async function() {
    const agendaitemsToFilter = await this.get('allAgendaitemsNotOk');
    const approvedAgendaitems = A([]);
    for (const agendaitem of agendaitemsToFilter) {
      const previousVersion = await agendaitem.get('previousVersion');
      if (previousVersion) {
        approvedAgendaitems.pushObject(agendaitem);
      }
    }
    return approvedAgendaitems;
  }),

});
