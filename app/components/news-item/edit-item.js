// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  intl: inject(),
  classNames: ['auk-box'],

  isTryingToSave: false,
  isExpanded: false,

  themes: computed('newsletterInfo.themes', {
    get: async function() {
      const newsletterInfo = await this.get('newsletterInfo');
      if (newsletterInfo) {
        return await this.newsletterInfo.get('themes').then((themes) => themes.toArray());
      }

      return [];
    },
    // eslint-disable-next-line no-unused-vars
    set(key, value) {
      return value;
    },
  }),

  editorInstanceAvailable: computed('editorInstance', function() {
    return this.get('editorInstance') ? true : false; // eslint-disable-line
  }),

  hasNota: computed('agendaitem', async function() {
    const nota = await this.agendaitem.get('nota');
    if (nota) {
      return true;
    }
    return false;
  }),

  async saveChanges() {
    this.set('isLoading', true);
    const newsletterInfo = await this.get('newsletterInfo');
    try {
      newsletterInfo.set('richtext', this.richtext);
    } catch {
      // pass
    }
    await newsletterInfo.save().then(async() => {
      this.set('isLoading', false);
    });
    if (this.onSave) {
      this.onSave();
    }
  },

  richtext: computed('editorInstance.htmlContent', 'editorInstanceAvailable', function() {
    if (!this.editorInstanceAvailable) {
      throw new Error("Can't get rich text since editor-instance isn't available!");
    }
    return this.editorInstance.htmlContent;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async trySaveChanges() {
      const themes = await this.get('themes');
      if (themes.length > 0) {
        return this.saveChanges();
      }
      this.toggleProperty('isTryingToSave');
    },

    async cancelEditing() {
      const newsletterInfo = await this.get('newsletterInfo');
      newsletterInfo.rollbackAttributes();
      if (!newsletterInfo.isDeleted) {
        newsletterInfo.hasMany('themes').reload();
      }
      if (this.onCancel) {
        this.onCancel();
      }
    },

    cancelSaveChanges() {
      this.toggleProperty('isTryingToSave');
    },

    async saveChanges() {
      return this.saveChanges();
    },

    async openDocument(agendaitem) {
      const nota = await agendaitem.get('notaOrVisienota');
      if (!nota) {
        return;
      }
      const piece = await nota.get('lastPiece');
      window.open(`/document/${piece.get('id')}`);
    },

    async handleRdfaEditorInit(editorInterface) {
      const newsletterInfo = await this.get('newsletterInfo');
      const newsLetterInfoText = newsletterInfo.get('richtext');
      editorInterface.setHtmlContent(newsLetterInfoText);
      this.set('editorInstance', editorInterface);
    },

    descriptionUpdated(val) {
      this.set('initValue', `${this.get('initValue')} ${val}`);
    },
  },
});
