import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class Mandatee extends Model {
  @attr title;
  @attr newsletterTitle;
  @attr('number') priority;
  @attr('datetime') start;
  @attr('datetime') end;

  @belongsTo('person', { inverse: 'mandatees', async: true }) person;
  @belongsTo('mandate', { inverse: 'mandatee', async: true }) mandate;

  @hasMany('subcase', { inverse: 'mandatees', async: true }) subcases;
  @hasMany('subcase', { inverse: 'requestedBy', async: true })
  requestedSubcases;
  @hasMany('agendaitem', { inverse: 'mandatees', async: true }) agendaitems;
  @hasMany('publication-flow', { inverse: 'mandatees', async: true })
  publicationFlows;
  @hasMany('sign-signing-activity', { inverse: 'mandatee', async: true })
  signSigningActivities;

  get fullDisplayName() {
    const fullName = this.person.get('fullName');
    const title = this.title ?? this.mandate.get('role.label');
    if (fullName) {
      return `${fullName}, ${title}`;
    }
    return `${title}`;
  }
}
