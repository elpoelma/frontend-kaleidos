import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsPublicationCaseRemarkPanelComponent extends Component {
  @tracked isEditing;

  // copied properties
  // reason: prevent editing the publation-flow record directly,
  // in order to prevent commiting changes when saving the publication-flow record in another panel
  @tracked remark;

  @action
  openEditingPanel() {
    const publicationFlow = this.args.publicationFlow;
    this.isEditing = true;
    this.remark = publicationFlow.remark;
  }

  @action
  closeEditingPanel() {
    this.showError = false;
    this.isEditing = false;
  }

  @task
  *save() {
    const publicationFlow = this.args.publicationFlow;
    publicationFlow.remark = this.remark;
    // no try-catch: don't exit if save didn't work
    yield publicationFlow.save();
    this.isEditing = false;
  }
}
