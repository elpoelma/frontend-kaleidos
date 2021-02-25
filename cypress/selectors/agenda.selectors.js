const selectors = {
  emberPowerSelectTrigger: '.ember-power-select-trigger',
  emberPowerSelectOption: '.ember-power-select-option',
  createNewAgendaButton: '[data-test-vlc-agenda-createnewagendabutton]',
  datepickerButton: '[data-test-vlc-vl-datepickerButton]',
  flatpickrCalendar: '.flatpickr-calendar',
  flatpickrMonthDropdownMonths: '.open  .flatpickr-monthDropdown-months',
  numInputWrapper: '.open  .numInputWrapper',
  inputNumInputCurYear: '.open  input.numInput.cur-year',
  flatpickrDay: '.open  .flatpickr-day',
  button: 'button',
  overviewTitle: '[data-test-agendas-title]',
  agendaitemKortBestekTab: '[data-test-agenda-agendaitem-tab="agendaitem-bestek"]',
  agendaitemDocumentsTab: '[data-test-agenda-agendaitem-tab="documents"]',
  agendaitemDossierTab: '[data-test-agenda-agendaitem-tab="agendaitem-case"]',
  navigateToPrintableAgenda: '[data-test-agenda-header-navigateToPrintableAgenda]',
  printContainer: '[data-test-agenda-printContainer]',
  printHeaderTitle: '[data-test-agenda-print-header-title]',
  dataTable: '.vl-data-table',
  dataTableZebra: '.vl-data-table--zebra',
  toProcedureStapLink: '.vlc-panel-layout__main-content a',
  confidentialityIcon: '[data-test-icon-agenda-confidentiality-locked]',
  agendaitemControlsActions: '[data-test-agendaitem-controls-actions]',
  agendaitemControlsActionDelete: '[data-test-agendaitem-controls-action-delete]',
  agendaitemControlsActionAdvance: '[data-test-agendaitem-controls-action-advance]',
  agendaitemControlsActionPostpone: '[data-test-agendaitem-controls-action-postpone]',
  agendaitemTitlesToSubcase: '[data-test-agendaitem-titles-to-subcase]',
  subcase: {
    agendaLink: '[data-test-subcase-agenda-link] a',
    confidentialyCheck: '[data-test-vl-subcase-titles-edit-confidentiality] input',
  },
  item: {
    checkBoxLabel: 'label.vl-checkbox--switch__label',
    actionButton: '.vl-action-group button',
    themes: '[data-test-agenda-news-item-themes]',
    news: {
      editLink: '[data-test-agenda-news-item-view] [data-test-newsletter-edit]',
      saveButton: '[data-test-newsletter-edit-save]',
      checkedThemes: '[data-test-themes-selector] input:checked',
      themesSelector: '[data-agenda-item-news-edit] [data-test-themes-selector]',
    },
  },
  agendaActions: '[data-test-agenda-header-showActionOptions]',
  approveAgenda: '[data-test-agenda-header-approveAgenda]',
  lockAgenda: '[data-test-agenda-header-lockagenda]',
  reopenPreviousVersion: '[data-test-agenda-header-reopen-previous-version]',
  agendaitemDecisionTab: '[data-test-agenda-agendaitem-tab="agendaitem-decision"]',
  deleteAgenda: '[data-test-agenda-header-deleteagenda]',
  createNewDesignAgenda: '[data-test-agenda-header-create-new-design]',
  reopenCurrentAgenda: '[data-test-agenda-header-unlockagenda]',
  agendaitemPersagendaTab: '[data-test-agenda-agendaitem-tab="agendaitem-press-agenda"]',
  addDecision: '[data-test-add-decision]',
  decisionContainer: '[data-test-decision-container]',
  deleteDecision: '[data-test-delete-decision]',
  uploadDecisionFile: '[data-test-upload-decision-file]',
  accessLevelPill: '[data-test-access-level-pill]',
  accessLevelSave: '[data-test-access-level-save]',

  subcaseTitlesEdit: '[data-test-subcase-titles-edit]',
  subcaseTitlesEditTitle: '[data-test-subcase-titles-edit-title]',
  subcaseTitlesEditShorttitle: '[data-test-subcase-titles-edit-shorttitle]',
  subcaseTitlesEditAccessLevel: '[data-test-subcase-titles-edit-accessLevel]',
  subcaseTitlesEditConfidential: '[data-test-subcase-titles-edit-confidential ]',
  subcaseTitlesEditSave: '[data-test-subcase-titles-edit-save]',

  agendaitemTitlesEdit: '[data-test-agendaitem-titles-edit]',
  agendaitemTitlesEditTitle: '[data-test-agendaitem-titles-edit-title]',
  agendaitemTitlesEditShorttitle: '[data-test-agendaitem-titles-edit-shorttitle]',
  agendaitemTitlesEditExplanation: '[data-test-agendaitem-titles-edit-explanation]',
  agendaitemTitlesEditShowInNewsletter: '[data-test-agendaitem-titles-edit-showInNewsletter]',
  agendaitemTitlesEditSave: '[data-test-agendaitem-titles-edit-save]',
  agendaitemTitlesEditConfidential: '[data-test-agendaitem-titles-edit-confidential]',

  approveDesignAgenda: '[data-test-approve-design-agenda]',
  subcaseDocumentsEdit: '[data-test-subcase-documents-edit]',
  documentType: '[data-test-document-type]',
  documentAccessLevel: '[data-test-document-accesslevel]',
  agendaDetailSidebarSubitem: '[data-test-agenda-detail-sidebar-sub-item]',
  agendaOverviewSubitem: '[data-test-agenda-overview-sub-item]',
  decisionPowerSelectContainer: '[data-test-decision-edit-power-select-container]',
  agendaHeaderShowAgendaOptions: '[data-test-agenda-header-showAgendaOptions]',
  agendaHeaderApproveAndCloseAgenda: '[data-test-agenda-header-approve-and-close-agenda]',
  deleteAgendaitemButton: '[data-test-delete-agendaitem]',
  postponeAgendaitemButton: '[data-test-postpone-agendaitem]',
  revertPostponeAgendaitemButton: '[data-test-revert-postpone-agendaitem]',
  agendaDetailSubItemContainer: '[data-test-agenda-detail-sidebar-sub-item-container]',
  agendaitemNumber: '[data-test-agendaitem-number]',

  compare: {
    showChanges: '[data-test-compare-show-changes]',
    agendaLeft: '[data-test-compare-agenda-left]',
    agendaRight: '[data-test-compare-agenda-right]',
    agendaitemLeft: '[data-test-compare-agendaitem-left]',
    agendaitemRight: '[data-test-compare-agendaitem-right]',
    announcementLeft: '[data-test-compare-announcement-left]',
    announcementRight: '[data-test-compare-announcement-right]',
  },
  agendaOverviewItemHeader: '[data-test-agenda-overview-agenda-item-header]',
  agendaSidenavElement: 'data-test-agenda-sidenav-element',
};
export default selectors;
