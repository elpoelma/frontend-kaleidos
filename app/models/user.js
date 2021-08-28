import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  emailLink: attr(),
  phoneLink: attr(),
  account: belongsTo('account'),
  group: belongsTo('account-group', {
    inverse: null,
  }),
  organization: belongsTo('organization'),

  email: computed('emailLink', {
    get() {
      return this.emailLink && this.emailLink.replace(/^mailto:/, '');
    },
    // eslint-disable-next-line no-unused-vars
    set(key, value) {
      this.set('emailLink', `mailto:${value}`);
      return value;
    },
  }),
  phone: computed('phoneLink', {
    get() {
      return this.phoneLink && this.phoneLink.replace(/^tel:/, '');
    },
    // eslint-disable-next-line no-unused-vars
    set(key, value) {
      this.set('phoneLink', `tel:${value.replace(/[/ .]/, '')}`);
      return value;
    },
  }),

  fullName: computed('firstName', 'lastName', function() {
    return `${this.firstName} ${this.lastName}`;
  }),
});
