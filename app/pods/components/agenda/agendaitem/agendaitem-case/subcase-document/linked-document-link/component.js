import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';

export default class linkedDocumentLink extends Component {
  // Input
  // this.args.documentContainer
  // this.args.agendaitemOrSubcaseOrMeeting

  @service currentSession;

  classNameBindings = ['aboutToDelete'];

  @tracked isShowingPieces = false
  @tracked piecesToDelete = null;
  @tracked isVerifyingUnlink = false;
  @tracked lastPiece = null;
  @tracked mySortedPieces;

  document = null

  get openClass() {
    if (this.isShowingPieces) {
      return 'js-vl-accordion--open';
    }
    return null;
  }

  get setupPieces() {
    this.mySortedPieces();
    return true;
  }

  // TODO: DUPLICATE CODE IN agenda/agendaitem/agendaitem-case/subcase-document/document-link/component.js
  // TODO: DUPLICATE CODE IN agendaitem/agendaitem-case/subcase-document/linked-document-link/component.js
  // TODO: DUPLICATE CODE IN edit-piece/component.js
  mySortedPieces() {
    const itemPieceIds = {};
    if (!this.args.agendaitemOrSubcaseOrMeeting && !this.args.documentContainer) {
      return false;
    }
    const agendaitemOrSubcaseOrMeetingPieces = this.args.agendaitemOrSubcaseOrMeeting.linkedPieces;
    if (agendaitemOrSubcaseOrMeetingPieces) {
      agendaitemOrSubcaseOrMeetingPieces.map((piece) => {
        itemPieceIds[piece.get('id')] = true;
      });
    }
    const containerPieces = this.args.documentContainer.sortedPieces;
    if (containerPieces) {
      this.mySortedPieces = containerPieces.filter((piece) => itemPieceIds[piece.id]);
      if (this.mySortedPieces) {
        this.lastPiece = this.mySortedPieces.lastObject;
      }
    }
  }

  async getReverseSortedPieces() {
    const reversed = [];
    if (this.mySortedPieces) {
      this.mySortedPieces.map((myPiece) => {
        reversed.push(myPiece);
      });
      reversed.reverse();
      this.reverseSortedPieces = reversed;
    }
  }

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  async unlinkPieces(pieces, model) {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    // TODO linking documents is only possible for agendaitem and subcase, this code is not needed ? to check
    if (['meeting-record', 'agenda-item-treatment'].includes(modelName)) {
      return model;
    }
    const agendaActivity = await model.get('agendaActivity'); // when model = agendaitem
    const agendaitemsOnDesignAgenda = await model.get('agendaitemsOnDesignAgendaToEdit'); // when model = subcase
    if (agendaActivity) {
      const subcase = await agendaActivity.get('subcase');
      await this.unlinkPiecesFromModel(subcase, pieces);
    } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
      await Promise.all(agendaitemsOnDesignAgenda
        .map((agendaitem) => this.unlinkPiecesFromModel(agendaitem, pieces)));
    }
    const unlinkPiecesFromModelPromise = await this.unlinkPiecesFromModel(model, pieces);
    return unlinkPiecesFromModelPromise;
  }

  // TODO: refactor model/code in function of "reeds aangeleverde documenten"
  // eslint-disable-next-line class-methods-use-this
  async unlinkPiecesFromModel(model, pieces) {
    const modelPieces = await model.get('linkedPieces');
    if (modelPieces) {
      pieces
        .forEach((piece) => modelPieces.removeObject(piece));
    } else {
      model.set('linkedPieces', A([]));
    }
    const savedModalPromise = model.save();
    return savedModalPromise;
  }

  @action
  showPieces() {
    this.isShowingPieces = !this.isShowingPieces;
    if (this.isShowingPieces) {
      this.getReverseSortedPieces();
    }
  }

  @action
  cancel() {
    this.piecesToDelete = null;
    this.isVerifyingUnlink = false;
  }

  @action
  async verify() {
    const {
      pieces,
    } = this.piecesToDelete;
    await this.unlinkPieces(pieces, this.args.agendaitemOrSubcaseOrMeeting);
    if (!this.isDestroyed) {
      this.isVerifyingUnlink = false;
    }
  }

  @action
  unlinkPiece(document) {
    this.piecesToDelete = document;
    this.isVerifyingUnlink = true;
  }
}
