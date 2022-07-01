import Service, { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseIsApprovedService extends Service {
  @service store;

  async isApproved(subcase) {
    const meeting = await subcase?.requestedForMeeting;

    if (meeting?.isFinal) {
      const approvedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      );

      const nrAgendaItemTreamts = await this.store.count('agenda-item-treatment', {
        'filter[subcase][:id:]': subcase.id,
        'filter[decision-result-code][:id:]': [
          approvedDecisionResultCode.id,
          acknowledgedDecisionResultCode.id,
        ].join(','),
      });
      return nrAgendaItemTreamts > 0;
    }
    return false;
  }
}