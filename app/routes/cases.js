import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CasesRoute extends Route {
  @service('session') simpleAuthSession;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, this.simpleAuthSession.unauthenticatedRouteName);
  }
}
