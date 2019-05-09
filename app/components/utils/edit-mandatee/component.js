import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	store: inject(),

	startDate: computed('mandateeToEdit', function () {
		return this.get('mandateeToEdit.start');
	}),


	selectedFields: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('governmentFunctions');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	priority: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('priority');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	title: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('title');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	shortTitle: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('shortTitle');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	actions: {
		selectStartDate(val) {
			this.set('startDate', val);
		},

		chooseDomain(fields) {
			this.set('selectedFields', fields);
		},

		closeModal() {
			this.closeModal();
		},

		saveChanges() {
			const { startDate, title, shortTitle, priority, mandateeToEdit, selectedFields } = this;
			const mandatee = this.store.peekRecord('mandatee', mandateeToEdit.get('id'));
			mandatee.set('end', null);
			mandatee.set('title', title);
			mandatee.set('shortTitle', shortTitle);
			mandatee.set('priority', priority);
			mandatee.set('governmentFields', selectedFields)
			mandatee.set('start', startDate);
			mandatee.save().then(() => {
				this.closeModal();
			});
		}
	}
});
