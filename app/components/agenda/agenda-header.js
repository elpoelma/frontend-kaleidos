import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaHeader extends Component {
  /**
   * The header component when viewing a meeting and it's agendas.
   *
   * @argument meeting: the viewed meeting
   * @argument currentAgenda: the selected agenda
   * @argument reverseSortedAgendas: the agendas of the meeting, reverse sorted on serial number
   * @argument refreshRoute: a callback to parent route to refresh the model
   */
  @service currentSession;
  @service intl;

  @tracked loadingMessage = null;
  @tracked showLoadingOverlay = false;

  /**
   * This method will toggle a modal component with a custom message
   * message = null will instead show a default message in the loader, and clear the local state of the message
   * @param {String} message: the message to show. If given, the text " even geduld aub..." will always be appended
   */
  @action
  setLoadingMessage(message) {
    if (message) {
      this.loadingMessage = `${message} ${this.intl.t(
        'please-be-patient'
      )}`;
    } else {
      this.loadingMessage = null;
    }
    if (typeof this.args.onStartLoading === 'function') {
      this.args.onStartLoading(); // hides the agenda overview/sidebar
    }
    this.showLoadingOverlay = true; // blocks the use of buttons
  }

  @action
  clearLoadingMessage() {
    this.loadingMessage = null;
    this.showLoadingOverlay = false;
    if (typeof this.args.onStopLoading === 'function') {
      this.args.onStopLoading();
    }
  }
}
