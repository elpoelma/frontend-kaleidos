import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

export default class AgendaAgendaitemsAgendaitemController extends Controller {
  @service currentSession;

  @tracked meeting;
  @tracked treatment;

  get hasDecision() {
    return isPresent(this.treatment?.decisionActivity.get('id'));
  }

  get hasNewsItem() {
    return isPresent(this.treatment?.newsItem.get('id'));
  }

  get canShowDecisionTab() {
    return this.currentSession.may('manage-decisions')
      || (this.meeting.agenda && this.hasDecision);
  }

  get canShowNewsletterTab() {
    return this.currentSession.may('manage-news-items')
      || (this.meeting.agenda && this.hasNewsItem);
  }
}
