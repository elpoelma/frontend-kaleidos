// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import {
  computed, set
} from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject } from '@ember/service';
import { cached } from 'frontend-kaleidos/decorators/cached';
import {
  saveChanges as saveSubcaseDescription, cancelEdit
} from 'frontend-kaleidos/utils/agendaitem-utils';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: inject(),
  currentSession: inject(),
  classNames: ['auk-u-mb-8'],
  subcase: null,

  subcaseName: cached('subcase.subcaseName'), // TODO in class syntax use as a decorator instead
  type: cached('subcase.type'), // TODO in class syntax use as a decorator instead
  showAsRemark: cached('subcase.showAsRemark'), // TODO in class syntax use as a decorator instead

  remarkType: computed('subcase.remarkType', function() {
    return this.subcase.get('remarkType');
  }),

  caseTypes: computed('store', async function() {
    return await this.store.query('case-type', {
      sort: '-label',
      filter: {
        deprecated: false,
      },
    });
  }),

  latestMeetingId: computed('subcase.latestMeeting', function() {
    return this.subcase.get('latestMeeting').then((meeting) => meeting.id);
  }),

  latestAgendaId: computed('subcase.latestAgenda', function() {
    return this.subcase.get('latestAgenda').then((agenda) => agenda.id);
  }),

  latestAgendaitemId: computed('subcase.latestAgendaitem', function() {
    return this.subcase.get('latestAgendaitem').then((agendaitem) => agendaitem?.id);
  }),

  isRetracted: computed('subcase.latestAgendaitem', function() {
    return this.subcase.get('latestAgendaitem').then((agendaitem) => agendaitem?.retracted);
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async cancelEditing() {
      const propertiesToSetOnSubCase = {
        subcaseName: this.get('subcaseName'),
        type: this.get('type'),
        showAsRemark: this.get('showAsRemark'),
      };
      cancelEdit(this.subcase, propertiesToSetOnSubCase);
      set(this, 'isEditing', false);
    },

    async selectType(type) {
      const subcaseName = type.get('label');
      this.set('type', type);
      this.set('subcaseName', subcaseName);
    },

    selectRemarkType(id) {
      const type = this.store.peekRecord('case-type', id);
      this.set('showAsRemark', type.get('uri') ===  CONSTANTS.CASE_TYPES.REMARK);
    },

    async saveChanges() {
      const resetFormallyOk = true;
      set(this, 'isLoading', true);

      const propertiesToSetOnAgendaitem = {
        showAsRemark: this.get('showAsRemark'),
      };

      const propertiesToSetOnSubCase = {
        subcaseName: this.get('subcaseName'),
        type: this.get('type'),
        showAsRemark: this.get('showAsRemark'),
      };
      await saveSubcaseDescription(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubCase, resetFormallyOk);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    },
  },
});
