/* global  cy, Cypress */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import utils from '../../selectors/utils.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import dependency from '../../selectors/dependency.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

// ***********************************************
// Functions

/**
 * @description Translates a month number to a dutch month in lowercase.
 * @name getTranslatedMonth
 * @memberOf Cypress.Chainable#
 * @function
 * @param month {number}  the number of the month to translate (from moment so starts from 0)
 * @returns {string} the month in dutch
 */
function getTranslatedMonth(month) {
  cy.log('getTranslatedMonth');
  switch (month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';
    default:
      return '';
  }
}

/**
 * Open the subcase of the specified index.
 * @memberOf Cypress.Chainable#
 * @name openSubcase
 * @function
 * @param {number} [index] The list index of the subcase to select, default 0
 * @param {string} - the short title to check if a new subcase is fully created before trying to open the latest one
 */
function openSubcase(index = 0, shortTitle) {
  cy.log('openSubcase');
  // cy.intercept('GET', '/subcases?**').as('getSubcases');
  // cy.wait('@getSubcases', { timeout: 12000 });
  cy.wait(2000); // link does not always work (not visible or click does nothing unless we wait)
  if (shortTitle) {
    cy.get(cases.subcaseProcess.shorttitle).should('contain', shortTitle);
  }
  cy.get(cases.subcaseItem.container).eq(index)
    .find(cases.subcaseItem.link)
    .click();
  cy.log('/openSubcase');
}

/**
 * Changes the subcase access levels and titles when used in the subcase view
 * shortTitle is required to find the dom element
 * @name changeSubcaseAccessLevel
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} [confidentialityChange] -Will change the current confidentiality if true
 * @param {string} [newShortTitle] - new short title for the subcase
 * @param {string} [newLongTitle] - new long title for the subcase
 */
function changeSubcaseAccessLevel(confidentialityChange, newShortTitle, newLongTitle) {
  cy.log('changeSubcaseAccessLevel');
  cy.intercept('PATCH', '/subcases/*').as('patchSubcase');

  cy.get(cases.subcaseTitlesView.edit).click();

  if (confidentialityChange) {
    cy.get(cases.subcaseTitlesEdit.confidential)
      .parent()
      .click();
  }
  if (newShortTitle) {
    cy.get(cases.subcaseTitlesEdit.shorttitle).click()
      .clear()
      .type(newShortTitle);
  }
  if (newLongTitle) {
    cy.get(cases.subcaseTitlesEdit.title).click()
      .clear()
      .type(newLongTitle);
  }

  cy.get(cases.subcaseTitlesEdit.actions.save)
    .click();
  cy.wait('@patchSubcase');
  cy.log('/changeSubcaseAccessLevel');
}

/**
 * Adds a mandatee to a sucase when used in the subcase view
 * Pass a valid entry from 'mandatee-names.selectors.js'
 * @name addSubcaseMandatee
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Number} mandateeNamesSelector - The mandatee to search, must be a valid entry from 'mandatee-names.selectors.js'. Defaults to first current mandatee
 */
function addSubcaseMandatee(mandateeNamesSelector = mandateeNames.current.first) {
  cy.log('addSubcaseMandatee');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/government-bodies?filter**').as(`getGovernmentBodies${randomInt}`);
  cy.intercept('GET', '/mandatees?filter**government-body**').as(`getMandatees${randomInt}`);

  cy.intercept('PATCH', '/subcases/*').as(`patchSubcase${randomInt}`);
  cy.get(mandatee.mandateePanelView.actions.edit).click();
  cy.get(mandatee.mandateePanelEdit.actions.add).click();
  cy.wait(`@getGovernmentBodies${randomInt}`);
  cy.wait(`@getMandatees${randomInt}`, {
    timeout: 60000,
  });
  cy.get(utils.mandateeSelector.container).find(dependency.emberPowerSelect.trigger)
    .click();
  cy.get(dependency.emberPowerSelect.searchInput).type(mandateeNamesSelector.lastName);
  cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
  cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist');

  // when searching we select the result with a specific title
  if (mandateeNamesSelector.searchTitle) {
    cy.get(dependency.emberPowerSelect.option).contains(mandateeNamesSelector.searchTitle)
      .click();
  } else {
    cy.get(dependency.emberPowerSelect.option).contains(mandateeNamesSelector.title)
      .click();
  }
  cy.get(dependency.emberPowerSelect.option).should('not.exist', {
    timeout: 60000,
  });
  cy.get(utils.mandateesSelector.add).click();
  cy.get(mandatee.mandateePanelEdit.actions.save).click();
  cy.wait(`@patchSubcase${randomInt}`, {
    timeout: 40000,
  });
  cy.log('/addSubcaseMandatee');
}

/**
 * Adds a mandatee to an agendaitem when used in the agendaitem detail view (/vergadering/..id../agenda/..id../agendapunten/..id)
 * Pass a valid entry from 'mandatee-names.selectors.js'
 * @name addAgendaitemMandatee
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Number} mandateeNamesSelector - The mandatee to search, must be a valid entry from 'mandatee-names.selectors.js'. Defaults to first current mandatee
 * @param {isDesignAgenda} isDesignAgenda - whether or not the agenda has status designagenda. Defaults to true
 */
function addAgendaitemMandatee(mandateeNamesSelector = mandateeNames.current.first, isDesignAgenda = true) {
  cy.log('addAgendaitemMandatee');
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/agendaitems/*').as(`patchAgendaitem${randomInt}`);
  cy.intercept('PATCH', '/agendas/*').as(`patchAgenda${randomInt}`);


  cy.addSubcaseMandatee(mandateeNamesSelector);
  cy.wait(`@patchAgendaitem${randomInt}`, {
    timeout: 40000,
  });
  // the modified property is only changed on a designagenda.
  if (isDesignAgenda) {
    cy.wait(`@patchAgenda${randomInt}`, {
      timeout: 40000,
    });
  }
  // the mandatee groups have to be recalculated.
  cy.wait(2000);

  cy.log('/addAgendaitemMandatee');
}

/**
 * @name proposeSubcaseForAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {date} agendaDate - The date of the agenda
 * @param {String} numberRep - The specific numberRep for the agenda you want to use
 */
function proposeSubcaseForAgenda(agendaDate, numberRep = '') {
  cy.log('proposeSubcaseForAgenda');
  cy.intercept('POST', '/meetings/*/submit').as('submitSubcaseOnMeeting');
  const monthDutch = getTranslatedMonth(agendaDate.month());
  let formattedDate = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;
  if (numberRep) {
    formattedDate = `${formattedDate} - ${numberRep}`;
  }

  cy.get(cases.subcaseHeader.showProposedAgendas).click();

  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('GET', '/agendaitems?filter**').as(`loadAgendaData_${randomInt}`);
  cy.intercept('GET', '/subcases?filter**decisionmaking-flow**').as(`loadSubcase_${randomInt}`);
  cy.get(cases.subcaseHeader.actions.proposeForAgenda).contains(formattedDate)
    .click();
  cy.get(cases.subcaseHeader.showProposedAgendas)
    .should('not.exist');
  cy.wait('@submitSubcaseOnMeeting', {
    timeout: 24000,
  });
  // refresh happens
  cy.wait(`@loadAgendaData_${randomInt}`);
  cy.wait(`@loadSubcase_${randomInt}`);
  cy.get(appuniversum.loader).should('not.exist');
  cy.get(cases.subcaseDescription.panel).find(cases.subcaseTimeline.item); // when this succeeds the refresh happened
  cy.log('/proposeSubcaseForAgenda');
}

/**
 * @description deletes a subcase.
 * @name deleteSubcase
 * @memberOf Cypress.Chainable#
 * @function
 */
function deleteSubcase() {
  cy.log('deleteSubcase');
  cy.intercept('DELETE', '/subcases/**').as('deleteSubcase');
  cy.get(cases.subcaseHeader.actionsDropdown)
    .children(appuniversum.button)
    .click();
  cy.get(cases.subcaseHeader.actions.deleteSubcase).forceClick();

  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.wait('@deleteSubcase');
  cy.log('/deleteSubcase');
}

// ***********************************************
// Commands

Cypress.Commands.add('openSubcase', openSubcase);
Cypress.Commands.add('changeSubcaseAccessLevel', changeSubcaseAccessLevel);
Cypress.Commands.add('addSubcaseMandatee', addSubcaseMandatee);
Cypress.Commands.add('addAgendaitemMandatee', addAgendaitemMandatee);
Cypress.Commands.add('proposeSubcaseForAgenda', proposeSubcaseForAgenda);
Cypress.Commands.add('deleteSubcase', deleteSubcase);
Cypress.Commands.add('getTranslatedMonth', getTranslatedMonth);
