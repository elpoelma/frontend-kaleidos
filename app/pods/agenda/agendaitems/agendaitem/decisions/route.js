import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  async beforeModel() {
    const agendaitem = this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaitem.get('agendaActivity');
    if (!agendaActivity) {
      this.transitionTo('agenda.agendaitems.agendaitem.index');
    }
  }

  async model() {
    const agendaItem = await this.modelFor('agenda.agendaitems.agendaitem');
    return await this.store.query('agenda-item-treatment', {
      'filter[agendaitem][:id:]': agendaItem.id,
      include: 'report',
    });
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaitem = await this.modelFor('agenda.agendaitems.agendaitem');
    const agendaActivity = await agendaitem.get('agendaActivity');
    const subcase = await agendaActivity.subcase;
    controller.set('agendaitem', agendaitem);
    controller.set('subcase', subcase);
    controller.set('model', model);
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
