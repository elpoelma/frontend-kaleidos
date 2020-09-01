/* eslint-disable camelcase */
import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const {
      agenda_id,
    } = params;
    if (agenda_id) {
      return this.store.findRecord('agenda', agenda_id);
    }
  },
});
