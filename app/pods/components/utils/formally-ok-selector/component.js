/* eslint-disable ember/no-arrow-function-computed-properties */
import Component from '@ember/component';
import CONFIG from 'fe-redpencil/utils/config';
import EmberObject, { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom-s'],
  isLoading: null,
  hideLabel: null,

  options: computed(() => CONFIG.formallyOkOptions.map((item) => EmberObject.create(item))),

  selectedFormallyOk: computed('options', 'formallyOk', function() {
    const formallyOk = this.get('formallyOk');
    if (!formallyOk) {
      return this.options.find((option) => option.get('uri') === CONFIG.notYetFormallyOk);
    }
    return this.options.find((option) => option.get('uri') === formallyOk);
  }),

  actions: {
    setAction(item) {
      this.set('selectedFormallyOk', item);
      this.setAction(item);
    },
  },
});
