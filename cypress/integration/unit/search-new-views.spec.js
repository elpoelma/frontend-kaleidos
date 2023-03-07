/* global context, it, cy, beforeEach, afterEach, it */
// / <reference types="Cypress" />
// import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';

context('New search views tests', () => {
  const options = [10, 25, 50, 100, 200];
  const emptyStateMessage = 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  const searchFunction = (elementsToCheck) => {
    elementsToCheck.forEach((option) => {
      cy.get(route.search.input).type('test');
      cy.get(route.search.trigger).click();
      cy.get(utils.numberPagination.container).find(dependency.emberPowerSelect.trigger)
        .click();
      cy.get(dependency.emberPowerSelect.option).contains(option)
        .click();
      cy.url().should('include', `aantal=${option}`);
      cy.get(route.search.input).clear();
    });
  };

  context('Test zoeken/dossiers', () => {
    beforeEach(() => {
      cy.visit('/zoeken/dossiers');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);

      cy.get(route.searchCases.removedCasesList);

      cy.get(route.searchConfidentialOnly.checkbox);
    });

    it('Search for non-existing and existing searchterm in dossiers and check resultcard', () => {
      const searchTerm = 'search dossier 1';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/decisionmaking-flows/search?**').as('searchCall1');
      cy.get(route.search.trigger).click()
        .wait('@searchCall1');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/decisionmaking-flows/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      // TODO-waits
      cy.wait(1000);
      cy.get(route.searchCases.dataTable).find('tbody')
        .children('tr')
        .should('have.length', 1);
      cy.get(route.caseResultCard.shortTitleLink).contains(searchTerm);

      // check resultcard
      cy.get(route.caseResultCard.date).contains('28-02-2022');
      cy.get(route.caseResultCard.foundSubcases);
    });
  });

  context('Test zoeken/agendapunten', () => {
    beforeEach(() => {
      cy.visit('/zoeken/agendapunten');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);
      cy.get(auk.loader).should('not.exist');

      cy.get(route.searchMinisterFilter.list);

      cy.get(route.searchAgendaitems.filter.type);

      cy.get(route.searchAgendaitems.filter.finalAgenda);
    });

    it('Search for non existing and existing searchterm in agendaitems', () => {
      const searchTerm = 'testId=1653051049: dit is de korte titel for search 🔍 Lāna Hawaï eiland';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall1');
      cy.get(route.search.trigger).click()
        .wait('@searchCall1');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      cy.get(route.searchAgendaitems.dataTable).find('tbody')
        .children('tr')
        .should('have.length', 1);
      cy.get(route.agendaitemResultCard.shortTitleLink).contains(searchTerm);

      // check resultcard
      cy.get(route.agendaitemResultCard.type).contains('Nota');
      cy.get(route.agendaitemResultCard.date).contains('28-02-2022');
      cy.get(route.agendaitemResultCard.title).contains('testId=1653051049: dit is de lange titel for search and searching 🔎 Principiële accénten');
      cy.get(route.agendaitemResultCard.agendaSerialNumber).contains('Uit Agenda versie A');
      // TODO check result with past agendaversion?
      cy.get(route.agendaitemResultCard.pastAgendaVersion).should('not.exist');
    });
  });

  context('Test zoeken/documenten', () => {
    beforeEach(() => {
      cy.visit('/zoeken/documenten');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);

      cy.get(route.searchConfidentialOnly.checkbox);

      cy.get(route.searchDocumentTypeFilter.list);
    });

    it('Search for non existing and existing searchterm in pieces', () => {
      const searchTerm = 'test pdf';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/pieces/search?**').as('searchCall');
      cy.get(route.search.trigger).click()
        .wait('@searchCall');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/pieces/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      // cy.get(route.searchDocuments.dataTable).find('tbody')
      //   .children('tr');
      cy.get(route.documentResultCard.filename).contains('test.pdf');
      // TODO check if changing document title shows in result?

      // check resultcard
      cy.get(route.documentResultCard.date).contains('12-05-2020');
      // TODO check shorttitle?
      cy.get(route.documentResultCard.agendaItem).contains('Geüpload in agendapunt');
    });
  });

  context('Test zoeken/beslissingen', () => {
    beforeEach(() => {
      cy.visit('/zoeken/beslissingen');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);
    });

    it('Search for non existing and existing searchterm in decisions', () => {
      const searchTerm = 'test';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall');
      cy.get(route.search.trigger).click()
        .wait('@searchCall');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/agendaitems/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      // cy.get(route.searchDecisions.dataTable).find('tbody')
      //   .children('tr');
      cy.get(route.decisionResultCard.shortTitleLink).contains(searchTerm);

      // check resultcard
      cy.get(route.decisionResultCard.date).contains('01-04-2020');
      cy.get(route.decisionResultCard.result);
      // TODO check different pills?
    });
  });

  context('Test zoeken/kort-bestek', () => {
    beforeEach(() => {
      cy.visit('/zoeken/kort-bestek');
    });

    it('Should change the amount of elements to every value in selectbox in agendapunten search view', () => {
      searchFunction(options);
    });

    it('Should check all filters', () => {
      cy.get(route.search.to);
      cy.get(route.search.from);

      cy.get(route.searchMinisterFilter.list);
    });

    it('Search for non existing and existing searchterm in news-items', () => {
      const searchTerm = 'Dit is een leuke beslissing';

      // search for non-existing searchterm
      cy.get(route.search.input).clear;
      cy.get(route.search.input).type('nietstezienhier');

      cy.intercept('GET', '/news-items/search?**').as('searchCall');
      cy.get(route.search.trigger).click()
        .wait('@searchCall');

      cy.get(auk.emptyState.message).should('contain', emptyStateMessage);

      // search for existing searchterm
      cy.get(route.search.input).clear();
      cy.get(route.search.input).type(searchTerm);

      cy.intercept('GET', '/news-items/search?**').as('searchCall2');
      cy.get(route.search.trigger).click()
        .wait('@searchCall2');

      // cy.get(route.searchNewsletters.dataTable).find('tbody')
      //   .children('tr')
      //   .should('have.length', 3);
      cy.get(route.newsItemResultCard.text).contains(searchTerm);

      // check resultcard
      cy.get(route.newsItemResultCard.date).contains('05-05-2022');
      cy.get(route.newsItemResultCard.titleLink).contains('Eerste stap');
      cy.get(route.newsItemResultCard.mandatees);
    });
  });
});
