import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import * as AgendaPublicationUtils from 'frontend-kaleidos/utils/agenda-publication';

export default class NewsletterService extends Service {
  @service store;
  @service toaster;
  @service intl;
  @service currentSession;

  async createCampaign(meeting, silent = false) {
    const endpoint = `/newsletter/mail-campaigns`;
    const body = {
      data: {
        type: 'mail-campaigns',
        relationships: {
          meeting: {
            data: { type: 'meetings', id: meeting.id },
          },
        },
      },
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      if (!silent) {
        this.toaster.error(
          this.intl.t('error-create-newsletter'),
          this.intl.t('warning-title')
        );
      }
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    }
    const mailCampaign = this.store.createRecord('mail-campaign', {
      campaignId: result.data.id,
      campaignWebId: result.data.attributes.webId,
      archiveUrl: result.data.attributes.archiveUrl,
    });

    await mailCampaign.save();
    const reloadedMeeting = await this.store.findRecord('meeting', meeting.id, {
      reload: true,
    });
    reloadedMeeting.mailCampaign = mailCampaign;
    await reloadedMeeting.save();
    return mailCampaign;
  }

  async sendMailCampaign(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}/send`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!response.ok) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      const result = await response.json();
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    }
  }

  async sendToBelga(meetingId) {
    const endpoint = `/newsletter/belga-newsletters`;
    const body = {
      data: {
        type: 'belga-newsletters',
        relationships: {
          meeting: {
            data: { type: 'meetings', id: meetingId },
          },
        },
      },
    };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      this.toaster.error(
        this.intl.t('error-send-belga'),
        this.intl.t('warning-title')
      );
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    } else {
      return result;
    }
  }

  async getMailCampaign(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    const result = await response.json();
    if (!response.ok) {
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
      throw new Error('An exception ocurred: ' + JSON.stringify(result.errors));
    } else {
      return result.data;
    }
  }

  // TODO title = shortTitle, inconsistenties fix/conversion needed if this is changed
  async createNewsItemForAgendaitem(agendaitem, inNewsletter = false) {
    if (this.currentSession.isEditor) {
      const agendaItemTreatment = await agendaitem.treatment;
      const news = this.store.createRecord('newsletter-info', {
        agendaItemTreatment,
        inNewsletter,
      });
      if (agendaitem.showAsRemark) {
        const content = agendaitem.title;
        news.title = agendaitem.shortTitle || content;
        news.richtext = content;
        news.finished = true;
        news.inNewsletter = true;
      } else {
        news.title = agendaitem.shortTitle;
        news.subtitle = agendaitem.title;
        news.finished = false;
        news.inNewsletter = false;
        // Use news item "of previous subcase" as a default
        try {
          const activity = await agendaitem.get('agendaActivity');
          const subcase = await activity.get('subcase');
          const _case = await subcase.get('case');
          const previousNewsItem = await this.store.queryOne(
            'newsletter-info',
            {
              'filter[agenda-item-treatment][decision-activity][subcase][case][:id:]': _case.id,
              'filter[agenda-item-treatment][agendaitems][show-as-remark]': false, // Don't copy over news item from announcement
              sort: '-agenda-item-treatment.agendaitems.agenda-activity.start-date',
            }
          );
          if (previousNewsItem) {
            news.richtext = previousNewsItem.richtext;
            news.title = previousNewsItem.title;
            news.themes = await previousNewsItem.get('themes');
          }
        } catch (error) {
          console.log(error);
        }
      }
      return news;
    }
  }

  async deleteCampaign(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}`;
    try {
      await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(
        this.intl.t('error-delete-newsletter'),
        this.intl.t('warning-title')
      );
    }
  }

  async createNewsItemForMeeting(meeting) {
    if (this.currentSession.isEditor) {
      let [internalDocumentPublicationActivity, themisPublicationActivities] = await Promise.all([
        meeting.internalDocumentPublicationActivity,
        meeting.themisPublicationActivities,
      ]);
      themisPublicationActivities = themisPublicationActivities.toArray();
      const internalDocumentPublicationDate = internalDocumentPublicationActivity?.plannedPublicationTime ?? internalDocumentPublicationActivity?.unconfirmedPublicationTime;
      const plannedThemisPublicationActivity = AgendaPublicationUtils.getPlannedThemisPublicationActivity(themisPublicationActivities);
      const plannedThemisPublicationDate = plannedThemisPublicationActivity?.plannedPublicationTime ?? plannedThemisPublicationActivity?.unconfirmedPublicationTime;
      const newsletter = this.store.createRecord('newsletter-info', {
        meeting,
        finished: false,
        mandateeProposal: null,
        publicationDate: plannedThemisPublicationDate,
        publicationDocDate: internalDocumentPublicationDate,
      });
      await newsletter.save();
      meeting.newsletter = newsletter;
      return await meeting.save();
    }
  }

  // TODO These are for developers use - in comments for follow up
  /*
  downloadBelgaXML(meetingId) {
    try {
      return await fetch({
        method: 'GET',
        url: `/newsletter/belga-newsletters/${meetingId}/download`,
      });
    } catch (error) {
      console.warn('An exception ocurred: ', error);
      this.toaster.error(this.intl.t('error-download-XML'), this.intl.t('warning-title'));
      return null;
    }

  async getMailCampaignContent(id) {
    const endpoint = `/newsletter/mail-campaigns/${id}?fields[mail-campaigns]=html`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!response.ok) {
      console.warn('An exception ocurred: ', response.error);
      this.toaster.error(
        this.intl.t('error-send-newsletter'),
        this.intl.t('warning-title')
      );
    } else {
      return response.data.attributes;
    }
  }
  */
}
