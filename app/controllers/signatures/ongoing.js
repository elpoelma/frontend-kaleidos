import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SignaturesOngoingController extends Controller {
  @service router;
  @service mandatees;
  @service intl;
  @service currentSession

  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
      mandatees: {
        type: 'array',
      },
      statuses: {
        type: 'array',
      }
    },
  ];

  //TODO : add all statuses 
  statuses = [
    {
      label: this.intl.t('signing-status-to-be-prepared'),
      value: 'toBePrepared',
    }, 
    {
      label: this.intl.t('signing-status-to-be-signed'),
      value: 'isMarked',
    },
    {
      label: this.intl.t('signing-status-signed'),
      value: 'isSigned',
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[1];
  @tracked sort = 'decision-activity.start-date';

  @tracked mandatees = [];
  @tracked selectedStatuses = [];
  @tracked isLoadingModel;

  isConfidential = (accessLevel) => {
    return [
      CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
      CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
    ].includes(accessLevel.get('uri'));
  }

  @action
  async navigateToPublicationFlow (signFlow) {
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;

    if (piece) {
      const response = await fetch(
        `/signing-flows/${signFlow.id}/pieces/${piece.id}/signinghub-url?collapse_panels=false`
      );
      if (response.ok) {
        const result = await response.json();
        window.location.replace(result.url);
      } else {
        this.router.transitionTo(
          'document',
          piece.id
        );
      }
    }
  }

  @action
  updateSelectedStatuses(statuses) {
    this.selectedStatuses = statuses;
  }

  @action
  setMandatees(mandatees) {
    this.mandatees = mandatees;
  }

  getMandateeNames = async (signFlow) => {
    const signSubcase = await signFlow.signSubcase;
    const signSigningActivities = await signSubcase.signSigningActivities;
    const mandatees = await Promise.all(
      signSigningActivities.map((activity) => activity.mandatee)
    );
    const persons = await Promise.all(
      mandatees
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }
}
