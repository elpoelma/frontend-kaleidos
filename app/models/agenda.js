import DS from 'ember-data';
import { computed } from '@ember/object';

let { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
	name: attr("string"),
	issued: attr("date"),
	isFinal:attr("boolean"),
	createdFor: belongsTo('meeting'), 
	agendaitems: hasMany('agendaitem'),
	created: attr('date'),

	// announcements: hasMany('announcement'),
	
	agendaName: computed('name', function() {
		if(this.name.length <= 2) {
			return 'Agenda ' + this.name;
		} else {
			return this.name;
		}
	})
});
