import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class MandateesMandateesPanelComponent extends Component {
  /**
   * @argument mandatees
   * @argument submitter
   * @argument allowEditing
   * @argument onSave
   * @argument {ReferenceDate} Date of to get active Mandatees for
   */
  @tracked isEditing = false;

  @action
  startEditing() {
    this.isEditing = true;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  @task
  *save() {
    if (this.args.onSave) {
      yield this.args.onSave(...arguments);
    }
    this.isEditing = false;
  }
}
