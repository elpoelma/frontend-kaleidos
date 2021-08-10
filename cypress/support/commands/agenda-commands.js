/* global cy, Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Commands

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

// ***********************************************
// Functions

/**
 * @description Goes to the agenda overview and creates a new agenda.
 * @name createAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} kind The kind of meeting to select, language and case sensitive
 * @param {*} date The cypress.moment object with the date and time to set
 * @param {string} location The location of the meeting to enter as input
 * @param {number} meetingNumber The number of the meeting to enter as input
 * @param {string} meetingNumberVisualRepresentation The visual representation of the meetingnumber to enter as input
 * @returns {Promise<String>} the id of the created agenda
 */
function createAgenda(kind, date, location, meetingNumber, meetingNumberVisualRepresentation) {
  cy.log('createAgenda');
  cy.route('POST', '/meetings').as('createNewMeeting');
  cy.route('POST', '/agendas').as('createNewAgenda');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  cy.visit('');
  cy.get(route.agendas.action.newMeeting).click();

  // Set the kind
  cy.get(agenda.newSession.kind).click();
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 5000,
  }).wait(500) // Experiment for dropdown flakyness, see if waiting before helps
    .contains(kind)
    .scrollIntoView()
    .trigger('mouseover')
    .click({
      force: true,
    });
  // Experiment for dropdown flakyness
  // Does the ember-power-select-option fix itself if we wait long enough ?
  cy.get(dependency.emberPowerSelect.option, {
    timeout: 15000,
  }).should('not.be.visible');
  // Could/Should we verify that the dropdown has closed, and try to repeat the process if not ?

  // Set the start date
  cy.get(agenda.newSession.datepicker).find(utils.vlDatepicker)
    .click();
  cy.setDateAndTimeInFlatpickr(date);
  // At this point, the flatpickr is still open and covers the other fields
  // To negate this, we click once with force:true on the next input field to close it
  cy.get(agenda.newSession.meetingNumber).click({
    force: true,
  });

  // Set the meetingNumber
  if (meetingNumber) {
    cy.get(agenda.newSession.meetingNumber).click()
      .clear()
      .type(meetingNumber);
  } else {
    // 1 test in agenda.spec uses this value
    cy.get(agenda.newSession.meetingNumber).click()
      .invoke('val')
      // eslint-disable-next-line
      .then((sometext) => meetingNumber = sometext);
  }

  // Set the meetingNumber representation
  let meetingNumberRep;

  if (meetingNumberVisualRepresentation) {
    cy.get(agenda.newSession.numberRep.edit).click();
    cy.get(agenda.newSession.numberRep.input).find(utils.vlFormInput)
      .click()
      .clear()
      .type(meetingNumberVisualRepresentation);
    cy.get(agenda.newSession.numberRep.save).click();
  }
  // Get the value from the meetingNumber representation
  cy.get(agenda.newSession.numberRep.edit).click();
  cy.get(agenda.newSession.numberRep.input).find(utils.vlFormInput)
    .click()
    .invoke('val')
    .then((sometext) => {
      meetingNumberRep = sometext;
    });

  // Set the location
  cy.get(agenda.newSession.meetingLocation).click()
    .type(location);

  cy.get(utils.vlModalFooter.save).click();

  let meetingId;
  let agendaId;

  cy.wait('@createNewMeeting', {
    timeout: 20000,
  })
    .then((res) => {
      meetingId = res.responseBody.data.id;
    });
  cy.wait('@createNewAgenda', {
    timeout: 20000,
  })
    .then((res) => {
      agendaId = res.responseBody.data.id;
    });
  cy.log('/createAgenda');
  cy.wait('@patchMeetings', {
    timeout: 20000,
  })
    .then(() => new Cypress.Promise((resolve) => {
      resolve({
        meetingId, meetingNumber, agendaId, meetingNumberRep,
      });
    }));
}

/**
 * @description basic visit to agenda with some data loading
 * @name visitAgendaWithLink
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} link The link to visit, should be "/vergadering/id/agenda/id/agendapunten" or "/vergadering/id/agenda/id/agendapunten/id"
 */
function visitAgendaWithLink(link) {
  cy.log('visitAgendaWithLink');
  cy.route('GET', '/agendaitems/*/agenda-activity').as('loadAgendaitems');
  cy.visit(link);
  cy.wait('@loadAgendaitems');
  cy.log('/visitAgendaWithLink');
}

/**
 * @description Searches for the agendaDate in the history view of the agenda page, or uses the meetingId to open the meeting directly using the route 'agenda/meetingId/agendapunten'
 * @name openAgendaForDate
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} agendaDate A cypress.moment object with the date to search
 */
function openAgendaForDate(agendaDate) {
  cy.log('openAgendaForDate');
  const searchDate = `${agendaDate.date()}/${agendaDate.month() + 1}/${agendaDate.year()}`;
  cy.route('GET', '/meetings?filter**').as('getFilteredMeetings');

  cy.visit('');
  cy.get(route.agendasOverview.filter.container).within(() => {
    cy.get(route.agendasOverview.filter.input).type(searchDate);
    cy.get(route.agendasOverview.filter.button).click();
  });
  cy.wait('@getFilteredMeetings', {
    timeout: 20000,
  });
  cy.get(route.agendasOverview.dataTable).find('tbody')
    .children('tr')
    .eq(0)
    .find(route.agendasOverview.navigationButton)
    .click();

  cy.url().should('include', '/vergadering');
  cy.url().should('include', '/agenda');
  cy.log('/openAgendaForDate');
}

/**
 * Goes to the detailview of agendaitem and opens the kort-bestek tab
 * @memberOf Cypress.Chainable#
 * @name openAgendaitemKortBestekTab
 * @function
 * @param {String} agendaitemTitle - title of the agendaitem
 */
function openAgendaitemKortBestekTab(agendaitemTitle) {
  cy.openDetailOfAgendaitem(agendaitemTitle);
  cy.get(agenda.agendaitemNav.newsletterTab)
    .should('be.visible')
    .click();
}

/**
 * @description Deletes the current **open agenda**, either a design or an approved one
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name deleteAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number} [meetingId] - The id of the meeting to delete to monitor if the DELETE call is made.
 * @param {boolean} [lastAgenda] - Wether the meeting will be deleted when this agenda is deleted.
 */
function deleteAgenda(meetingId, lastAgenda) {
  cy.log('deleteAgenda');
  if (meetingId) {
    cy.route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
  } else {
    cy.route('DELETE', '/meetings/**').as('deleteMeeting');
  }
  // cy.route('POST', '/agenda-approve/deleteAgenda').as('deleteAgenda');
  // Call is made but cypress doesn't see it
  cy.route('DELETE', '/newsletter-infos/**').as('deleteNewsletter');
  cy.route('GET', '/agendaitems?fields**').as('loadAgendaitems');

  cy.get(agenda.agendaHeader.showAgendaOptions).click();
  cy.get(agenda.agendaHeader.agendaActions.deleteAgenda).click();
  cy.get(auk.modal.container).find(agenda.agendaHeader.confirm.deleteAgenda)
    .click();
  if (lastAgenda) {
    cy.wait('@deleteNewsletter', {
      timeout: 20000,
    })
      .wait('@deleteMeeting', {
        timeout: 20000,
      });
  }
  cy.get(auk.modal.container, {
    timeout: 20000,
  }).should('not.exist');
  if (!lastAgenda) {
    cy.wait('@loadAgendaitems');
  }
  // loading page is no longer visible
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');

  cy.log('/deleteAgenda');
}

/**
 * @description Set the agendaitem with the given index to formally ok, only works if this value is not yet selected
 * @name setFormalOkOnItemWithIndex
 * @memberOf Cypress.Chainable#
 * @function
 */
function setFormalOkOnItemWithIndex(indexOfItem, fromWithinAgendaOverview = false, formalityStatus = 'Formeel OK') {
  cy.log('setFormalOkOnItemWithIndex');
  if (!fromWithinAgendaOverview) {
    cy.clickReverseTab('Overzicht');
  }
  cy.get(agenda.agendaOverview.formallyOkEdit).click();
  // Data loading occurs here
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');

  cy.get(agenda.agendaOverviewItem.container).eq(indexOfItem)
    .scrollIntoView()
    .find(agenda.agendaOverviewItem.formallyOk)
    .click();
  const int = Math.floor(Math.random() * Math.floor(10000));
  cy.route('PATCH', '/agendaitems/**').as(`patchAgendaitem_${int}`);
  cy.get(dependency.emberPowerSelect.option)
    .contains(formalityStatus)
    .click();
  cy.wait(`@patchAgendaitem_${int}`);
  cy.get(utils.changesAlert.close).click();
  cy.log('/setFormalOkOnItemWithIndex');
}

/**
 * @description Set all agendaitems to formallyOk
 * @name setAllItemsFormallyOk
 * @memberOf Cypress.Chainable#
 * @function
 */
function setAllItemsFormallyOk(amountOfFormallyOks) {
  cy.log('setAllItemsFormallyOk');
  const verifyText = `Bent u zeker dat u ${amountOfFormallyOks} agendapunten formeel wil goedkeuren`;
  cy.route('GET', '/agendaitems/*/modified-by').as('getModifiedByOfAgendaitems');
  cy.get(agenda.agendaHeader.showActionOptions).click();
  cy.route('PATCH', '/agendaitems/**').as('patchAgendaitems');
  cy.get(agenda.agendaHeader.actions.approveAllAgendaitems).click();
  cy.get(auk.loader).should('not.exist'); // new loader when refreshing data
  cy.get(utils.vlModalVerify.container).should('contain', verifyText);
  cy.get(utils.vlModalVerify.save).click();
  cy.wait('@patchAgendaitems');
  cy.wait('@getModifiedByOfAgendaitems');
  cy.log('/setAllItemsFormallyOk');
}


/**
 * @description Check all approval checkboxes of an agendaitem
 * @name approveCoAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} agendaitemShortTitle - The short title of the case with coapprovals, must be unique in an agenda.
 */
// TODO-coapproval unused method for an unused feature, refactor later
function approveCoAgendaitem(agendaitemShortTitle) {
  cy.log('approveCoAgendaitem');
  cy.route('GET', '/government-fields/**/domain').as('getGovernmentFieldDomains');
  cy.route('PATCH', '/approvals/**').as('patchApprovals');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.contains(agendaitemShortTitle).click();
  cy.wait('@getGovernmentFieldDomains', {
    timeout: 50000,
  });
  cy.get('.auk-panel-layout__main-content').within(() => {
    cy.get('.auk-u-mb-8').as('detailBlocks');
    cy.get('@detailBlocks').eq(4)
      .within(() => {
        cy.contains('Acties').should('exist');
        cy.contains('Wijzigen').click();
        cy.get('.auk-table > tbody > tr').as('mandatees');
        cy.get('@mandatees').each((item) => {
          cy.get(item).within(() => {
            cy.get('.auk-checkbox', {
              timeout: 10000,
            }).should('exist')
              .click();
          });
        });

        cy.get('.auk-toolbar-complex__item > .auk-button')
          .contains('Opslaan')
          .click();
      });
  });
  cy.wait('@patchApprovals', {
    timeout: 10000,
  });
  cy.wait('@patchAgenda', {
    timeout: 10000,
  });
  cy.log('/approveCoAgendaitem');
}

/**
 * @description triggers the action "approve agenda" in agenda view
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * This pop will contain information about which agendaitems are not ok, if any
 * @name approveDesignAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Boolean} shouldConfirm - Default true, should the command click the confirm button
 */
function approveDesignAgenda(shouldConfirm = true) {
  cy.log('approveDesignAgenda');

  cy.get(agenda.agendaHeader.showAgendaOptions).click();
  cy.get(agenda.agendaHeader.agendaActions.approveAgenda).click();
  cy.get(auk.loader).should('not.exist'); // new loader when refreshing data
  if (shouldConfirm) {
    cy.get(auk.modal.container).find(agenda.agendaHeader.confirm.approveAgenda)
      .click();
    // as long as the modal exists, the action is not completed
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    // agendaitems are loading after action is completed
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
  }

  cy.log('/approveDesignAgenda');
}

/**
 * @description triggers the action "approve and close agenda" in agenda view
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * This pop will contain information about which agendaitems are not ok, if any
 * @name approveAndCloseDesignAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Boolean} shouldConfirm - Default true, should the command click the confirm button
 */
function approveAndCloseDesignAgenda(shouldConfirm = true) {
  cy.log('approveAndCloseDesignAgenda');

  cy.get(agenda.agendaHeader.showAgendaOptions).click();
  cy.get(agenda.agendaHeader.agendaActions.approveAndCloseAgenda).click();
  cy.get(auk.loader).should('not.exist'); // new loader when refreshing data
  if (shouldConfirm) {
    cy.get(auk.modal.container).find(agenda.agendaHeader.confirm.approveAndCloseAgenda)
      .click();
    // as long as the modal exists, the action is not completed
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
  }
  cy.log('/approveAndCloseDesignAgenda');
}

/**
 * @description Add a new subcase to the agenda
 * @name addAgendaitemToAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} subcaseTitle - The title of the case, Mandatory
 * @param {boolean} postponed - DO NOT USE, Feature no longer works properly but still exists, default false
 */
function addAgendaitemToAgenda(subcaseTitle, postponed = false) {
  cy.log('addAgendaitemToAgenda');
  cy.route('GET', '/subcases?**sort**').as('getSubcasesFiltered');
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('POST', '/agenda-activities').as('createAgendaActivity');
  cy.route('PATCH', '/subcases/**').as('patchSubcase');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.get(auk.loader).should('not.exist');
  cy.get(agenda.agendaHeader.showActionOptions).click();
  cy.get(agenda.agendaHeader.actions.addAgendaitems).click();
  cy.wait('@getSubcasesFiltered', {
    timeout: 20000,
  });

  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.get(utils.vlModal.dialogWindow).within(() => {
    if (postponed) {
      cy.get(agenda.createAgendaitem.postponedCheckbox).click();
    }
    cy.get(auk.loader, {
      timeout: 12000,
    }).should('not.exist');
    // type the subcase title from parameters to search
    cy.get(agenda.createAgendaitem.input).clear()
      .type(subcaseTitle, {
        force: true,
      });
    cy.route('GET', `/subcases?filter**filter[short-title]=${subcaseTitle}**`).as('getSubcasesFiltered');
    cy.wait('@getSubcasesFiltered', {
      timeout: 12000,
    });
    cy.get(auk.loader, {
      timeout: 12000,
    }).should('not.exist');
    // select the found row (title should always match only 1 result to avoid using the wrong subcase)
    cy.get(agenda.createAgendaitem.dataTable).find('tbody')
      .children('tr')
      .as('rows');

    cy.get('@rows', {
      timeout: 12000,
    }).eq(0)
      .click()
      .get(utils.vlCheckbox.checkbox)
      .should('be.checked');
    cy.get(utils.vlModalFooter.save).click();
  });

  cy.wait('@createAgendaActivity', {
    timeout: 20000,
  });
  cy.route('GET', '/agendaitems?fields**').as(`loadAgendaitemFields${randomInt}`);
  cy.wait('@createNewAgendaitem', {
    timeout: 20000,
  })
    .wait('@patchSubcase', {
      timeout: 20000,
    })
    .wait('@patchAgenda', {
      timeout: 20000,
    });
  cy.wait(`@loadAgendaitemFields${randomInt}`);
  cy.log('/addAgendaitemToAgenda');
}

/**
 * @description Toggles the show changes
 * @name toggleShowChanges
 * @memberOf Cypress.Chainable#
 * @function
 */
function toggleShowChanges() {
  cy.log('toggleShowChanges');
  cy.clickReverseTab('Overzicht');
  cy.get(auk.loader).should('not.exist'); // data is not loading
  cy.get(agenda.agendaOverview.showChanges).click();
  // data loading is triggered so we check for the loader
  cy.get(auk.loader).should('not.exist');
  cy.log('/toggleShowChanges');
}

/**
 * @description Checks if an agendaitem with a specific name exists on an agenda,
 * if you want to open the agendaitem at the same time, use cy.openDetailOfAgendaitem(agendaitemName)
 * @name agendaitemExists
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemName - title of the agendaitem
 */
function agendaitemExists(agendaitemName) {
  cy.log('agendaitemExists');
  cy.wait(200);
  // Check which reverse tab is active
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');
  cy.get(auk.tab.activeHref).then((element) => {
    const selectedReverseTab = element[0].text;
    if (selectedReverseTab.includes('Detail')) {
      cy.get(agenda.agendaDetailSidebar.subitem)
        .contains(agendaitemName, {
          timeout: 12000,
        })
        .as('foundAgendaitem');
    } else {
      if (!selectedReverseTab.includes('Overzicht')) {
        cy.clickReverseTab('Overzicht');
        cy.get(agenda.agendaOverviewItem.subitem);
        // data loading could be awaited  '/agendaitem?fields**' or next get() fails, solved bij checking loading modal
        cy.log('data needs to be loaded now, waiting a few seconds');
        cy.get(auk.loader, {
          timeout: 20000,
        }).should('not.exist');
      }
      cy.get(agenda.agendaOverviewItem.subitem)
        .contains(agendaitemName, {
          timeout: 24000,
        })
        .as('foundAgendaitem');
    }
  });
  cy.log('/agendaitemExists');
  // By getting the aliased agendaitem as last action in the command, we can chain off this in future commands
  // Used mainly for the command "openDetailOfAgendaitem"
  cy.get('@foundAgendaitem');
}

/**
 * @description Checks if an agendaitem with a specific name exists on the open agenda and opens it
 * @name openDetailOfAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemName - title of the agendaitem.
*  @param {boolean} isAdmin - optional boolean to indicate that we are admin (some profiles can't see the link to subcase)
 */
function openDetailOfAgendaitem(agendaitemName, isAdmin = true) {
  cy.log('openDetailOfAgendaitem');
  /*
    NOTE: We are chaining from the previous command to make sure we have the same element
    without repeating the selection process since this can be a sidebar or an overview item
  */
  cy.agendaitemExists(agendaitemName)
    .scrollIntoView()
    .click();
  cy.get(auk.loader, {
    timeout: 60000,
  }).should('not.exist');
  cy.url().should('include', 'agendapunten');
  cy.get(agenda.agendaitemNav.activeTab).then((element) => {
    const selectedTab = element[0].text;
    // TODO KAS-2739 always going to case tab might be slowing testing down, can we do better ?
    if (!selectedTab.includes('Dossier')) {
      cy.get(agenda.agendaitemNav.caseTab).click();
      // after changing the tab, we have to wait for data to load
      cy.get(auk.loader).should('not.exist');
    }

    if (isAdmin) {
      // This is used for approval items and other profiles who don't have a link to a subcase
      // cy.wait(1000); // "Naar procedurestap" was showing up before dissapearing again, failing any tab click that followed because the tabs were not ready/showing
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
    } else {
      // TODO KAS-2739, with data loading above, this should no longer be needed
      // cy.wait(3000); // TODO KAS-2739 wait to ensure the page is loaded, find a better way to check this for other profiles
    }
  });
  cy.log('/openDetailOfAgendaitem');
}

/**
 * @description Changes the selected agenda to the one matching the given name
 * @name changeSelectedAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaName - name of the agenda item
 */
function changeSelectedAgenda(agendaName) {
  cy.get(agenda.agendaSideNav.agendaName).contains(agendaName)
    .click();
  // await calls after switch covered by checking for loader
  cy.get(auk.loader, {
    timeout: 60000,
  }).should('not.exist');
}

/**
 * @description closes an agenda
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name closeAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function closeAgenda() {
  cy.log('closeAgenda');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.get(agenda.agendaHeader.showAgendaOptions).click();
  cy.get(agenda.agendaHeader.agendaActions.lockAgenda).click();
  cy.get(agenda.agendaHeader.confirm.lockAgenda).click();
  cy.wait('@patchMeetings', {
    timeout: 20000,
  });
  cy.wait('@patchAgenda', {
    timeout: 20000,
  });
  // as long as the modal exists, the action is not completed
  cy.get(auk.modal.container, {
    timeout: 60000,
  }).should('not.exist');
  cy.log('/closeAgenda');
}

/**
 * @description releases the decisions of the current meeting
 * @name releaseDecisions
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDecisions() {
  cy.log('releaseDecisions');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  cy.get(agenda.agendaHeader.showActionOptions).click();
  cy.get(agenda.agendaHeader.actions.releaseDecisions).click({
    force: true,
  });
  cy.get(utils.vlModalVerify.save).contains('Vrijgeven')
    .click();
  cy.wait('@patchMeetings', {
    timeout: 20000,
  });
  cy.log('/releaseDecisions');
}

/**
 * @description releases the documents of the current meeting
 * @name releaseDocuments
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDocuments() {
  cy.log('releaseDocuments');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  cy.get(agenda.agendaHeader.showActionOptions).click();
  cy.get(agenda.agendaHeader.actions.releaseDocuments).click();
  cy.get(utils.vlModalVerify.save).contains('Vrijgeven')
    .click();
  cy.wait('@patchMeetings', {
    timeout: 20000,
  });
  cy.log('/releaseDocuments');
}

/**
 * @description Checks if the agenda exists in the agenda/side-nav component by  (ex. "Ontwerpagenda A")
 * @name agendaNameExists
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} serialnumber The serialnumber (1 letter) of the agenda, capitalized (ex. "A")
 * @param {Boolean} design Whether or not the agenda is a design agenda (default true, most used in test)
 */
function agendaNameExists(serialnumber, design = true) {
  let agendaName;
  if (design) {
    agendaName = `Ontwerpagenda ${serialnumber}`;
  } else {
    agendaName = `Agenda ${serialnumber}`;
  }
  cy.get(agenda.agendaSideNav.agendaName).contains(agendaName);
  // TODO-command this can fail on collapsed sidenav
}

Cypress.Commands.add('createAgenda', createAgenda);
Cypress.Commands.add('openAgendaForDate', openAgendaForDate);
Cypress.Commands.add('visitAgendaWithLink', visitAgendaWithLink);
Cypress.Commands.add('deleteAgenda', deleteAgenda);
Cypress.Commands.add('setFormalOkOnItemWithIndex', setFormalOkOnItemWithIndex);
Cypress.Commands.add('approveCoAgendaitem', approveCoAgendaitem);
Cypress.Commands.add('approveDesignAgenda', approveDesignAgenda);
Cypress.Commands.add('addAgendaitemToAgenda', addAgendaitemToAgenda);
Cypress.Commands.add('toggleShowChanges', toggleShowChanges);
Cypress.Commands.add('agendaitemExists', agendaitemExists);
Cypress.Commands.add('openDetailOfAgendaitem', openDetailOfAgendaitem);
Cypress.Commands.add('changeSelectedAgenda', changeSelectedAgenda);
Cypress.Commands.add('closeAgenda', closeAgenda);
Cypress.Commands.add('releaseDecisions', releaseDecisions);
Cypress.Commands.add('releaseDocuments', releaseDocuments);
Cypress.Commands.add('openAgendaitemKortBestekTab', openAgendaitemKortBestekTab);
Cypress.Commands.add('approveAndCloseDesignAgenda', approveAndCloseDesignAgenda);
Cypress.Commands.add('setAllItemsFormallyOk', setAllItemsFormallyOk);
Cypress.Commands.add('agendaNameExists', agendaNameExists);
