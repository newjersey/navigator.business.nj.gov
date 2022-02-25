import { LookupIndustryById } from "@businessnjgovnavigator/shared/";

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
    this.getBusinessName().type(businessName);
  }

  selectIndustry(industry: string) {
    const industryValue = LookupIndustryById(industry).name;
    this.getIndustryDropdown().click();
    cy.contains(industryValue).click();
  }

  selectLegalStructure(companyType: string) {
    this.getLegalStructure(companyType).click();
  }

  selectHomeBased(radio: boolean) {
    this.getHomeBased(radio).check();
  }

  selectLiquorLicense(radio: boolean) {
    this.getLiquorLicense(radio).check();
  }

  selectLocation(city: string) {
    this.getLocationDropdown().click();
    cy.contains(city).click();
  }
}

class OnboardingPageWithNavigation extends OnboardingPage {
  clickNext() {
    cy.get('[data-testid="next"]').click();
  }
}

export const onOnboardingPage = new OnboardingPageWithNavigation();
