import Service, { inject as service } from '@ember/service';
import { singularize } from 'ember-inflector';
import fetch from 'fetch';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { updateModifiedProperty } from 'frontend-kaleidos/utils/modification-utils';
import { A } from '@ember/array';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  store: service(),
  toaster: service(),
  intl: service(),
  currentSession: service(),
  newsletterService: service(),

  addedPieces: null,
  addedAgendaitems: null,

  /* API: agenda-approve-service */

  async createNewDesignAgenda(currentMeeting) {
    const endpoint = `/agenda-approve/meetings/${currentMeeting.id}/reopen`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error.detail);
      }
      const newAgenda = await this.store.findRecord('agenda', payload.data.id);
      return newAgenda;
    } else {
      throw new Error(response.statusText);
    }
  },

  async approveDesignAgenda(currentAgenda) {
    const endpoint = `/agenda-approve/agendas/${currentAgenda.id}/approve`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error.detail);
      }
      const newAgenda = await this.store.findRecord('agenda', payload.data.id);
      return newAgenda;
    } else {
      throw new Error(response.statusText);
    }
  },

  async approveAgendaAndCloseMeeting(currentAgenda) {
    const endpoint = `/agenda-approve/agendas/${currentAgenda.id}/close`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  },

  async closeMeeting(currentMeeting) {
    const endpoint = `/agenda-approve/meetings/${currentMeeting.id}/close`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error.detail);
      }
      const lastApprovedAgenda = await this.store.findRecord('agenda', payload.data.id);
      return lastApprovedAgenda;
    } else {
      throw new Error(response.statusText);
    }
  },

  async reopenPreviousAgenda(currentAgenda) {
    const endpoint = `/agenda-approve/agendas/${currentAgenda.id}/reopen`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error.detail);
      }
      const reopenedAgenda = await this.store.findRecord('agenda', payload.data.id);
      return reopenedAgenda;
    } else {
      throw new Error(response.statusText);
    }
  },

  async deleteAgenda(currentAgenda) {
    const endpoint = `/agenda-approve/agendas/${currentAgenda.id}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (response.ok) {
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error.detail);
      }
      if (payload.data?.id) {
        const lastApprovedAgenda = await this.store.findRecord('agenda', payload.data.id);
        return lastApprovedAgenda;
      } else {
        return null;
      }
    } else {
      throw new Error(response.statusText);
    }
  },

  /* API: agenda-comparison-service */

  async agendaWithChanges(currentAgendaID, agendaToCompareID) {
    const endpoint = new URL('/agenda-comparison/agenda-with-changes', window.location.origin);
    const queryParams = new URLSearchParams(Object.entries({
      agendaToCompare: agendaToCompareID,
      selectedAgenda: currentAgendaID,
    }));
    endpoint.search = queryParams.toString();
    const response = await fetch(endpoint);
    if (response.ok) {
      const result = await response.json();
      this.set('addedPieces', result.addedDocuments);
      this.set('addedAgendaitems', result.addedAgendaitems);
    }
  },

  async newAgendaItems(currentAgendaId, comparedAgendaId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items`;
    const response = await fetch(url);
    const payload = await response.json();
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(singularize(item.type), item.id);
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(singularize(item.type), item.id);
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  },

  async modifiedAgendaItems(currentAgendaId, comparedAgendaId, scopeFields) {
    // scopefields specify which fields to base upon for determining if an item was modified
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-items?changeset=modified&scope=${scopeFields.join(',')}`;
    const response = await fetch(url);
    const payload = await response.json();
    const itemsFromStore = [];
    for (const item of payload.data) {
      let itemFromStore = this.store.peekRecord(singularize(item.type), item.id);
      if (!itemFromStore) {
        itemFromStore = await this.store.queryRecord(singularize(item.type), item.id);
      }
      itemsFromStore.push(itemFromStore);
    }
    return itemsFromStore;
  },

  async changedPieces(currentAgendaId, comparedAgendaId, agendaItemId) {
    const url = `/agendas/${currentAgendaId}/compare/${comparedAgendaId}/agenda-item/${agendaItemId}/pieces`;
    const response = await fetch(url);
    const payload = await response.json();
    const piecesFromStore = [];
    for (const piece of payload.data) {
      let pieceFromStore = this.store.peekRecord(singularize(piece.type), piece.id);
      if (!pieceFromStore) {
        pieceFromStore = await this.store.queryRecord(singularize(piece.type), piece.id);
      }
      piecesFromStore.push(pieceFromStore);
    }
    return piecesFromStore;
  },

  /* No API */

  async computeNextItemNumber(agenda, isAnnouncement) {
    const lastItem = await this.store.queryOne('agendaitem', {
      'filter[agenda][:id:]': agenda.id,
      'filter[show-as-remark]': isAnnouncement,
      sort: '-number',
    });
    if (lastItem) {
      return lastItem.number + 1;
    }
    return 1;
  },

  /**
   * @argument meeting
   * @argument submissionActivities: Array of submission activities. Mostly only one exists before submission.
   * In the case where an agenda-item was deleted after multiple submissions occurred, one can put on agenda again with multiple submissions
   */
  async putSubmissionOnAgenda(meeting, submissionActivities) {
    const subcase = await submissionActivities[0].get('subcase');
    const lastAgenda = await this.store.queryOne('agenda', {
      'filter[created-for][:id:]': meeting.id,
      'filter[status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
      sort: '-created', // serialnumber
    });
    const isAnnouncement = subcase.get('showAsRemark');
    const numberToAssign = await this.computeNextItemNumber(lastAgenda, isAnnouncement);

    // Generate press text
    const mandatees = await subcase.get('mandatees');
    const sortedMandatees = await mandatees.sortBy('priority');
    const titles = sortedMandatees.map((mandatee) => mandatee.get('title'));
    const pressText = `${subcase.get('shortTitle')}\n${titles.join('\n')}`;

    const now = new Date();

    // Placement on agenda activity
    const agendaActivity = await this.store.createRecord('agenda-activity', {
      startDate: now,
      subcase,
    });
    await agendaActivity.save();
    for (const submissionActivity of submissionActivities) {
      submissionActivity.set('agendaActivity', agendaActivity);
      await submissionActivity.save();
    }

    // load code-list item
    const defaultDecisionResultCodeUri = isAnnouncement ? CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME : CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD;
    const decisionResultCode = await this.store.queryOne('decision-result-code', {
      'filter[:uri:]': defaultDecisionResultCodeUri,
    });

    // Treatment of agenda-item / decision activity
    const agendaItemTreatment = await this.store.createRecord('agenda-item-treatment', {
      created: now,
      modified: now,
      subcase,
      startDate: meeting.plannedStart,
      decisionResultCode,
    });
    await agendaItemTreatment.save();

    let submittedPieces = [];
    for (const submissionActivity of submissionActivities) {
      const submissionActivity2 = await this.store.queryOne('submission-activity', {
        'filter[:id:]': submissionActivity.id,
        include: 'pieces', // query with include to avoid pagination issues
      });
      submittedPieces = submittedPieces.concat((await submissionActivity2.pieces).toArray());
    }
    const agendaitem = await this.store.createRecord('agendaitem', {
      retracted: false,
      titlePress: subcase.shortTitle,
      textPress: pressText,
      created: now,
      number: numberToAssign,
      agenda: lastAgenda,
      title: subcase.title,
      shortTitle: subcase.shortTitle,
      formallyOk: CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK,
      showAsRemark: isAnnouncement,
      mandatees,
      pieces: submittedPieces,
      linkedPieces: await subcase.linkedPieces,
      agendaActivity,
      treatments: A([agendaItemTreatment]),
    });
    await agendaitem.save();
    await lastAgenda.hasMany('agendaitems').reload();
    await subcase.hasMany('agendaActivities').reload();
    await subcase.hasMany('treatments').reload();
    subcase.set('requestedForMeeting', meeting);
    await subcase.save();
    updateModifiedProperty(lastAgenda);

    // Create default newsletterInfo for announcements with inNewsLetter = true
    if (agendaitem.showAsRemark) {
      const newsItem = await this.newsletterService.createNewsItemForAgendaitem(agendaitem, true);
      newsItem.save();
    }
    return agendaitem;
  },

  async groupAgendaitemsOnGroupName(agendaitems) {
    let previousAgendaitemGroupName;
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        let currentAgendaitemGroupName;
        const mandatees = await agendaitem.get('sortedMandatees');
        if (agendaitem.isApproval) {
          agendaitem.set('groupName', null);
          agendaitem.set('ownGroupName', null);
          return;
        }
        if (mandatees.length === 0) {
          agendaitem.set('groupName', this.intl.t('no-mandatee-assigned'));
          currentAgendaitemGroupName = this.intl.t('no-mandatee-assigned');
        } else {
          currentAgendaitemGroupName = mandatees
            .map((mandatee) => mandatee.title)
            .join('<br/>');
        }

        if (currentAgendaitemGroupName !== previousAgendaitemGroupName) {
          previousAgendaitemGroupName = currentAgendaitemGroupName;
          agendaitem.set('groupName', currentAgendaitemGroupName);
        } else {
          agendaitem.set('groupName', null);
        }
        agendaitem.set('ownGroupName', currentAgendaitemGroupName);
      })
    );
  },

  async deleteAgendaitem(agendaitem) {
    const agendaitemToDelete = await this.store.findRecord('agendaitem', agendaitem.get('id'), {
      reload: true,
    });
    agendaitemToDelete.set('aboutToDelete', true);
    const agendaActivity = await agendaitemToDelete.get('agendaActivity');
    const treatments = await agendaitemToDelete.get('treatments');

    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      await agendaActivity.hasMany('agendaitems').reload();
      const agendaitemsFromActivity = await agendaActivity.get('agendaitems');
      if (treatments) {
        await Promise.all(treatments.map(async(treatment) => {
          const newsletter = await treatment.get('newsletterInfo');
          if (newsletter) {
            await newsletter.destroyRecord();
          }
          // TODO DELETE REPORT !
          await treatment.destroyRecord();
        }));
      }
      await Promise.all(agendaitemsFromActivity.map(async(agendaitem) => {
        const agenda = await agendaitem.get('agenda');
        await agendaitem.destroyRecord();
        await agenda.hasMany('agendaitems').reload();
      }));
      await agendaActivity.destroyRecord();
      await subcase.set('requestedForMeeting', null);
      await subcase.save();
      await subcase.hasMany('agendaActivities').reload();
      await subcase.hasMany('treatments').reload();
    } else {
      await agendaitemToDelete.destroyRecord();
    }
  },

  async deleteAgendaitemFromMeeting(agendaitem) {
    if (this.currentSession.isAdmin) {
      return await this.deleteAgendaitem(agendaitem);
    }
    this.toaster.error(this.intl.t('action-not-allowed'), this.intl.t('warning-title'));
  },

  async retrieveModifiedDateFromNota(agendaitem) {
    const nota = await agendaitem.get('nota');
    if (!nota) {
      return null;
    }
    const pieces = await nota.get('pieces');
    const hasRevision = pieces.length > 1;
    if (hasRevision) {
      const lastPiece = await nota.get('lastPiece');
      return lastPiece.created;
    }
    return null;
  },
});
