import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class AgendaitemNav extends Component {
  @service currentSession;

  @tracked subcaseExists = false;
  @tracked decisionsExist = false;
  @tracked newsItemExists = false;
  @tracked pressAgendaitemExists = false;

  get agendaitem() {
    return this.args.agendaitem;
  }

  constructor() {
    super(...arguments);
    this.checkExistence();
  }

  @action
  async checkExistence() {
    const agendaActivity = await this.agendaitem.get('agendaActivity');
    this.decisionsExist = isPresent(await this.agendaitem.get('treatments'));
    if (!this.agendaitem.isApproval) {
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        this.subcaseExists = isPresent(subcase);
      } else {
        this.subcaseExists = false;
      }
      if (this.decisionsExist) { // Treatment and decision activity are currently one entity in implementation
        const treatment = (await this.agendaitem.get('treatments')).firstObject;
        const nli = await treatment.get('newsletterInfo');
        this.newsItemExists = isPresent(nli);
      } else {
        this.newsItemExists = false;
      }
      this.pressAgendaitemExists = isPresent((this.agendaitem.titlePress && this.agendaitem.textPress));
    }
  }
}
