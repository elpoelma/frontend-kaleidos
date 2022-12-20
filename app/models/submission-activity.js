import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class SubmissionActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('subcase', { inverse: 'submissionActivities', async: true })
  subcase;
  @belongsTo('agenda-activity', {
    inverse: 'submissionActivities',
    async: true,
  })
  agendaActivity;

  @hasMany('piece', { inverse: null, async: true }) pieces; // This relation is serialized, even though it's on the hasMany side, because the belongsTo side isn't exposed by the backend
  @hasMany('mandatee', { inverse: null, async: true }) submitters;
}
