import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { deleteFile } from 'frontend-kaleidos/utils/document-delete-helpers';

export default class DecisionReportGeneration extends Service {
  @service toaster;
  @service store;
  @service intl;

  generateReplacementReport = task(async (report) => {
    const fileMeta = await this.exportPdf.perform(report);
    await this.replaceFile(report, fileMeta.id);
  });

  exportPdf = task(async (report) => {
    const resp = await fetch(`/generate-decision-report/${report.id}`);
    if (!resp.ok) {
      this.toaster.error(this.intl.t('error-while-exporting-pdf'));
      return;
    }
    return await resp.json();
  });

  async replaceFile(report, fileId) {
    await deleteFile(report.file);
    const file = await this.store.findRecord('file', fileId);
    report.file = file;
    report.modified = new Date();
    await report.save();
  }
}