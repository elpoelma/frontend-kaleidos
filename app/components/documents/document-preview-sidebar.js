import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class DocumentsDocumentPreviewSidebar extends Component {
  @tracked documentType;
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const docContainer = yield this.args.piece.documentContainer;
    this.documentType = yield docContainer.type;
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  get accessPillSkin() {
    let modifier;
    if (this.accessLevel) {
      switch (this.accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          modifier = 'success';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          modifier = 'warning';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          modifier = 'error';
          break;
      }
    } else {
      modifier = 'default';
    }
    return modifier;
  }
}
