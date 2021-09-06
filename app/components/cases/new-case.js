import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NewCase extends Component {
  title = null;
  shortTitle = null;
  @service store;
  @tracked confidential = false;
  @tracked hasError = false;
  @tracked isLoading = false;

  async createCase() {
    const newDate = moment().utc()
      .toDate();
    const {
      shortTitle, confidential,
    } = this;
    const caze = this.store.createRecord('case',
      {
        shortTitle,
        confidential,
        isArchived: false,
        created: newDate,
      });
    await caze.save();
    this.isLoading = false;
    return this.args.close(caze);
  }

  get getClassForShortTitle() {
    if (this.hasError) {
      return 'auk-form-group--error';
    }
    return null;
  }

  // @action
  // toggleConfidential(event) {
  //   this.confidential = event.target.checked;
  // }

  @action
  async createCaseAction($event) {
    $event.preventDefault();
    const {
      shortTitle,
    } = this;
    if (shortTitle === null || shortTitle.trim().length === 0) {
      this.hasError = true;
    } else {
      this.isLoading = true;
      await this.createCase();
    }
  }

  @action
  closeAction() {
    this.args.close();
  }
}
