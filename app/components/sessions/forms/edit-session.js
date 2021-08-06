// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';
import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: service(),
  agendaService: service(),
  toaster: service(),
  formatter: service(),
  kind: null,
  selectedKindUri: null,
  startDate: null,
  extraInfo: null,
  meetingNumber: null,
  numberRepresentation: null,
  date: computed('startDate', function() {
    return A([this.startDate]);
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-component-lifecycle-hooks
  didInsertElement() {
    this._super(...arguments);
    this.set('selectedKindUri', this.get('meeting.kind'));
    this.set('kind', EmberObject.create(CONFIG.MINISTERRAAD_TYPES.TYPES.find((minsterraad) => minsterraad.uri === this.get('selectedKindUri'))));
    this.set('startDate', this.get('meeting.plannedStart'));
    this.set('extraInfo', this.get('meeting.extraInfo'));
    this.set('meetingNumber', this.get('meeting.number'));
    this.set('numberRepresentation', this.get('meeting.numberRepresentation'));
  },

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {

    meetingNumberChangedAction(meetingNumber) {
      const meetingYear = moment(this.get('meeting.plannedStart')).year();
      this.set('meetingNumber', meetingNumber);
      this.set('formattedMeetingIdentifier', `VR PV ${meetingYear}/${meetingNumber}`);
      this.set('numberRepresentation', this.get('formattedMeetingIdentifier'));
      this.set('meeting.numberRepresentation', this.get('formattedMeetingIdentifier'));
    },

    async updateSession() {
      const {
        isDigital, extraInfo, selectedKindUri, meeting, meetingNumber, numberRepresentation,
      } = this;
      this.set('isLoading', true);
      const kindUriToAdd = selectedKindUri || CONFIG.MINISTERRAAD_TYPES.DEFAULT;
      const date = this.formatter.formatDate(null);
      const startDate = this.get('startDate') || date;

      await meeting.set('isDigital', isDigital);
      await meeting.set('extraInfo', extraInfo);
      await meeting.set('plannedStart', startDate);
      await meeting.set('created', date);
      await meeting.set('kind', kindUriToAdd);
      await meeting.set('number', meetingNumber);
      await meeting.set('numberRepresentation', numberRepresentation);

      meeting.save()
        .catch(() => {
          this.toaster.error();
        })
        .finally(() => {
          this.set('isLoading', false);
          this.successfullyEdited();
        });
    },

    async selectStartDate(val) {
      this.set('startDate', this.formatter.formatDate(val));
    },

    setKind(kind) {
      this.set('selectedKindUri', kind);
    },

    cancelForm(event) {
      this.cancelForm(event);
    },

    successfullyEdited() {
      this.successfullyEdited();
    },
  },
});
