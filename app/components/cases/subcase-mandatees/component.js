import Component from '@ember/component';
import { inject } from '@ember/service';
import Object from '@ember/object';

export default Component.extend({
	store: inject(),
	selectedMandatee: null,
	classNames: ["vlc-input-field-block"],

	mandateeRows:null,

	async didInsertElement() {
		this._super(...arguments);
		this.set('mandateeRows', [Object.create({id: 1})]);
	},

	actions: {
		addRow() {
			const newNumber = this.get('mandateeRows.lastObject.id') + 1;
			const mandateeRows = this.get('mandateeRows');
			mandateeRows.push(Object.create({ id: newNumber }));
			this.set('mandateeRows', mandateeRows);
			this.notifyPropertyChange('mandateeRows');
		},

		async mandateeSelected(mandateeRow, mandatee) {
			const domains = await mandatee.get('governmentDomains');
			mandateeRow.set('mandatee', mandatee);
			mandateeRow.set('domains', domains);
			mandateeRow.set('selectedDomains', domains);
			this.notifyPropertyChange('mandateeRows');
			this.mandateeRowsChanged(this.get('mandateeRows'))
		},

		async domainsChanged(mandateeRow, domains) {
			mandateeRow.set('selectedDomains', domains);
			this.mandateeRowsChanged(this.get('mandateeRows'))
		},

		mandateeRowsChanged() {
			this.mandateeRowsChanged(this.get('mandateeRows'))
		}
	},

	


});
