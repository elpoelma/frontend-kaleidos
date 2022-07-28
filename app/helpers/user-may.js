import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class Substring extends Helper {
  @service currentSession;

  compute([roleKey]) {
    return this.currentSession.may(roleKey);
  }
}
