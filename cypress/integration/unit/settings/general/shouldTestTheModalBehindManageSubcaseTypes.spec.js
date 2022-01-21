/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Manage Sub codes tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  it('Should open the model behind manage subcase types', () => {
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageSubcaseTypes).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible');
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.overview.manageSubcaseTypes).click();
    cy.get(utils.vlModal.dialogWindow).should('be.visible');
    cy.get(utils.vlModal.close).click();
    cy.get(utils.vlModal.dialogWindow).should('not.exist');
  });
});
