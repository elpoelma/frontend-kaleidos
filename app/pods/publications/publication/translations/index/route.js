import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { warn } from '@ember/debug';
import { inject as service } from '@ember/service';

export class TimeLineActivity {
  @tracked activity;

  constructor(activity) {
    this.activity = activity;
  }

  get isRequestActivity() {
    return this.activity.constructor.modelName === 'request-activity';
  }

  get isTranslationActivity() {
    return this.activity.constructor.modelName === 'translation-activity';
  }

  get date() {
    if (this.isRequestActivity) {
      return this.activity.startDate;
    } else if (this.isTranslationActivity) {
      return this.activity.endDate;
    } else {
      warn(`Getting date for unsupported activity type ${this.activity.constructor.modelName}`);
      return null;
    }
  }
}

export default class PublicationsPublicationTranslationsIndexRoute extends Route {
  @service store;

  async model() {
    this.translationSubcase = this.modelFor(
      'publications.publication.translations'
    );

    const requestActivities = await this.store.query('request-activity', {
      'filter[translation-subcase][:id:]': this.translationSubcase.id,
      include: 'email,used-pieces,used-pieces.file',
      sort: '-start-date',
    });

    const translationActivities = await this.store.query(
      'translation-activity',
      {
        'filter[subcase][:id:]': this.translationSubcase.id,
        include: 'generated-pieces,generated-pieces.file',
        sort: '-start-date',
      }
    );

    return [
      ...requestActivities.map((request) => new TimeLineActivity(request)),
      ...translationActivities.map((translation) => new TimeLineActivity(translation))
    ].sortBy('date').reverseObjects();
  }

  afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
    controller.translationSubcase = this.translationSubcase;
  }

  @action
  refresh() {
    super.refresh();
  }
}
