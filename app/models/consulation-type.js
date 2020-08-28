import DS from 'ember-data';

const {
  Model, attr, hasMany,
} = DS;

export default Model.extend({
  label: attr('string'),
  scopeNote: attr('string'),
  requests: hasMany('consulation-request'),
});
