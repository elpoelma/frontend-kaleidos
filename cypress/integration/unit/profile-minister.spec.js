/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import cases from '../../selectors/case.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

context('Testing the application as Minister user', () => {
  beforeEach(() => {
    cy.login('Minister');
  });

  // M-header toolbar tests

  it('Should have meeting, Case, search and Newsletter in toolbar', () => {
    cy.get(utils.mHeader.publications).should('not.exist');
    cy.get(utils.mHeader.agendas).should('exist');
    cy.get(utils.mHeader.cases).should('exist');
    cy.get(utils.mHeader.newsletters).should('exist');
    cy.get(utils.mHeader.search).should('exist');
    cy.get(utils.mHeader.settings).should('not.exist');
  });

  it('Should switch to Agenda tab when agenda is clicked as minister', () => {
    cy.get(utils.mHeader.agendas).click();
    cy.get(route.agendas.title).should('exist');
    cy.url().should('include', '/overzicht');
  });

  it('Should switch to cases tab when cases is clicked as minister', () => {
    cy.get(utils.mHeader.cases).click();
    cy.get(cases.casesHeader.title).should('exist');
    cy.url().should('include', '/dossiers');
  });

  it('Should switch to newsletter tab when newsletter is clicked as minister', () => {
    cy.get(utils.mHeader.newsletters).click();
    cy.get(newsletter.newsletterHeader.title).should('exist');
    cy.url().should('include', '/kort-bestek');
  });

  it('Should switch to search tab when search is clicked as minister', () => {
    cy.get(utils.mHeader.search).click();
    cy.get(route.search.title).should('exist');
    cy.url().should('include', '/zoeken');
  });
});
