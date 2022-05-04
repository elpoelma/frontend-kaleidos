/* global context, it, cy, beforeEach, afterEach, Cypress, it */
// / <reference types="Cypress" />
import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function visitPublicationSearch() {
  cy.intercept('GET', '/regulation-types?**').as('getRegulationTypes');
  cy.intercept('GET', '/publication-flows/search?**').as('publicationInitialSearchCall');
  cy.visit('zoeken/publicaties');
  cy.wait('@getRegulationTypes');
  cy.wait('@publicationInitialSearchCall');
}

function checkPublicationSearch(searchTerm, result) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(route.search.input).clear()
    .type(searchTerm);
  cy.get(route.search.trigger).click();
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(result);
  searchFakePublication();
}

function checkPublicationSearchForDateType(dateType, date, pubNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(route.searchPublications.dateType).select(dateType);
  cy.get(route.searchPublications.date).click();
  cy.setDateInFlatpickr(date);
  cy.get(route.search.trigger).click();
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.wait(1000); // TODO This is to test if the flakyness is solved by waiting longer or if the problem is elsewhere
  cy.get(route.searchPublications.dataTable).find('tbody')
    .children('tr')
    .contains(pubNumber);
  searchFakePublication();
}

function searchFakePublication() {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.visit('zoeken/publicaties?zoekterm=IKBESTANIET');
  cy.wait(`@publicationSearchCall${randomInt}`);
  cy.get(route.search.input).clear();
}

function checkPublicationSearchForStatusType(status, pubNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(auk.checkbox.checkbox).parent()
    .contains(status)
    .click()
    .wait(`@publicationSearchCall${randomInt}`);
  if (pubNumber) {
    cy.get(route.searchPublications.row.number).should('contain', pubNumber);
  }
}
// TODO-command can be used as a command
// function changeRegulationType(regulationType) {
//   cy.get(publication.publicationNav.decisions).click();
//   cy.get(publication.decisionsInfoPanel.openEdit).click();
//   cy.get(publication.decisionsInfoPanel.edit.regulationType).find(dependency.emberPowerSelect.trigger)
//     .click();
//   cy.get(dependency.emberPowerSelect.option).contains(regulationType)
//     .scrollIntoView()
//     .trigger('mouseover')
//     .click();
//   const randomInt = Math.floor(Math.random() * Math.floor(10000));
//   cy.intercept('PATCH', '/publication-flows/**').as(`patchPublicationFlow${randomInt}`);
//   cy.get(publication.decisionsInfoPanel.save).click();
//   cy.wait(`@patchPublicationFlow${randomInt}`);
// }

function checkPublicationSearchForRegulationType(regulationType, pubNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/publication-flows/search?**').as(`publicationSearchCall${randomInt}`);
  cy.get(auk.checkbox.checkbox).parent()
    .contains(regulationType)
    .click()
    .wait(`@publicationSearchCall${randomInt}`);
  if (pubNumber) {
    cy.get(route.searchPublications.row.number).should('contain', pubNumber);
  }
}

// TODO-publication make Test to register publication
// cy.get(publication.publicationNav.publications).click();
// cy.get(publication.publicationsInfoPanel.edit).click();
// cy.get(publication.publicationsInfoPanel.targetEndDate).find(auk.datepicker)
//   .click();
// cy.setDateInFlatpickr(fields.publicationTargetEndDate);
// cy.get(publication.publicationActivities.register).click();
// cy.get(publication.publicationRegistration.publicationDate).find(auk.datepicker)
//   .click();
// cy.setDateInFlatpickr(fields.publicationDate);
// cy.intercept('PATCH', '/publication-flows/*').as('patchPublicationFlow');
// cy.get(publication.publicationRegistration.save).click()
//   .wait('@patchPublicationFlow');

context('Search tests', () => {
  // INFO: enable search, elasticsearch and tika for this spec
  // *WARN* All "fieldx" objects are of data that are in the default testdata, do not change.
  const fields = {
    number: 2001,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed: uniek',
    longTitle: 'Besluitvorming Vlaamse Regering fedora: origineel',
    numacNumber: 123456,
    decisionDate: Cypress.dayjs('2022-06-29'),
    receptionDate: Cypress.dayjs('2022-06-30'),
    publicationDueDate: Cypress.dayjs('2022-07-01'),
    publicationTargetEndDate: Cypress.dayjs('2022-07-06'),
    publicationDate: Cypress.dayjs('2022-07-04'),
    translationDueDate: Cypress.dayjs('2022-07-05'),
    requestProofStartDate: Cypress.dayjs('2022-05-02'),
    proofingActivityEndDate: Cypress.dayjs('2022-05-03'),
  };

  const fields1 = {
    number: 2002,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Naar vertaaldienst',
  };
  const fields2 = {
    number: 2003,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Vertaling in',
  };
  const fields3 = {
    number: 2004,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Drukproef aangevraagd',
  };

  const fields4 = {
    number: 2005,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    regulationType: 'Decreet',
  };
  const fields5 = {
    number: 2006,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    regulationType: 'Besluit van de Vlaamse Regering',
  };
  const fields6 = {
    number: 2007,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    regulationType: 'Ministerieel besluit',
  };

  const fieldsWithDoubleDates = {
    number: 2010,
    shortTitle: 'Besluitvorming Vlaamse Regering hoed',
    status: 'Naar vertaaldienst',
    regulationType: 'Decreet',
    decisionDate: Cypress.dayjs('2022-06-29'),
    receptionDate: Cypress.dayjs('2022-06-30'),
    publicationDueDate: Cypress.dayjs('2022-07-01'),
  };

  beforeEach(() => {
    cy.login('Ondersteuning Vlaamse Regering en Betekeningen');
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

  it('Should change the amount of elements to every value in selectbox in publicaties search view', () => {
    visitPublicationSearch();
    const options = [5, 10, 25, 50, 100];
    searchFunction(options);
  });

  it('search for all different unique searchterms in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearch(fields.number, fields.number);
    checkPublicationSearch(fields.numacNumber, fields.number);
    checkPublicationSearch(fields.shortTitle, fields.number);
    checkPublicationSearch(fields.longTitle, fields.number);
  });

  it('search for all different dates in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearchForDateType('Datum beslissing', fields.decisionDate, fields.number);
    checkPublicationSearchForDateType('Datum ontvangst', fields.receptionDate, fields.number);
    checkPublicationSearchForDateType('Gevraagde publicatie datum', fields.publicationTargetEndDate, fields.number);
    checkPublicationSearchForDateType('Limiet vertaling', fields.translationDueDate, fields.number);
    checkPublicationSearchForDateType('Aanvraag drukproef', fields.requestProofStartDate, fields.number);
    checkPublicationSearchForDateType('Drukproef in', fields.proofingActivityEndDate, fields.number);
    checkPublicationSearchForDateType('Publicatie datum', fields.publicationDate, fields.number);
    checkPublicationSearchForDateType('Limiet publicatie', fields.publicationDueDate, fields.number);
  });

  it('search for different statuses in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearchForStatusType('Gepauzeerd');
    cy.get(route.searchPublications.row.number).should('not.contain', fields1.number);
    checkPublicationSearchForStatusType(fields1.status, fields1.number);
    checkPublicationSearchForStatusType(fields2.status, fields2.number);
    checkPublicationSearchForStatusType(fields3.status, fields3.number);
  });

  it('search for different regulation types in publicaties', () => {
    visitPublicationSearch();
    checkPublicationSearchForRegulationType('Erratum');
    cy.get(route.searchPublications.row.number).should('not.contain', fields4.number);
    checkPublicationSearchForRegulationType(fields4.regulationType, fields4.number);
    checkPublicationSearchForRegulationType(fields5.regulationType, fields5.number);
    checkPublicationSearchForRegulationType(fields6.regulationType, fields6.number);
  });

  it('combined searches in publicaties', () => {
    const generalTerm = '"Besluitvorming Vlaamse Regering hoed"';

    visitPublicationSearch();

    // search with vague term
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall1');
    cy.get(route.search.input).clear()
      .type(generalTerm);
    cy.get(route.search.trigger).click();
    cy.wait('@publicationSearchCall1');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 8);

    // search with double date
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall2');
    cy.get(route.searchPublications.dateType).select('Datum beslissing');
    cy.get(route.searchPublications.date).click();
    cy.setDateInFlatpickr(fields.decisionDate);
    cy.get(route.search.trigger).click();
    cy.wait('@publicationSearchCall2');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 2)
      .contains(fieldsWithDoubleDates.number);

    // search with status and regulation type
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall3');
    cy.get(auk.checkbox.checkbox).parent()
      .contains(fieldsWithDoubleDates.status)
      .click();
    cy.get(auk.checkbox.checkbox).parent()
      .contains(fieldsWithDoubleDates.regulationType)
      .click()
      .wait('@publicationSearchCall3');
    cy.get(route.searchPublications.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(fieldsWithDoubleDates.number);

    // change status
    cy.intercept('GET', '/publication-flows/search?**').as('publicationSearchCall4');
    cy.get(auk.checkbox.checkbox).parent()
      .contains(fieldsWithDoubleDates.status)
      .click();
    // search with searchterm + decisionDate + regulation-type but with different status
    cy.get(auk.checkbox.checkbox).parent()
      .contains(fields2.status)
      .click()
      .wait('@publicationSearchCall4');
    cy.get(utils.vlAlert.message).should('contain', 'Er werden geen resultaten gevonden. Pas je trefwoord en filters aan.');
  });
});
