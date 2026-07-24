import { OnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import { typeTaxId } from "@businessnjgovnavigator/cypress/support/helpers/helpers-form";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { ProfileTabs } from "@businessnjgovnavigator/shared/types";

export class ProfilePage extends OnboardingPage {
  private openTab(tab: ProfileTabs): void {
    cy.get(`[data-testid="${tab}"]`)
      .should("be.visible")
      .click()
      .should("have.attr", "aria-selected", "true");
    cy.get(`#tabpanel-${tab}`).should("be.visible");
  }

  getLegalStructure() {
    this.openTab("info");
    return cy.get("#mui-component-select-legal-structure");
  }

  getEmployerId() {
    this.openTab("numbers");
    return cy.get(`input[name="employerId"]`);
  }

  getEntityId() {
    this.openTab("numbers");
    return cy.get(`[name="entityId"]`);
  }

  getTaxId() {
    this.openTab("numbers");
    return cy.get(`input[name="taxId"]`);
  }

  getTaxPin() {
    this.openTab("numbers");
    return cy.get(`input[name="taxPin"]`);
  }

  getNotes() {
    this.openTab("notes");
    return cy.get(`textarea[name="notes"]`);
  }

  getBusinessFormationDatePicker() {
    return cy.get('[data-testid="date-dateOfFormation"]');
  }

  getSaveButton() {
    return cy.get('[data-testid="save"]');
  }

  clickSaveButton() {
    this.getSaveButton().scrollIntoView();
    this.getSaveButton().click();
  }

  selectLegalStructure(id: string) {
    const legalStructureName = LookupLegalStructureById(id).name;
    this.getLegalStructure().click();
    cy.get('[role="listbox"]').contains(legalStructureName).click({ force: true });
  }

  typeTaxId(taxId: string) {
    this.openTab("numbers");
    typeTaxId('input[name="taxId"]', taxId);
  }

  typeBusinessFormationDate(monthYearString: string) {
    this.openTab("info");
    cy.chooseDatePicker('[data-testid="date-dateOfFormation"]', monthYearString);
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

  selectHomeBased(radio: boolean) {
    this.getHomeBased(radio).check();
  }

  getHomeBased(radio?: boolean) {
    this.openTab("permits");
    return cy.get(
      `input[name="home-based-business"]${radio === undefined ? "" : `[value="${radio}"]`}`,
    );
  }
}

export const onProfilePage = new ProfilePage();
