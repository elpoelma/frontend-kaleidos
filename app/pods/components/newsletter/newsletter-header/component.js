import Component from '@ember/component';

export default Component.extend({
  classNames: ['vlc-page-header', 'vl-u-bg-alt'],
  isAddingSingleNewsLetter: false,

  actions: {
    toggleIsAddingSingleNewsLetter() {
      this.toggleProperty('isAddingSingleNewsLetter');
    },
    close() {
      this.toggleProperty('isAddingSingleNewsLetter');
    },
  },
});
