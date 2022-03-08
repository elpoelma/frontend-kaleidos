import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationsOverviewBaseController extends Controller {
  @tracked page = 0;
  @tracked size = 50;
  @tracked sort = '-created';

  @tracked tableConfig;

  @tracked isLoadingModel = false;

  @action
  saveTableConfig() {
    this.tableConfig.saveToLocalStorage();
    this.reload();
  }

  @action
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
    }
  }

  @action
  nextPage() {
    this.page = this.page + 1;
  }

  @action
  setSizeOption(size) {
    this.size = size;
    this.page = 0;
  }

  @action
  sortTable(sortField) {
    this.sort = sortField;
  }

  @action
  reload() {
    this.send('reloadModel');
  }
}
