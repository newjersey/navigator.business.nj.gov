import { CarServiceType, LookupIndustryById } from "@businessnjgovnavigator/shared";

export class OnboardingPageStartingBusiness {
  getBusinessPersonaRadio(radio: string) {
    return cy.get(`input[name="business-persona"][value="${radio}"]`);
  }

  getCarServiceRadio(radio?: CarServiceType) {
    return cy.get(`input[name="car-service"]${`[value="${radio}"]`}`);
  }

  getIndustryDropdown() {
    return cy.get('[data-testid="industryId"]');
  }

  getChildcareRadio(radio?: boolean) {
    return cy.get(`input[name="is-childcare-for-six-or-more"]${`[value="${radio}"]`}`);
  }

  getPetCareHousingRadio(radio?: boolean) {
    return cy.get(`input[name="pet-care-housing"]${`[value="${radio}"]`}`);
  }

  getWillSellPetcareItemsRadio(radio?: boolean) {
    return cy.get(`input[name="will-sell-pet-care-items"]${`[value="${radio}"]`}`);
  }

  selectBusinessPersonaRadio(radio: string) {
    this.getBusinessPersonaRadio(radio).check();
  }

  selectCarServiceRadio(radio: CarServiceType) {
    this.getCarServiceRadio(radio).check();
  }

  selectChildcareRadio(radio: boolean) {
    this.getChildcareRadio(radio).check();
  }

  selectIndustryDropdown(industry: string) {
    const industryValue = LookupIndustryById(industry).name;
    this.getIndustryDropdown().click();
    cy.get('[data-testid="option"]').contains(industryValue).click();
  }

  selectPetCareHousingRadio(radio: boolean) {
    this.getPetCareHousingRadio(radio).check();
  }

  selectWillSellPetcareItemsRadio(radio: boolean) {
    this.getWillSellPetcareItemsRadio(radio).check();
  }

  clickNext() {
    cy.get('[data-testid="next"]').first().click({ force: true });
  }
}

export const onOnboardingPageStartingBusiness = new OnboardingPageStartingBusiness();
