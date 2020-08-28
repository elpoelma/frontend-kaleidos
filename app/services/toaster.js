import Service, { inject as service } from '@ember/service';
import {
  task, timeout
} from 'ember-concurrency';
import { A } from '@ember/array';

export default class ToasterService extends Service {
  @service intl;

  toasts = A([]);

  @(task(function *(toast) {
    toast.options.onClose = toast.options.onClose || (() => this.toasts.removeObject(toast));
    this.toasts.pushObject(toast);
    yield timeout(toast.options.timeOut);
    if (this.toasts.includes(toast)) {
      this.toasts.removeObject(toast);
    }
  })) displayToast;

  notify(message, title, options) {
    options = options || {};
    options.type = options.type || 'success';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3000;
    }
    const toast = {
      title,
      message,
      options,
    };
    this.displayToast.perform(toast);
    return toast;
  }

  info(message, title, options) {
    options = options || {};
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 2000;
    }
    return this.notify(message, title, options);
  }

  success(message, title, options) {
    options = options || {};
    options.type = 'success';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 2000;
    }
    return this.notify(message, title, options);
  }

  warning(message, title, options) {
    options = options || {};
    options.type = 'warning';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3000;
    }
    return this.notify(message, title, options);
  }

  error(message, title, options) {
    options = options || {};
    options.type = 'error';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 3000;
    }
    if (!(message || title)) { // TODO: revise naming/defaults, taken over from legacy global-error
      message = this.intl.t('error');
      title = this.intl.t('warning-title');
    }
    return this.notify(message, title, options);
  }

  loading(message, title, options) {
    options = options || {};
    options.type = 'loading';
    if (typeof options.timeOut === 'undefined') {
      options.timeOut = 10000;
    }
    return this.notify(message, title, options);
  }

  clear() {
    this.toasts.clear();
  }
}
