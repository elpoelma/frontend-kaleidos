// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  newsletterService: inject(),
  value: null,
  isLoading: false,

  key: computed('row', 'value', 'column', function() {
    return this.column.get('valuePath');
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    async valueChanged(row, event) {
      const {
        key,
      } = this;
      this.toggleProperty('isLoading');
      this.toggleProperty('value');

      let itemToUpdate;
      // TODO refactor this code, this is not the right place
      if (key === 'forPress') {
        itemToUpdate = row.content;
        itemToUpdate.set(`${this.key}`, (await this.value));
      }
      if (itemToUpdate) {
        await itemToUpdate.save();
        await row.content.reload();
      }
      this.toggleProperty('isLoading');
      event.stopPropagation();
    },
  },
});
