// TODO: octane-refactor
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, get, set
} from '@ember/object';
import {
  saveChanges as saveSubcaseTitles, cancelEdit
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

// TODO: octane-refactor
// eslint-disable-next-line ember/require-tagless-components
export default class SubcaseTitlesEdit extends Component {
  @service store;
  classNames = ['auk-box', 'auk-u-mt-4'];
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'accessLevel', 'confidential']);

  @action
  async cancelEditing() {
    cancelEdit(this.subcase, get(this, 'propertiesToSet'));
    this.toggleProperty('isEditing');
  }

  @action
  setAccessLevel(accessLevel) {
    set(this, 'accessLevel', accessLevel);
  }

  // @action
  // toggleConfidential(value) {
  //   console.log(value);
  // }

  @action
  async saveChanges() {
    set(this, 'isLoading', true);

    const propertiesToSetOnAgendaitem = {
      title: trimText(this.subcase.title),
      shortTitle: trimText(this.subcase.shortTitle),
    };
    const propertiesToSetOnSubcase = {
      title: trimText(this.subcase.title),
      shortTitle: trimText(this.subcase.shortTitle),
    };

    propertiesToSetOnSubcase.accessLevel = await this.subcase.get('accessLevel');
    propertiesToSetOnSubcase.confidential = await this.subcase.get('confidential');

    try {
      await saveSubcaseTitles(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
      set(this, 'isLoading', false);
      this.toggleProperty('isEditing');
    } catch (exception) {
      set(this, 'isLoading', false);
      throw (exception);
    }
  }
}
