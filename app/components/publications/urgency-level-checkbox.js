import Component from '@glimmer/component';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UrgencyLevelCheckboxComponent extends Component {
  @service store;

  @tracked urgencyLevels = this.store.peekAll('urgency-level').sortBy('position')

  @action
  toggleUrgency(value) {
    const uri = value ? CONFIG.URGENCY_LEVELS.spoedprocedure : CONFIG.URGENCY_LEVELS.standaard;
    const urgencyLevel = this.urgencyLevels.find((level) => level.uri === uri);
    this.args.onChange(urgencyLevel);
  }
}
