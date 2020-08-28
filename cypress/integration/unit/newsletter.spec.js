/* global context, before, cy,beforeEach, xit, Cypress */
// / <reference types="Cypress" />

context('Test the KB functionality', () => {
  before(() => {
    cy.server();
    cy.resetCache();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  xit('should test the newsletter of an agenda', () => {
    const agendaDate = Cypress.moment().add(3, 'weeks')
      .day(4); // Next friday

    cy.createAgenda('Ministerraad', agendaDate, 'Test Kort bestek toevoegen').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);

      // WIP

      cy.deleteAgenda(result.meetingId, true);
    });
  });
});
