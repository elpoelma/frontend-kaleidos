import Component from '@glimmer/component';
import { trackedFunction } from 'ember-resources/util/function';
import { inject as service } from '@ember/service';
import { groupBySubcaseName } from 'frontend-kaleidos/utils/vp';

export default class SentToVpModalComponent extends Component {
  @service store;

  subcaseWithPieces = trackedFunction(this, async() => {
    const parliamentarySubmissionActivity = await this.args.submissionActivity;

    const submittedPieces = await parliamentarySubmissionActivity.submittedPieces;
    const grouped = groupBySubcaseName(submittedPieces);
    return grouped;
  });

  submittedPieceList = (submittedPiece) => {
    const formatter = new Intl.ListFormat('nl-be');
    const list = [];
    if (submittedPiece.unsignedFile) {
      list.push('PDF');
    }
    if (submittedPiece.wordFile) {
      list.push('Word');
    }
    if (submittedPiece.signedFile) {
      list.push('ondertekende PDF');
    }

    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }
}
