import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DocumentRoute extends Route {
  @service('session') simpleAuthSession;
  @service store;

  queryParams = {
    isSigning: {
      refreshModel: true,
      as: 'aanbieden_voor_handtekenen',
    }
  }

  isSigning = false;

  beforeModel(transition) {
    this.simpleAuthSession.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.queryOne('piece', {
      'filter[:id:]': params.piece_id,
      include: 'file',
    });
  }

  async afterModel(model) {
    this.decisionActivity = await this.store.queryOne('decision-activity', {
      filter: {
        report: {
          ':id:': model?.id,
        },
      },
    });

    const params = this.paramsFor(this.routeName);
    this.isSigning = params.isSigning;
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (this.isSigning) {
      controller.activeTab = 'signatures';
    }
    controller.decisionActivity = this.decisionActivity;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.isSigning = false;
      controller.activeTab = 'details';
    }
  }
}
