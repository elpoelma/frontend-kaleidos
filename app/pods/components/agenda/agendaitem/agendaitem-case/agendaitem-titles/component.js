import Component from '@glimmer/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaitemTitles extends Component {
  classNames = ['vl-u-spacer-extended-bottom-l'];
  @service currentSession;

  @alias('this.args.agendaitem.treatments.firstObject.newsletterInfo') newsletterInfo;

  get pillClass() {
    const baseClass = 'vl-pill vl-u-text--capitalize';
    if (this.args.subcase) {
      if (this.args.subcase.approved) {
        return `${baseClass} vl-pill--success`;
      }
    }
    return baseClass;
  }

  @action
  toggleIsEditingAction() {
    this.args.toggleIsEditing();
  }
}
