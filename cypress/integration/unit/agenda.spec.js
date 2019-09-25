/// <reference types="Cypress" />

context('Agenda tests', () => {
  beforeEach(() => {
    cy.login('Admin')
  });

  it('should create a new agenda and then delete it', () => {
    cy.server();
    // cy.route('POST', '/meetings').as('createNewMeeting');
    cy.route('POST', '/agendas').as('createNewAgenda');
    cy.route('POST', '/agendaitems').as('createNewAgendaItems');

    const plusMonths = 1;
    const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 16).set('hour', 16).set('minute', 16);

    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven').then((meetingId) => {
      cy.get('.vl-alert').contains('Gelukt');
      cy.wait('@createNewAgenda',{ timeout: 20000 });
      cy.wait('@createNewAgendaItems',{ timeout: 20000 });
      cy.deleteAgenda(agendaDate, meetingId);

    });
  });

});
