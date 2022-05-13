import { attr, belongsTo } from '@ember-data/model';
import Job from './job';

export default class PublicationMetricsExportJob extends Job {
  @attr('json') config;

  @belongsTo('publication-report-type') type;
  @belongsTo('file') generated;
  @belongsTo('user') generatedBy;
}
