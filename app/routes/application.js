import Route from "@ember/routing/route";
import { inject } from "@ember/service";

import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";

export default Route.extend(ApplicationRouteMixin, {
  moment: inject(),
  intl: inject(),
  currentSession: inject(),
  fileService: inject(),
  routeAfterAuthentication: "agendas",

  beforeModel() {
    this._super(...arguments);
    this.get("moment").setLocale("nl");
    this.set("moment.defaultFormat", "DD.MM.YYYY");
    this.get("moment").set("allowEmpty", true);
    this.intl.setLocale("nl-be");
    return this._loadCurrentSession();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentSession();
  },

  sessionInvalidated() {},

  _loadCurrentSession() {
    return this.currentSession.load().catch(() => this.session.invalidate());
  },

  actions: {
    willTransition: function(transition) {
      if (
        this.fileService.get("deleteDocumentWithUndo.isRunning") &&
        confirm(this.intl.t("leave-page-message"))
      ) {
        transition.abort();
      } else {
        return true;
      }
    }
  }
});
