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
    cy.contains(companyType).click();
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

  typeEntityId(EID: string) {
    this.getEntityId().type(EID);
  }
}

export const onProfilePage = new ProfilePage();
