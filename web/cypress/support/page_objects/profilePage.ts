import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { OnboardingPage } from "./onboardingPage";

export class ProfilePage extends OnboardingPage {
  getLegalStructure() {
    return cy.get("#mui-component-select-legal-structure");
  }

  getEmployerId() {
    return cy.get(`input[name="employerId"]`);
  }

  getEntityId() {
    return cy.get(`[name="entityId"]`);
  }

  getTaxId() {
    return cy.get(`input[name="taxId"]`);
  }

  getTaxPin() {
    return cy.get(`input[name="taxPin"]`);
  }

  getNotes() {
    return cy.get(`textarea[name="notes"]`);
  }

  getSaveButton() {
    return cy.get('[data-testid="save"');
  }

  clickSaveButton() {
    this.getSaveButton().click();
  }

  selectLegalStructure(id: string) {
    const companyType = LookupLegalStructureById(id).name;
    this.getLegalStructure().click();
    cy.get('[role="listbox"]').contains(companyType).click({ force: true });
  }

  typeTaxId(taxId: string) {
    this.getTaxId().type(taxId);
  }

  typeEmployerId(EIN: string) {
    this.getEmployerId().type(EIN);
  }

  typeNotes(notes: string) {
    this.getNotes().type(notes);
  }

  typeTaxPin(taxPin: string) {
    return this.getTaxPin().clear().type(taxPin);
  }

  typeEntityId(EID: string) {
    this.getEntityId().clear().type(EID);
  }
}

export const onProfilePage = new ProfilePage();
