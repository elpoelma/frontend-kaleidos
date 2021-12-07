export default [
  {
    keyName: 'speedProcedure',
    translationKey: 'publications-table-speed-procedure',
    translationKeySmall: 'publications-table-speed-procedure-small',
    sortKey: 'urgency-level.position',
    showByDefault: false,
  },
  {
    keyName: 'publicationNumber',
    translationKey: 'publications-table-publication-number',
    translationKeySmall: 'publications-table-publication-number-small',
    showByDefault: true,
    sortKey: 'identification.structured-identifier.local-identifier,-created',
  },
  {
    keyName: 'numacNumber',
    translationKey: 'publications-table-numacnummer-bs',
    translationKeySmall: 'publications-table-numacnummer-bs-small',
    showByDefault: true,
    sortKey: 'identification.structured-identifier.local-identifier,-created', // Create sort key
  },
  {
    keyName: 'keyword',
    translationKey: 'publications-table-keyword',
    translationKeySmall: 'publications-table-keyword-small',
    sortKey: 'short-title',
    showByDefault: true,
  },
  {
    keyName: 'shortTitle',
    translationKey: 'publications-table-short-title',
    translationKeySmall: 'publications-table-short-title-small',
    sortKey: 'short-title',
    showByDefault: false,
  },
  {
    keyName: 'comment',
    translationKey: 'publications-table-comment',
    translationKeySmall: 'publications-table-comment-small',
    showByDefault: false,
  },
  {
    keyName: 'pages',
    translationKey: 'publications-table-pages',
    translationKeySmall: 'publications-table-pages-small',
    showByDefault: true,
    sortKey: 'identification.structured-identifier.local-identifier,-created', // Create sort key
  },
    {
    keyName: 'decisionDate',
    translationKey: 'publications-table-decision-date',
    translationKeySmall: 'publications-table-decision-date-small',
    showByDefault: false,
    sortKey: 'agenda-item-treatment.start-date',
  },
  {
    keyName: 'openingDate',
    translationKey: 'publications-table-opening-date',
    translationKeySmall: 'publications-table-opening-date-small',
    showByDefault: false,
    sortKey: 'opening-date',
  },
  {
    keyName: 'translationRequestDate',
    translationKey: 'publications-table-translation-request-date',
    translationKeySmall: 'publications-table-translation-request-date-small',
    showByDefault: false,
    sortKey: 'translation-subcase.request-date',
  },
  {
    keyName: 'translationDueDate',
    translationKey: 'publications-table-translation-due-date',
    translationKeySmall: 'publications-table-translation-due-date-small',
    showByDefault: false,
    sortKey: 'translation-subcase.due-date',
  },
  {
    keyName: 'proofRequestDate',
    translationKey: 'publications-table-preview-request-date',
    translationKeySmall: 'publications-table-preview-request-date-small',
    showByDefault: false,
    sortKey: 'publication-subcase.received-date',
  },
  {
    keyName: 'proofReceivedDate',
    translationKey: 'publications-table-preview-received-date',
    translationKeySmall: 'publications-table-preview-received-date-small',
    showByDefault: false,
    sortKey: 'publication-subcase.received-date',
  },
  {
    keyName: 'proofPrintCorrector',
    translationKey: 'publications-table-preview-translator',
    translationKeySmall: 'publications-table-preview-translator-small',
    showByDefault: false,
    sortKey: 'publication-subcase.proof-print-corrector',
  },

  {
    keyName: 'publicationTargetDate',
    translationKey: 'publications-table-publication-target-date',
    translationKeySmall: 'publications-table-publication-target-date-small',
    showByDefault: false,
    sortKey: 'publication-subcase.target-end-date',
  },
  {
    keyName: 'publicationDate',
    translationKey: 'publications-table-publication-date',
    translationKeySmall: 'publications-table-publication-date-small',
    showByDefault: false,
    sortKey:
      'publication-subcase.publication-activities.decisions.publication-date',
  },
  {
    keyName: 'publicationDueDate',
    translationKey: 'publications-table-publication-due-date',
    translationKeySmall: 'publications-table-publication-due-date-small',
    showByDefault: true,
    sortKey: 'publication-subcase.due-date',
  },
  {
    keyName: 'regulationType',
    translationKey: 'publications-table-regulation-type',
    translationKeySmall: 'publications-table-regulation-type-small',
    showByDefault: false,
    sortKey: 'regulation-type.position',
  },
  {
    keyName: 'source',
    translationKey: 'publications-table-source',
    translationKeySmall: 'publications-table-source-small',
    showByDefault: false,
  },
  {
    keyName: 'lastEdited',
    translationKey: 'publications-table-last-edited',
    translationKeySmall: 'publications-table-last-edited-small',
    showByDefault: false,
    sortKey: 'modified',
  },
  {
    keyName: 'status',
    translationKey: 'publications-table-status',
    translationKeySmall: 'publications-table-status-small',
    showByDefault: false,
    sortKey: 'status.position,publication-status-change.started-at'
  },
  {
    keyName: 'next',
    translationKey: 'publications-table-next',
    translationKeySmall: 'publications-table-next-small',
    showByDefault: true,
    sortKey: 'status.position,publication-next-change.started-at'
  }
];
