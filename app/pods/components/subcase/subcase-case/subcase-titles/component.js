import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, computed
} from '@ember/object';

export default class SubcaseTitles extends Component {
  classNames = ['vl-u-spacer-extended-bottom-l'];
  @service currentSession;
  subcase = null;
  shouldShowDetails = false;

  @computed('subcase.approved')
  get pillClass() {
    return this.getPillClass();
  }

  async getPillClass() {
    const baseClass = 'vl-pill vl-u-text--capitalize';
    const approved = await this.subcase.get('approved');
    if (approved) {
      return `${baseClass} vl-pill--success`;
    }
    return baseClass;
  }

  @action
  toggleIsEditingAction() {
    this.toggleIsEditing();
  }
}
