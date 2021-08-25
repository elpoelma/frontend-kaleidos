import CONSTANTS from 'frontend-kaleidos/config/constants';
import EmberObject from '@ember/object';
import moment from 'moment';
import { A } from '@ember/array';

/**
 * Cancel the Edit.
 * @param agendaitemOrSubcase
 * @param propertiesToSet
 */
export const cancelEdit = (agendaitemOrSubcase, propertiesToSet) => {
  const isSubcase = agendaitemOrSubcase.get('modelName') === 'subcase';
  if (agendaitemOrSubcase.get('hasDirtyAttributes')) {
    agendaitemOrSubcase.rollbackAttributes();
  }
  if (isSubcase) {
    agendaitemOrSubcase.belongsTo('type').reload();
    agendaitemOrSubcase.belongsTo('accessLevel').reload();
  }
  agendaitemOrSubcase.reload();
  const keys = Object.keys(propertiesToSet);
  keys.forEach(async() => {
    keys.forEach((prop) => agendaitemOrSubcase.notifyPropertyChange(prop));
  });
};

/**
 * @description Zet een agendaitem of subcase naar nog niet formeel ok
 * @param subcaseOrAgendaitem De agendaitem of subcae waarvan de formaliteit gereset dient te worden naar nog niet formeel ok
 */
export const setNotYetFormallyOk = (subcaseOrAgendaitem) => {
  if (subcaseOrAgendaitem.get('formallyOk') !== CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK) {
    subcaseOrAgendaitem.set('formallyOk', CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
  }
};

/**
 *@name setAgendaitemFormallyOk
 *@description Zet een agendapunt naar formeel Ok.
 * @param agendaitem
 */
export const setAgendaitemFormallyOk = async(agendaitem) => {
  if (agendaitem.get('formallyOk') !== CONSTANTS.ACCEPTANCE_STATUSSES.OK) {
    agendaitem.set('formallyOk', CONSTANTS.ACCEPTANCE_STATUSSES.OK);
    await agendaitem.save();
  }
};

/**
 * @description Set some properties on a model.
 * @param model Kan van het type agendaitem of subcase zijn
 * @param propertiesToSet de properties die we dienen aan te passen
 * @param resetFormallyOk Dient de formaliteit aangepast te worden of niet (default true)
 * @returns {Promise<*>}
 */
export const setNewPropertiesToModel = async(model, propertiesToSet, resetFormallyOk = true) => {
  if (resetFormallyOk) {
    setNotYetFormallyOk(model);
  }

  const keys = Object.keys(propertiesToSet);
  keys.forEach(async(key) => {
    await model.get(key);
    model.set(key, propertiesToSet[key]);
  });

  return model.save().then((item) => {
    item.reload();
    return true;
  })
    .catch((exception) => {
      throw (exception);
    });
};

/**
 * @description Zet de modified date property van een agenda op basis van de doorgegeven agendaitem
 * @param agendaitem Het agendaitem om de agenda mee op te vragen.
 * @returns {Promise<void>}
 */
export const setModifiedOnAgendaOfAgendaitem = async(agendaitem) => {
  const agenda = await agendaitem.get('agenda');
  const isDesignAgenda = await agenda.asyncCheckIfDesignAgenda();
  if (agenda && isDesignAgenda) {
    agenda.set('modified', moment().utc()
      .toDate());
    agenda.save();
  }
};

/**
 * Save Changes on agenda item or subcase.
 *
 * @param agendaitemOrSubcase
 * @param propertiesToSetOnAgendaitem
 * @param propertiesToSetOnSubcase
 * @param resetFormallyOk
 * @returns {Promise<void>}
 */
export const saveChanges = async(agendaitemOrSubcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, resetFormallyOk) => {
  const item = agendaitemOrSubcase;
  const isAgendaitem = item.get('modelName') === 'agendaitem';

  await item.preEditOrSaveCheck();
  if (isAgendaitem) {
    const agenda = await item.agenda;
    const agendaStatus = await agenda.status;
    const agendaActivity = await item.agendaActivity;
    if (agendaActivity && (agendaStatus.isDesignAgenda || agendaStatus.isFinal)) {
      const agendaitemSubcase = await agendaActivity.subcase;
      await agendaitemSubcase.preEditOrSaveCheck();
      await setNewPropertiesToModel(agendaitemSubcase, propertiesToSetOnSubcase, false);
    }
    await setNewPropertiesToModel(item, propertiesToSetOnAgendaitem, resetFormallyOk);
    await setModifiedOnAgendaOfAgendaitem(item);
  } else {
    await setNewPropertiesToModel(item, propertiesToSetOnSubcase, false);
    const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
    if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
      await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async(agendaitem) => {
        await setNewPropertiesToModel(agendaitem, propertiesToSetOnAgendaitem, resetFormallyOk);
        await setModifiedOnAgendaOfAgendaitem(agendaitem);
      }));
    }
  }
};

export const destroyApprovalsOfAgendaitem = async(agendaitem) => {
  const approvals = await agendaitem.get('approvals');
  if (approvals) {
    await Promise.all(approvals.map((approval) => approval.destroyRecord()));
  }
};

/**
 * For a given set of agenda items, will re-order them by their groupNumber
 * ⚠️ Word of caution, this mutates the original set!
 * @param {Array} agendaitems   Agenda items to mutate
 */
export const setCalculatedGroupNumbers = (agendaitems) => Promise.all(
  agendaitems.map(async(agendaitem) => {
    const mandatees = await agendaitem.get('mandatees');
    if (agendaitem.isApproval) {
      return;
    }
    if (mandatees.length === 0) {
      agendaitem.set('groupNumber', 'ZZZZZZZZ');
      return;
    }
    const mandateePriorities = mandatees.map((mandatee) => mandatee.priorityAlpha);
    mandateePriorities.sort(); // should sort on letters A - Z
    agendaitem.set('groupNumber', mandateePriorities.join());
  })
);

/**
 * For a given set of agendaitems, return an array of groups
 * Will eventually return the same amount of data
 * @param  {Array} agendaitems  Agenda items to parse from
 * @return {Array}              A list of groups
 */
export const groupAgendaitemsByGroupname = (agendaitems) => {
  const groups = [];
  agendaitems.map((agendaitem) => {
    const groupName = agendaitem.get('ownGroupName');
    const foundItem = groups.find((group) => group.groupName === groupName);

    if (!foundItem) {
      groups.push({
        groupName,
        groupNumber: agendaitem.groupNumber,
        agendaitems: [agendaitem],
      });
    } else {
      const foundIndex = groups.indexOf(foundItem);
      if (foundIndex >= 0) {
        groups[foundIndex].agendaitems.push(agendaitem);
      }
    }
  });
  return groups;
};

/**
 * For a set of agendaitems, will fetch the drafts, and will group them by number
 * @param  {Array}  agendaitems   Agenda items to parse from
 * @return {Object}               An object containing drafts and groups
 */
export const parseDraftsAndGroupsFromAgendaitems = async(agendaitems) => {
  // Drafts are items without an approval or remark
  const draftAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isApproval);

  // Calculate the priorities on the drafts
  await setCalculatedGroupNumbers(draftAgendaitems);

  const groupedAgendaitems = Object.values(groupAgendaitemsByGroupname(draftAgendaitems));
  return {
    draftAgendaitems,
    groupedAgendaitems,
  };
};

/**
 * Given a set of grouped agendaitems, sort them by number
 * @param  {Array}   groupedAgendaitems   A set containing all agendaitems grouped (see above functions)
 * @param  {Boolean} allowEmptyGroups     When true, empty groups are allowed
 * @return {Array}                        The input set, sorted by number ASC
 */
export const sortByNumber = (groupedAgendaitems, allowEmptyGroups) => {
  let groupsArray = groupedAgendaitems;
  if (!allowEmptyGroups) {
    groupsArray = groupsArray.filter((group) => group.groupName && group.groupname !== 'Geen toegekende ministers');
  } else {
    groupsArray = groupsArray.filter((group) => group.groupname !== 'Geen toegekende ministers');
  }

  groupsArray = groupsArray.sortBy('groupNumber').map((group) => EmberObject.create(group));

  return groupsArray;
};

/**
 * Given a set of agendaitems, set their number
 * @name setAgendaitemsNumber
 * @param  {Array<agendaitem>}   agendaitems  Array of agendaitem objects to set number on.
 * @param  {Boolean} isEditor     When true, the user is allowed to edit the trigger a recalculation of the number.
 * @param {Boolean} isDesignAgenda  When true, the agenda is a designagenda.
 */
export const setAgendaitemsNumber = async(agendaitems, isEditor, isDesignAgenda) => {
  if (isEditor && isDesignAgenda) {
    return await Promise.all(agendaitems.map(async(agendaitem, index) => {
      if (agendaitem.number !== index + 1) {
        agendaitem.set('number', index + 1);
        return agendaitem.save();
      }
    }));
  }
};

export const reorderAgendaitemsOnAgenda = async(agenda, isEditor) => {
  await agenda.hasMany('agendaitems').reload();
  const agendaitems = await agenda.get('agendaitems');
  const actualAgendaitems = agendaitems.filter((agendaitem) => !agendaitem.showAsRemark && !agendaitem.isDeleted)
    .sortBy('number');
  const actualAnnouncements = agendaitems.filter((agendaitem) => agendaitem.showAsRemark && !agendaitem.isDeleted)
    .sortBy('number');
  await setAgendaitemsNumber(actualAgendaitems, isEditor, true);
  await setAgendaitemsNumber(actualAnnouncements, isEditor, true);
};

/**
 * Class representing a list of agenda-items related to a certain group of mandatees.
 */
export class AgendaitemGroup {
  sortedMandatees;
  mandateeGroupId;
  agendaitems;

  /**
   * Create an AgendaitemGroup.
   * @param {EmberArray} mandatees - The group of mandatees.
   * @param {Agendaitem} firstAgendaItem - A first agenda-item to initialize the list of items with.
   */
  constructor(mandatees, firstAgendaItem) {
    this.sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    this.mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(this.sortedMandatees);
    this.agendaitems = A([firstAgendaItem]);
  }

  static sortedMandatees(mandatees) {
    // Copy array by value. Manipulating the by-reference array would trigger changes when mandatees is an array from the store
    const copiedMandatees = A(mandatees.toArray());
    return copiedMandatees.sortBy('priority');
  }

  static generateMandateeGroupId(sortedMandatees) {
    // Assumes mandatees to be sorted
    return sortedMandatees.mapBy('id').join();
  }

  /**
   * Determine if a given agenda-item belongs in this group (can be used before adding it to this.agendaitems)
   * @param {Agendaitem} agendaitem
   * @return {boolean}
   */
  async itemBelongsToThisGroup(agendaitem) {
    const mandatees = await agendaitem.mandatees;
    const sortedMandatees = AgendaitemGroup.sortedMandatees(mandatees);
    const mandateeGroupId = AgendaitemGroup.generateMandateeGroupId(sortedMandatees);
    return mandateeGroupId === this.mandateeGroupId;
  }
}
