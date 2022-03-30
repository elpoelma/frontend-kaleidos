import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendasRoute extends Route {
  @service router;
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  redirect() {
    this.router.transitionTo('agendas.overview');
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
