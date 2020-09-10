import Route from '@ember/routing/route';
import moment from 'moment';
import { hash } from 'rsvp';
import { A } from '@ember/array';
import CONFIG from 'fe-redpencil/utils/config';
import getPaginationMetadata from 'fe-redpencil/utils/get-pagination-metadata';


export default class NewsletterNotaUpdatesRoute extends Route {
  queryParams = {
    sort: {
      refreshModel: true,
    },
  };
  async model(params) {
    let notas = A([]);
    const newsletterModel = this.modelFor('newsletter');
    const meeting = newsletterModel.meeting;
    const agenda = newsletterModel.agenda;
    const agendaId = agenda.id;
    const meetingId = meeting.id;
    const agendaitemsForAgenda = await agenda.get('agendaitems');
    const agendaitemsArray = agendaitemsForAgenda.toArray();
    for (const agendaitem of agendaitemsArray) {
      const agendaitemPriority = agendaitem.get('priority');
      const agendaitemId = agendaitem.get('id');
      const agendaitemShortTitle = agendaitem.get('shortTitle');

      // Documenten
      const notasOfAgendaitem = await this.store.query('document-version', {
        'filter[agendaitem][:id:]': agendaitemId,
        'filter[document-container][type][:id:]': CONFIG.notaID,
      });
      if (notasOfAgendaitem.length) {
        const lastNotaVersion = notasOfAgendaitem.firstObject;
        const documentContainer = await lastNotaVersion.get('documentContainer');
        const allNotaVersions = await documentContainer.get('documentVersions');
        const documentVersionsOfAgendaitemArray = allNotaVersions.toArray();

        if (documentVersionsOfAgendaitemArray) {
          for (const documentVersion of documentVersionsOfAgendaitemArray) {
            const documentVersionData = await NewsletterNotaUpdatesRoute.getDocumentVersionData(documentVersion);
            if (documentVersionData) {
              const nota =  {
                meetingId,
                agendaId,
                agendaitemId,
                agendaitemPriority,
                agendaitemShortTitle,
                ...documentVersionData,
              };
              notas.pushObject(nota);
            }
          }
        }
      }
    }
    if (params.sort.includes('modified')) {
      notas = notas.sortBy('modified');
      if (params.sort.startsWith('-')) {
        notas.reverseObjects();
      }
    }
    const pagination = getPaginationMetadata(0, notas.length, notas.length);
    notas.meta = {
      count: notas.length,
      pagination: pagination,
    };
    return hash({
      notas: notas,
    });
  }

  static async getDocumentVersionData(documentVersion) {
    const name = documentVersion.get('name');
    const documentId = documentVersion.get('id');
    const modified = documentVersion.get('modified');
    const container = await documentVersion.get('documentContainer');
    const type = await container.get('type');
    const label = type.get('label');
    if (label === 'Nota') {
      return {
        documentId: documentId,
        name: name,
        modified: modified,
        date: moment(modified).format('DD-MM-YYYY'),
        time: moment(modified).format('HH:MM'),
      };
    }
    return null;
  }
}
