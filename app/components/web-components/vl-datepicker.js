// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  formatter: inject(),
  dateObjectsToEnable: null,
  datePropertyToUse: null,
  enableTime: null,
  defaultHour: null,
  defaultMinute: null,

  datesToEnable: computed('dateObjectsToEnable', function() {
    const {
      dateObjectsToEnable, datePropertyToUse,
    } = this;
    return dateObjectsToEnable.map((object) => this.formatter.formatDate(object.get(datePropertyToUse)));
  }),

  selectedDate: computed('date', function() {
    const date = this.get('date');
    if (date) {
      return this.formatter.formatDate(date.get('firstObject'));
    }
    const defaultDate = this.formatter.formatDate(null);
    if (this.defaultHour !== null && !isNaN(this.defaultHour)) {
      defaultDate.setHours(this.defaultHour);
    }
    if (this.defaultMinute !== null && !isNaN(this.defaultMinute)) {
      defaultDate.setMinutes(this.defaultMinute);
    }
    return defaultDate;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    toggleCalendar() {
      this.flatpickrRef.toggle();
    },

    dateChanged(val) {
      this.dateChanged(this.formatter.formatDate(val.get('firstObject')));
    },

    // eslint-disable-next-line no-unused-vars
    onReady(_selectedDates, _dateStr, instance) {
      this.flatpickrRef = instance;
    },
  },
});
