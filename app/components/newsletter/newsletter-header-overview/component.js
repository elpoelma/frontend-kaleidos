import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import moment from 'moment';
import { inject } from '@ember/service'

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vlc-page-header"],
	session: inject(),
	intl: inject(),
	
	actions: {
		print() {
			var tempTitle = window.document.title;
			window.document.title = `${this.get('intl').t('newsletter-overview-pdf-name')}${moment(this.get('sessionService.currentSession.plannenStart')).format('YYYYMMDD')}`;
			window.print();
			window.document.title = tempTitle;
		}
	}
});
