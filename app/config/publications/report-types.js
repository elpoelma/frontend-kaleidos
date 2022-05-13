import CONSTANTS from 'frontend-kaleidos/config/constants';

export default [
  {
    translationKey: 'publication-reports--type--by-mandatees--on-decision-date',
    metricsTypeUri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-on-decision-date', // TODO: these aren't URI's. that should change
    // fixed job params for this report type
    // TODO: should be set on the backend
    fixedParams: {
      query: {
        group: 'mandateePersons',
        filter: {},
      },
    },
    // user input fields for job param filters in modal for this report type
    userInputFields: {
      decisionDateRange: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-government-domains',
    metricsTypeUri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-government-domains',
    fixedParams: {
      query: {
        group: 'governmentDomains',
        filter: {},
      },
    },
    userInputFields: {
      publicationYear: true,
      governmentDomains: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-mandatees--only-bvr',
    metricsTypeUri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-only-bvr',
    fixedParams: {
      query: {
        group: 'mandateePersons',
        filter: {
          regulationType: [CONSTANTS.REGULATION_TYPES.BVR],
        },
      },
    },
    userInputFields: {
      publicationYear: true,
      mandateePersons: true,
    },
  },
  {
    translationKey:
      'publication-reports--type--by-regulation-type--only-not-via-council-of-ministers',
    metricsTypeUri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-regulation-type-only-not-via-council-of-ministers',
    fixedParams: {
      query: {
        group: 'regulationType',
        filter: {
          isViaCouncilOfMinisters: false,
        },
      },
    },
    userInputFields: {
      publicationYear: true,
    },
  },
  {
    translationKey: 'publication-reports--type--by-regulation-type',
    metricsTypeUri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-regulation-type',
    fixedParams: {
      query: {
        group: 'regulationType',
      },
    },
    userInputFields: {
      publicationYear: true,
      regulationTypes: true,
    },
  },
  {

    translationKey: 'publication-reports--type--by-mandatees--only-decree',
    metricsTypeUri: 'http://themis.vlaanderen.be/id/concept/publicatierapporttype/by-mandatees-only-decree',
    fixedParams: {
      query: {
        group: 'mandateePersons',
        filter: {
          regulationType: [CONSTANTS.REGULATION_TYPES.DECREET],
        },
      },
    },
    userInputFields: {
      publicationYear: true,
      mandateePersons: true,
    },
  },
];
