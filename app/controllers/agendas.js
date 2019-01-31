import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
	sessionService: inject(),
	creatingNewSession: false,
	selectedAgendaItem: null,
  addComment: false,

	currentSession: alias('sessionService.currentSession'),
	agendas: alias('sessionService.agendas'),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentAgendaItems: alias('sessionService.currentAgendaItems'),

	actions: {
		navigateToSubCases() {
			this.transitionToRoute('subcases');
		},

		lockAgenda(agenda) {
			agenda.set('locked', !agenda.locked);
			agenda.save();
		},
		compareAgendas() {
			this.transitionToRoute('comparison');
		},

		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
		},
		
    addComment(){

    }
	}
});
