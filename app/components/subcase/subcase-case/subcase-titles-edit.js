import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  saveChanges as saveSubcaseTitles,
  cancelEdit,
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency-decorators';

export default class SubcaseTitlesEdit extends Component {
  @service store;
  @service subcasesService;
  propertiesToSet = Object.freeze([
    'title',
    'shortTitle',
    'accessLevel',
    'confidential',
  ]);
  initialSubcaseConfidentiality = this.args.subcase.confidential;

  constructor() {
    super(...arguments);
    this.loadSubcase.perform();
  }

  @task
  *loadSubcase() {
    yield this.args.subcase.accessLevel;
  }

  @action
  async cancelEditing() {
    cancelEdit(this.args.subcase, this.propertiesToSet);
    this.args.toggleIsEditing();
  }

  @action
  setAccessLevel(accessLevel) {
    // TODO KAS-3085 not possible to save accessLevel on subcase
    this.accessLevel = accessLevel;
  }

  @task
  *saveChanges() {
    const trimmedTitle = trimText(this.args.subcase.title);
    const trimmedShortTitle = trimText(this.args.subcase.shortTitle);

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
    };
    const propertiesToSetOnSubcase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      accessLevel: this.args.subcase.accessLevel,
      confidential: this.args.subcase.confidential,
    };

    yield saveSubcaseTitles(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true
    );
    if (
      this.initialSubcaseConfidentiality === false &&
      this.args.subcase.confidential === true
    ) {
      // When the confidentiality was changed from false to true, we have to make all pieces confidential
      yield this.subcasesService.cascadeConfidentialityToPieces(
        this.args.subcase
      );
    }
    this.args.toggleIsEditing();
  }
}
