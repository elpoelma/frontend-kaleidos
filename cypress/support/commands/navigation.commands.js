/* global cy, Cypress */
// / <reference types="Cypress" />
import utils from '../../selectors/utils.selectors';

/**
 * @description Clicks on the specified reverse tab for navigating
 * @name clickReverseTab
 * @if class="vlc-tabs-reverse"
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} tabName The name of the tab to click on, case sensitive
 */
function clickReverseTab(tabName) {
  cy.log('clickReverseTab');
  cy.get('.vlc-tabs-reverse', {
    timeout: 12000,
  }).should('exist')
    .within(() => {
    // cy.wait(1000);
      cy.contains(tabName).click();
    });
  cy.log('/clickReverseTab');
}

/**
 * @description Navigate one path up
 * @name navigateBack
 * @memberOf Cypress.Chainable#
 * @function
 */
function navigateBack() {
  cy.log('navigateBack');
  cy.get(utils.navigationWalkUp).click();
  cy.log('/navigateBack');
}

Cypress.Commands.add('clickReverseTab', clickReverseTab);
Cypress.Commands.add('navigateBack', navigateBack);
