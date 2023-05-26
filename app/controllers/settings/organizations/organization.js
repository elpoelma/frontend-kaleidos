import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SettingsOrganizationsOrganizationController extends Controller {
  @service store;

  @tracked mandateeBeingUnlinked = null;
  @tracked showBlockOrganization = false;
  @tracked showUnblockOrganization = false;
  @tracked showUnlinkMandatee = false;
  @tracked selectedMandatee = null;
  @tracked linkedMandatees;

  @action
  async blockOrganization() {
    const blocked = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.BLOCKED
    );
    this.model.status = blocked;
    await this.model.save();
  }

  @action
  async unblockOrganization() {
    const allowed = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.USER_ACCESS_STATUSES.ALLOWED
    );
    this.model.status = allowed;
    await this.model.save();
  }

  @action
  async linkMandatee() {
    this.linkedMandatees.push(this.selectedMandatee);
    this.model.mandatees = this.linkedMandatees;
    this.selectedMandatee = null;
    await this.model.save();
  }

  @action
  async unlinkMandatee() {
    this.linkedMandatees.splice(
      this.linkedMandatees.indexOf(this.mandateeBeingUnlinked),
      1
    );
    this.model.mandatees = this.linkedMandatees;
    this.selectedMandatee = null;
    await this.model.save();
  }
}