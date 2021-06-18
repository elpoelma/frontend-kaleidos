const selectors = {
  /* IMPORTANT! README
   *
   * In the near future, AUK component will become a dependency we import
   * This will result in the loss of data-test-auk selectors we are currently using
   * We will have to work with a combination of css selectors and 'data-test-xyz' passed on via ...attributes
   * Take this into account when adding to this file
   *
   */

  /** Section for non AUK components (but have auk-like selectors) **/

  // TODO na refactoring naar auk::Tab herbekijken
  // subcase-detail-nav
  subcaseDetailNav: {
    tabNavBack: '[data-test-auk-tab-hierarchical-back]',
  },

  // TODO this component is basically a link-to, refactor to au-component
  // back-button
  backButton: '[data-test-auk-back-button]',

  /** Section multiple selector AUK components **/

  alert: {
    container: '.auk-alert',
    title: '.auk-alert__title',
    message: '.auk-alert__message',
  },

  label: {
    error: '.auk-label-error',
  },

  modal: {
    container: '[data-test-au-modal]',
    body: '[data-test-au-modal-body]',
    header: {
      title: '[data-test-au-modal-header-title]',
      // TODO unused selectors
      close: '[data-test-au-modal-header-close]',
      resize: '[data-test-au-modal-header-resize]',
    },
    footer: {
      cancel: '[data-test-au-modal-footer-cancel]',
      // there is no default footer-save available (yet), use a custom selector for your use case
      // save: '[data-test-au-modal-footer-save]',
    },
  },

  // TODO unused selectors
  emptyState: {
    container: '.auk-empty-state',
    message: '.auk-empty-state__content',
  },

  /** Section single selector AUK components **/

  loader: '.auk-loader',
  pill: '.auk-pill',
  // TODO unused selectors
  input: '.auk-input',
  textarea: '.auk-textarea',
};
export default selectors;
