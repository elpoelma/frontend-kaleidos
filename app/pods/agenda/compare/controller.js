import Controller from '@ember/controller';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    toggleChangesOnly() {
      this.toggleProperty('isShowingChanges');
    },
  },

});
