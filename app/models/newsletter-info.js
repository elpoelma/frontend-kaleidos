import DS from 'ember-data';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import ModelWithModifier from 'fe-redpencil/models/model-with-modifier';

const {
  attr, hasMany, belongsTo,
} = DS;

export default ModelWithModifier.extend({
  modelName: alias('constructor.modelName'),
  intl: inject(),
  text: attr('string'),
  subtitle: attr('string'),
  title: attr('string'),
  richtext: attr('string'),
  mandateeProposal: attr('string'),
  finished: attr('boolean'),
  inNewsletter: attr('boolean'),
  publicationDate: attr('datetime'),
  publicationDocDate: attr('datetime'),
  remark: attr('string'),

  subcase: belongsTo('subcase'),
  meeting: belongsTo('meeting', {
    inverse: null,
  }),
  documentVersions: hasMany('document-version', {
    inverse: null,
  }),
  themes: hasMany('themes', {
    inverse: null,
  }),

  displayRemark: computed('remark', 'intl', function() {
    const remark = this.get('remark');
    if (remark && remark !== '') {
      return `${this.intl.t('remark')}: ${this.get('remark')}`;
    }
    return '';
  }),

  newsletterProposal: computed('mandateeProposal', async function() {
    const subcase = await this.get('subcase');
    const mandatees = await subcase.get('mandatees');
    const sortedMandatees = await mandatees.sortBy('priority');
    let proposalText = this.intl.t('proposal-text');
    const seperatorComma = ', ';
    const seperatorAnd = ' en ';
    if (sortedMandatees && sortedMandatees.length > 1) {
      for (let index = 0; index < sortedMandatees.length; index++) {
        const mandatee = sortedMandatees.objectAt(index);
        const nickName = await mandatee.get('nickName');
        if (index > 0) {
          if (sortedMandatees.length - 1 === index) {
            proposalText = `${proposalText}${seperatorAnd}`;
          } else {
            proposalText = `${proposalText}${seperatorComma}`;
          }
        }
        if (nickName) {
          proposalText = `${proposalText}${nickName}`;
        } else {
          proposalText = `${proposalText}${mandatee.get('title')}`;
        }
      }// end for loop
      return proposalText;
    }
    const requestedBy = await subcase.get('requestedBy');
    if (requestedBy) {
      const nickName = await requestedBy.get('nickName');
      if (nickName) {
        proposalText = `${proposalText}${nickName}`;
      } else {
        proposalText = `${proposalText}${requestedBy.get('title')}`;
      }
      return proposalText;
    }
    return null;
  }),

});
