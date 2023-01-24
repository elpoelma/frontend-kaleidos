import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SignSubcaseModel extends Model {
  @attr title;
  @attr('datetime') startDate;
  @attr('datetime') endDate;

  @belongsTo('sign-flow', { inverse: 'signSubcase', async: true }) signFlow;
  @belongsTo('sign-marking-activity', { inverse: 'signSubcase', async: true })
  signMarkingActivity;
  @belongsTo('sign-preparation-activity') signPreparationActivity;
  @belongsTo('sign-cancellation-activity', {
    inverse: 'signSubcase',
    async: true,
  })
  signCancellationActivity;
  @belongsTo('sign-completion-activity', {
    inverse: 'signSubcase',
    async: true,
  })
  signCompletionActivity;

  @hasMany('sign-signing-activity', { inverse: 'signSubcase', async: true })
  signSigningActivities;
  @hasMany('sign-refusal-activity', { inverse: 'signSubcase', async: true })
  signRefusalActivities;
}
