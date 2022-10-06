import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { OnboardingPage } from "./onboardingPage";

export class ProfilePage extends OnboardingPage {
  getLegalStructure() {
    cy.get('[data-testid="info"').click({ force: true });
    return cy.get("#mui-component-select-legal-structure");
  }

  getEmployerId() {
    cy.get('[data-testid="numbers"').click({ force: true });
    return cy.get(`input[name="employerId"]`);
  }

  getEntityId() {
    cy.get('[data-testid="numbers"').click({ force: true });
    return cy.get(`[name="entityId"]`);
  }

  getTaxId() {
    cy.get('[data-testid="numbers"').click({ force: true });
    return cy.get(`input[name="taxId"]`);
  }

  getTaxPin() {
    cy.get('[data-testid="numbers"').click({ force: true });
    return cy.get(`input[name="taxPin"]`);
  }

  getNotes() {
    cy.get('[data-testid="notes"').click({ force: true });
    return cy.get(`textarea[name="notes"]`);
  }

  getSaveButton() {
    return cy.get('[data-testid="save"');
  }

  clickSaveButton() {
    this.getSaveButton().click();
  }

  selectLegalStructure(id: string) {
    cy.get('[data-testid="info"').click({ force: true });
    const companyType = LookupLegalStructureById(id).name;
    this.getLegalStructure().click();
    cy.get('[role="listbox"]').contains(companyType).click({ force: true });
  }

  typeTaxId(taxId: string) {
    cy.get('[data-testid="numbers"').click({ force: true });
    this.getTaxId().type(taxId);
  }

  typeEmployerId(EIN: string) {
    cy.get('[data-testid="numbers"').click({ force: true });
    this.getEmployerId().type(EIN);
  }

  typeNotes(notes: string) {
    cy.get('[data-testid="notes"').click({ force: true });
    this.getNotes().type(notes);
  }

  typeTaxPin(taxPin: string) {
    cy.get('[data-testid="numbers"').click({ force: true });
    return this.getTaxPin().clear().type(taxPin);
  }

  typeEntityId(EID: string) {
    cy.get('[data-testid="numbers"').click({ force: true });
    this.getEntityId().clear().type(EID);
  }

  selectHomeBased(radio: boolean) {
    this.getHomeBased(radio).check();
  }

  getHomeBased(radio?: boolean) {
    return cy.get(`input[name="home-based-business"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }
}

export const onProfilePage = new ProfilePage();
