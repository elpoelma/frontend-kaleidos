import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency';

export default class DocumentsDocumentVersionHistoryItemComponent extends Component {
  @service pieceAccessLevelService;

  @tracked isDraftAccessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @keepLatestTask
  *loadData() {
    const accessLevel = yield this.args.piece.accessLevel;
    const context = Object.assign({}, this.args.agendaContext || {}, { piece: this.args.piece });
    this.isDraftAccessLevel = yield this.pieceAccessLevelService.isDraftAccessLevel(accessLevel, context);
  }

  @action
  changeAccessLevel(accessLevel) {
    this.args.piece.accessLevel = accessLevel;
    this.loadData.perform();
  }
}