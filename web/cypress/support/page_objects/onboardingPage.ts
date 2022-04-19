import { LookupIndustryById, LookupSectorTypeById } from "@businessnjgovnavigator/shared/";
import { random } from "lodash";

export class OnboardingPage {
  getHasExistingBusiness(radio: boolean) {
    return cy.get(`input[name="has-existing-business"][value="${radio}"]`);
  }

  getBusinessName() {
    return cy.get("#businessName");
  }

  getIndustryDropdown() {
    return cy.get('[data-testid="industryid"]');
  }

  getBusinessFormationDatePicker() {
    return cy.get('input[name="dateOfFormation"]');
  }

  getEntityId() {
    return cy.get('input[name="entityId"]');
  }

  getIndustrySectorDropdown() {
    return cy.get("#sectorId");
  }

  getNumberOfEmployees() {
    return cy.get('input[name="existingEmployees"]');
  }

  getLegalStructure(companyType: string) {
    return cy.get(`[data-value="${companyType}"]`);
  }

  getLiquorLicense(radio?: boolean) {
    return cy.get(`input[name="liquor-license"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getHomeBased(radio?: boolean) {
    return cy.get(`input[name="home-based-business"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getLocationDropdown() {
    return cy.get('[data-testid="municipality"]');
  }

  getOwnershipDropdown() {
    return cy.get('[data-testid="ownership"]');
  }

  selectNewBusiness(radio: boolean) {
    this.getHasExistingBusiness(radio).check();
  }

  typeBusinessName(businessName: string) {
    this.getBusinessName().clear().type(businessName);
  }

  typeBusinessFormationDate(monthYearString: string) {
    cy.chooseDatePicker('[name="dateOfFormation"]', monthYearString);
  }

  typeEntityId(EID: string) {
    this.getEntityId().clear().type(EID);
  }

  typeNumberOfEmployees(number: string) {
    return this.getNumberOfEmployees().clear().type(number);
  }

  selectIndustry(industry: string) {
    const industryValue = LookupIndustryById(industry).name;
    this.getIndustryDropdown().click();
    cy.contains(industryValue).click({ force: true });
  }

  selectIndustrySector(sectorId: string) {
    const sectorValue = LookupSectorTypeById(sectorId).name;
    this.getIndustrySectorDropdown().click();
    cy.contains(sectorValue).click({ force: true });
  }

  selectLegalStructure(companyType: string) {
    this.getLegalStructure(companyType).click({ force: true });
  }

  getLegalStructureDropDown() {
    return cy.get("#mui-component-select-legal-structure");
  }

  selectLegalStructureDropDown(companyType: string) {
    this.getLegalStructureDropDown().click();
    cy.get('[role="listbox"]').contains(companyType).click({ force: true });
  }

  selectHomeBased(radio: boolean) {
    this.getHomeBased(radio).check();
  }

  selectLiquorLicense(radio: boolean) {
    this.getLiquorLicense(radio).check();
  }

  selectOwnership(arrayOfOwnership: string[]) {
    this.getOwnershipDropdown().parent().click();

    cy.get(".MuiList-root li").each((listItem) => {
      if (listItem.hasClass("Mui-selected")) {
        cy.wrap(listItem).click();
      }
    });

    cy.get(".MuiList-root li").each((listItem) => {
      const dataValue = listItem.data("value");
      if (arrayOfOwnership.includes(dataValue)) {
        cy.wrap(listItem).click();
      }
    });
    cy.get("body").type("{esc}");
  }

  selectLocation(townDisplayName: string) {
    this.getLocationDropdown().type(townDisplayName);
    cy.get("#municipality-option-0").click({ force: true });
  }

  selectRandomLocation() {
    this.getLocationDropdown().click();
    cy.get("#municipality-listbox")
      .find("li")
      .then((list) => {
        const num = random(list.length - 1);
        cy.get(`#municipality-option-${num}`).click({ force: true });
      });
  }
}

class OnboardingPageWithElementsNotInProfile extends OnboardingPage {
  getFullName() {
    return cy.get("#name");
  }

  getEmail() {
    return cy.get("#email");
  }

  getConfirmEmail() {
    return cy.get("#confirm-email");
  }

  getNewsletterCheckbox() {
    return cy.get("#newsletterCheckbox");
  }

  getContactMeCheckbox() {
    return cy.get("#contactMeCheckbox");
  }

  toggleNewsletterCheckbox(check = true) {
    check ? this.getNewsletterCheckbox().check() : this.getNewsletterCheckbox().uncheck();
  }

  toggleContactMeCheckbox(check = true) {
    check ? this.getContactMeCheckbox().check() : this.getContactMeCheckbox().uncheck();
  }

  typeFullName(name: string) {
    this.getFullName().clear().type(name);
  }

  typeEmail(name: string) {
    this.getEmail().clear().type(name);
  }

  typeConfirmEmail(name: string) {
    this.getConfirmEmail().clear().type(name);
  }

  clickNext() {
    cy.get('[data-testid="next"]').first().click({ force: true });
  }
}

export const onOnboardingPage = new OnboardingPageWithElementsNotInProfile();
