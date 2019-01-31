import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export default Component.extend({
	store: inject(),
	sessionService: inject(),
	agendaService: inject(),
	classNames: ["files--header-tile", "files--search"],
	tagName: "div",

	creatingNewSession: null,
	sessions:null,

	currentAgendaItems: alias('sessionService.currentAgendaItems'),
	currentSession: alias('sessionService.currentSession'),
	currentAgenda: alias('sessionService.currentAgenda'),

	actions: {
		async lockAgenda(session) {
			let agendas = await this.store.query('agenda', {
				filter: {
					session: { id: session.id }
				},
				sort: 'name'
			});

			let agendaToLock = agendas.get('firstObject');

			let definiteAgendas = agendas.filter(agenda => agenda.name != "Ontwerpagenda")
			let lastDefiniteAgenda = definiteAgendas.get('firstObject');

			if (!lastDefiniteAgenda) {
				agendaToLock.set('name', alphabet[0]);
			} else {
				agendaToLock.set('name', alphabet[definiteAgendas.length])
			}

			agendaToLock.set('locked', true);

			agendaToLock.save().then(() => {
				this.get('agendaService').addAgendaToSession(session, agendaToLock).then(newAgenda => {
					this.set('sessionService.currentSession', session);
					this.notifyPropertyChange('sessionService.currentSession');
					this.set('sessionService.currentAgenda', newAgenda);
					this.notifyPropertyChange('sessionService.currentAgenda');
				});
			})
		},

		chooseSession(session) {
			this.set('sessionService.currentSession', session);
		},
		
		createNewSession() {
			this.set('creatingNewSession', true);
		},

		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
		}
	},

	async didInsertElement() {
		this._super(...arguments);
		if(!this.get('currentSession')) {
			this.set('sessionService.currentSession', this.get('sessions.firstObject'));
		}
	}
});
