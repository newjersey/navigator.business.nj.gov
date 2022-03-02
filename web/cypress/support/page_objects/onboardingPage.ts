import { LookupIndustryById } from "@businessnjgovnavigator/shared/";
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

  selectNewBusiness(radio: boolean) {
    this.getHasExistingBusiness(radio).check();
  }

  typeBusinessName(businessName: string) {
    this.getBusinessName().clear().type(businessName);
  }

  selectIndustry(industry: string) {
    const industryValue = LookupIndustryById(industry).name;
    this.getIndustryDropdown().click();
    cy.contains(industryValue).click({ force: true });
  }

  selectLegalStructure(companyType: string) {
    this.getLegalStructure(companyType).click({ force: true });
  }

  selectHomeBased(radio: boolean) {
    this.getHomeBased(radio).check();
  }

  selectLiquorLicense(radio: boolean) {
    this.getLiquorLicense(radio).check();
  }

  selectLocation(townDisplayName: string) {
    this.getLocationDropdown().type(townDisplayName);
    cy.get("#mui-2-option-0").click({ force: true });
  }

  selectRandomLocation() {
    this.getLocationDropdown().click();
    cy.get("#mui-2-listbox")
      .find("li")
      .then((list) => {
        const num = random(list.length - 1);
        cy.get(`#mui-2-option-${num}`).click({ force: true });
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

  checkNewsletterCheckbox() {
    this.getNewsletterCheckbox().check();
  }

  checkContactMeCheckbox() {
    this.getContactMeCheckbox().check();
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
