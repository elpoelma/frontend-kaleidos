import Component from '@glimmer/component';
import { inject } from '@ember/service';
import { computed, set, action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaItemCase extends Component {
  authentication = inject('currentSession');
  @tracked isEditing = false;


  get subcase() {
    const agendaActivity = this.args.agendaitem.get('agendaActivity');
    if (agendaActivity) {
      return agendaActivity.get('subcase');
    }
    return null;
  }

  get subcases() {
    const subcase = this.subcase;
    if (subcase) {
      return subcase.get('subcasesFromCase');
    }
    return null;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }

}
