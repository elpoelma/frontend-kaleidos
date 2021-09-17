import Model, {
  attr, hasMany, belongsTo
} from '@ember-data/model';

export default class Person extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') alternativeName;

  @belongsTo('contact-person') contactPerson;
  @belongsTo('organization') organization;
  @hasMany('mandatee') mandatees;
  @hasMany('sign-flow') signFlows;

  get nameToDisplay() {
    const {
      alternativeName, firstName, lastName,
    } = this;
    if (alternativeName) {
      return alternativeName;
    }
    return [firstName, lastName].filter((it) => it).join(' ');
  }
}
