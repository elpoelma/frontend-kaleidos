import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';

export default class Meeting extends Model {
  @service store;
  @service intl;

  @attr uri;
  @attr('datetime') plannedStart;
  @attr('datetime') startedOn;
  @attr('datetime') endedOn;
  @attr location;
  @attr('number') number;
  @attr numberRepresentation;
  @attr('boolean') isFinal;
  @attr extraInfo;

  @hasMany('agenda', {
    inverse: null, serialize: false,
  }) agendas;
  @hasMany('subcase') requestedSubcases;
  @hasMany('piece') pieces;
  @hasMany('themis-publication-activity') themisPublicationActivities;

  @belongsTo('concept') kind;
  @belongsTo('meeting', {
    inverse: null,
  }) mainMeeting;
  @belongsTo('newsletter-info') newletter;
  @belongsTo('mail-campaign') mailCampaign;
  @belongsTo('agenda', {
    inverse: null,
  }) agenda;

  @belongsTo('internal-decision-publication-activity') internalDecisionPublicationActivity;
  @belongsTo('internal-document-publication-activity') internalDocumentPublicationActivity;
  @hasMany('themis-publication-activity') themisPublicationActivities;


  get isPreKaleidos() {
    return this.plannedStart < KALEIDOS_START_DATE;
  }
}
