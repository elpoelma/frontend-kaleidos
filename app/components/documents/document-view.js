import Component from '@glimmer/component';

const PDF_MIME = 'application/pdf';
const PDF_EXTENSION = 'pdf';

export default class DocumentsDocumentView extends Component {
  get isPdfDocument() {
    if (this.args.file) {
      return this.args.file.format.toLowerCase().includes(PDF_MIME)
        || this.args.file.extension.toLowerCase() == PDF_EXTENSION;
    } else {
      return false;
    }
  }
}