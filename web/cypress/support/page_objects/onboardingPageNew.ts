import {
  CarServiceType,
  ConstructionType,
  LookupIndustryById,
  LookupSectorTypeById,
  ResidentialConstructionType,
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

class OnboardingSharedElementsWithIndustryQuestion extends OnboardingSharedElements {
  clickNext() {
    cy.get('[data-testid="next"]').first().click({ force: true });
  }

  getIndustryDropdown() {
    return cy.get('[data-testid="industryId"]');
  }
  selectIndustryDropdown(industry: string) {
    const industryValue = LookupIndustryById(industry).name;
    this.getIndustryDropdown().click();
    cy.get('[data-testid="option"]').contains(industryValue).click();
  }

  getCarServiceRadio(radio?: CarServiceType) {
    return cy.get(`input[name="car-service"]${`[value="${radio}"]`}`);
  }
  selectCarServiceRadio(radio: CarServiceType) {
    this.getCarServiceRadio(radio).check();
  }

  getChildcareRadio(radio?: boolean) {
    return cy.get(`input[name="is-childcare-for-six-or-more"]${`[value="${radio}"]`}`);
  }
  selectChildcareRadio(radio: boolean) {
    this.getChildcareRadio(radio).check();
  }

  getPetCareHousingRadio(radio?: boolean) {
    return cy.get(`input[name="pet-care-housing"]${`[value="${radio}"]`}`);
  }
  selectPetCareHousingRadio(radio: boolean) {
    this.getPetCareHousingRadio(radio).check();
  }

  getWillSellPetcareItemsRadio(radio?: boolean) {
    return cy.get(`input[name="will-sell-pet-care-items"]${`[value="${radio}"]`}`);
  }
  selectWillSellPetcareItemsRadio(radio: boolean) {
    this.getWillSellPetcareItemsRadio(radio).check();
  }

  getConstructionTypeItemsRadio(value?: ConstructionType) {
    return cy.get(`input[name="construction-type"]${`[value="${value}"]`}`);
  }
  selectConstructionTypeRadio(value: ConstructionType) {
    this.getConstructionTypeItemsRadio(value).check();
  }

  getResidentialConstructionTypeRadio() {
    return cy.get(`input[name="residential-construction-type"]`);
  }
  selectResidentialConstructionTypeRadio(value: ResidentialConstructionType) {
    this.getResidentialConstructionTypeItemsRadio(value).check();
  }

  getResidentialConstructionTypeItemsRadio(value?: ResidentialConstructionType) {
    return cy.get(`input[name="residential-construction-type"]${`[value="${value}"]`}`);
  }
}

class OnboardingPageNexusBusiness extends OnboardingSharedElementsWithIndustryQuestion {
  getEmployeeOrContractorInNJCheckbox() {
    return cy.get(`input[name="foreign-business-type"][value="employeeOrContractorInNJ"]`);
  }
  selectEmployeeOrContractorInNJCheckBox() {
    this.getEmployeeOrContractorInNJCheckbox().check();
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

export const onOnboardingPageStartingBusiness = new OnboardingSharedElementsWithIndustryQuestion();
export const onOnboardingPageExistingBusiness = new OnboardingPageExistingBusiness();
export const onOnboardingPageNexusBusiness = new OnboardingPageNexusBusiness();
