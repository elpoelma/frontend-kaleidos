import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';
import $ from 'jquery';

export default Component.extend({
	store: inject(),
	today: moment.now(),
	classNames: ['new-session-form-container'],

	actions: {
		async createNewSession() {
			let generatedNumber = 4;// generated by fair dice roll, guaranteed to be random

			let newSession = this.store.createRecord('session', {
				plannedstart: this.get('startDate'),
				number: generatedNumber,
			});

			newSession.save().then(async (session) => {
        const date = new Date();
				let agenda = this.store.createRecord('agenda', {
					name: "Ontwerpagenda",
					session: session,
          created: date,
          modified: date
        });

				await agenda.save();
				await $.get('http://localhost/session-service/assignNewSessionNumbers');
				this.cancelForm();
			});
		},

		selectStartDate(val) {
			this.set('startDate', val);
		},

		cancelForm(event) {
			this.cancelForm(event)
		}
	}
});
