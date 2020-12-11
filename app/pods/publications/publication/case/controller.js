import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

export default class CaseController extends Controller {
  @service publicationService;

  @tracked showLoader = false;
  @tracked isShowingPersonModal = false;
  @tracked isInscriptionInEditMode = false;
  @tracked isUpdatingInscription = false;


  @tracked
  contactPerson = {
    firstName: '',
    lastName: '',
    email: '',
  };

  @tracked
  contactPersonsView = {
    size: 50,
    page: 0,
    sort: '',
  };

  @action
  onFirstNameChanged(event) {
    this.contactPerson.firstName = event.target.value;
  }

  @action
  onLastNameChanged(event) {
    this.contactPerson.lastName = event.target.value;
  }

  @action
  onEmailChanged(event) {
    this.contactPerson.email = event.target.value;
  }
  @action
  onOrganisationChanged(event) {
    this.contactPerson.organisationName = event.target.value;
  }

  get getShortTitle() {
    if (this.model) {
      return this.model.shortTitle;
    }
    return '';
  }

  get getLongTitle() {
    if (this.model) {
      return this.model.title;
    }
    return '';
  }

  @action
  showContactPersonModal() {
    this.isShowingPersonModal = true;
  }

  @action
  closeContactPersonModal() {
    this.isShowingPersonModal = false;
  }

  @action
  putInscriptionInEditMode() {
    this.isInscriptionInEditMode = true;
  }

  @action
  cancelEditingInscription() {
    this.model.rollbackAttributes();
    this.putInscriptionInNonEditMode();
  }

  @action
  putInscriptionInNonEditMode() {
    this.isInscriptionInEditMode = false;
  }

  @task
  *saveInscription() {
    try {
      yield this.model.save();
      this.putInscriptionInNonEditMode();
    } catch {
      // Don't exit if save didn't work
    }
  }

  @action
  async addNewContactPerson() {
    this.showLoader = true;
    const contactPerson =  await this.store.createRecord('contact-person', this.contactPerson);
    await contactPerson.save();
    await this.publicationService.linkContactPersonToPublication(this.publicationFlow.id, contactPerson);
    this.isShowingPersonModal = false;
    this.showLoader = false;
  }

  @action
  async deleteContactPerson(contactPerson) {
    this.showLoader = true;
    await contactPerson.destroyRecord();
    this.showLoader = false;
  }
}
