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
  propertiesToSet = Object.freeze([
    'title',
    'shortTitle',
    'confidential',
  ]);

  @action
  async cancelEditing() {
    cancelEdit(this.args.subcase, this.propertiesToSet);
    this.args.toggleIsEditing();
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
      confidential: this.args.subcase.confidential,
    };

    yield saveSubcaseTitles(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true
    );
    this.args.toggleIsEditing();
  }
}
