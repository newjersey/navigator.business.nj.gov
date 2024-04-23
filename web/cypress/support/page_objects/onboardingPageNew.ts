import {
  CarServiceType,
  ConstructionType,
  LookupIndustryById,
  LookupSectorTypeById, ResidentialConstructionType
} from "@businessnjgovnavigator/shared";

class OnboardingSharedElements {
  getBusinessPersonaRadio(radio: string) {
    return cy.get(`input[name="business-persona"][value="${radio}"]`);
  }

  selectBusinessPersonaRadio(radio: string) {
    this.getBusinessPersonaRadio(radio).check();
  }

  clickShowMyGuide() {
    cy.get('[data-testid="next"]').first().click({ force: true });
  }
}

class OnboardingPageStartingBusiness extends OnboardingSharedElements {
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


  getConstructionTypeItemsRadio(value?: ConstructionType) {
    return cy.get(`input[name="construction-type"]${`[value="${value}"]`}`);
  }

  getResidentialConstructionTypeRadio() {
    return cy.get(`input[name="residential-construction-type"]`);
  }

  getResidentialConstructionTypeItemsRadio(value?: ResidentialConstructionType) {
    return cy.get(`input[name="residential-construction-type"]${`[value="${value}"]`}`);
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

  selectConstructionTypeRadio(value: ConstructionType) {
    this.getConstructionTypeItemsRadio(value).check();
  }

  selectResidentialConstructionTypeRadio(value: ResidentialConstructionType) {
    this.getResidentialConstructionTypeItemsRadio(value).check();
  }

  clickNext() {
    cy.get('[data-testid="next"]').first().click({ force: true });
  }
}

class OnboardingPageExistingBusiness extends OnboardingSharedElements {
  getIndustrySectorDropdown() {
    return cy.get('[data-testid="sectorId"]');
  }

  selectIndustrySector(sectorId: string) {
    const sectorValue = LookupSectorTypeById(sectorId).name;
    this.getIndustrySectorDropdown().click();
    cy.get('[role="listbox"]').contains(sectorValue).click();
  }
}

export const onOnboardingPageStartingBusiness = new OnboardingPageStartingBusiness();
export const onOnboardingPageExistingBusiness = new OnboardingPageExistingBusiness();
