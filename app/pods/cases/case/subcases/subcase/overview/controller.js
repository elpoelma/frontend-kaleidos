import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { saveChanges } from 'frontend-kaleidos/utils/agendaitem-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesCaseSubcasesSubcaseOverviewController extends Controller {
  @service currentSession;

  @tracked page = 0;
  @tracked size = 25;

  @tracked case;
  @tracked mandatees;
  @tracked submitter;
  @tracked governmentAreas;
  @tracked siblingSubcasesCount;

  get showMandateesNotApplicableMessage() {
    return [CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING].includes(this.model.type?.uri);
  }

  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await saveChanges(
      this.model.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true
    );
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = this.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.case.save();
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }
}
