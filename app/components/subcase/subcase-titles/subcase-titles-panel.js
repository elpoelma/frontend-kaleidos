import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
/**
 * @argument subcase
 * @argument allowEditing
 */
export default class SubcaseTitlesPanel extends Component {
  @tracked isEditing = false;

  @action
  startEditing() {
    this.isEditing = true;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  @action
  stopEditing() {
    this.isEditing = false;
  }
}
