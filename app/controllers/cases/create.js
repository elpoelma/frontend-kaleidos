import Controller from '@ember/controller';
import { A } from '@ember/array';
import { task, timeout } from 'ember-concurrency';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
  themes: alias('model'),
  selectedThemes: A([]),
  types: A(["mr","overlegcomite", "ministrieel", "persbericht"]),
  part: 1,
  isPartOne : computed('part', function() {
    return this.get('part') === 1;
  }),
  actions: {
    async createDossier(event) {
      event.preventDefault();
      const { title, shortTitle, remark, selectedThemes, selectedType } = this;
      let cases = this.store.createRecord('case', {  title, shortTitle, remark, themes: selectedThemes, type: selectedType });
      await cases.save();
      await this.transitionToRoute('cases');
    },
    async resetValue(param) {
      if (param === "") {
        this.set('themes', this.store.findAll('theme'));
      }
    },
    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },
    chooseType(type) {
      this.set('selectedType', type);
    },
    titleChange(title) {
      this.set('title', title);
    },
    shortTitleChange(shortTitle) {
      this.set('shortTitle', shortTitle);
    },
    statusChange(status) {
      this.set('status', status);
    },
    nextStep() {
      this.set('part', 2);
    },
    previousStep() {
      this.set('part', 1);
    },
  },
  searchTheme : task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('theme', {
      filter: {
        naam: searchValue
      }
    });
  }),
});
