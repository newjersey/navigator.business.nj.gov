import { CarServiceType, LookupIndustryById, LookupSectorTypeById } from "@businessnjgovnavigator/shared/";
import { random } from "lodash";

export class OnboardingPage {
  getBusinessPersona(radio: string) {
    return cy.get(`input[name="business-persona"][value="${radio}"]`);
  }

  getForeignBusinessCheckbox(value: string) {
    return cy.get(`input[name="foreign-business-type"][value="${value}"]`);
  }

  getBusinessName() {
    return cy.get("#businessName");
  }

  getTradeName() {
    return cy.get("#tradeName");
  }

  getCpa(radio?: boolean) {
    return cy.get(`input[name="requires-cpa"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getStaffingService(radio?: boolean) {
    return cy.get(
      `input[name="provides-staffing-service"]${radio === undefined ? "" : `[value="${radio}"]`}`
    );
  }

  getInteriorDesigner(radio?: boolean) {
    return cy.get(
      `input[name="certified-interior-designer"]${radio === undefined ? "" : `[value="${radio}"]`}`
    );
  }

  getRealEstateAppraisal(radio?: boolean) {
    return cy.get(
      `input[name="real-estate-appraisal-management"]${radio === undefined ? "" : `[value="${radio}"]`}`
    );
  }

  getInterstateLogistics(radio?: boolean) {
    return cy.get(`input[name="interstate-logistics"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getInterstateMoving(radio?: boolean) {
    return cy.get(`input[name="interstate-moving"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getCarService(radio?: CarServiceType) {
    return cy.get(`input[name="car-service"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getChildcare(radio?: boolean) {
    return cy.get(
      `input[name="is-childcare-for-six-or-more"]${radio === undefined ? "" : `[value="${radio}"]`}`
    );
  }

  getWillSellPetcareItems(radio?: boolean) {
    return cy.get(`input[name="will-sell-pet-care-items"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getPetCareHousing(radio?: boolean) {
    return cy.get(`input[name="pet-care-housing"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getIndustryDropdown() {
    return cy.get('[data-testid="industryId"]');
  }

  getBusinessFormationDatePicker() {
    return cy.get('input[name="dateOfFormation"]');
  }

  getEntityId() {
    return cy.get('input[name="entityId"]');
  }

  getIndustrySectorDropdown() {
    return cy.get('[data-testid="sectorId"]');
  }

  getNumberOfEmployees() {
    return cy.get('input[name="existingEmployees"]');
  }

  getLiquorLicense(radio?: boolean) {
    return cy.get(`input[name="liquor-license"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getLocationDropdown() {
    return cy.get('[data-testid="municipality"]');
  }

  getLocationInNewJersey(radio?: boolean) {
    return cy.get(`input[name="location-in-new-jersey"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }

  getOwnershipDropdown() {
    return cy.get('[data-testid="ownership"]');
  }

  selectBusinessPersona(radio: string) {
    this.getBusinessPersona(radio).check();
  }

  checkForeignBusinessType(value: string) {
    this.getForeignBusinessCheckbox(value).check();
  }

  typeBusinessName(businessName: string) {
    this.getBusinessName().clear().type(businessName);
  }

  typeTradeName(tradeName: string) {
    this.getTradeName().clear().type(tradeName);
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

  selectCpa(radio: boolean) {
    this.getCpa(radio).check();
  }

  selectStaffingService(radio: boolean) {
    this.getStaffingService(radio).check();
  }

  selectInteriorDesigner(radio: boolean) {
    this.getInteriorDesigner(radio).check();
  }

  selectRealEstateAppraisal(radio: boolean) {
    this.getRealEstateAppraisal(radio).check();
  }

  selectInterstateLogistics(radio: boolean) {
    this.getInterstateLogistics(radio).check();
  }

  selectInterstateMoving(radio: boolean) {
    this.getInterstateMoving(radio).check();
  }

  selectChildcare(radio: boolean) {
    this.getChildcare(radio).check();
  }

  selectPetCareHousing(radio: boolean) {
    this.getPetCareHousing(radio).check();
  }

  selectWillSellPetcareItems(radio: boolean) {
    this.getWillSellPetcareItems(radio).check();
  }

  selectCarService(radio: CarServiceType) {
    this.getCarService(radio).check();
  }

  selectIndustry(industry: string) {
    const industryValue = LookupIndustryById(industry).name;
    this.getIndustryDropdown().click();
    cy.get('[data-testid="option"]').contains(industryValue).click();
  }

  selectIndustrySector(sectorId: string) {
    const sectorValue = LookupSectorTypeById(sectorId).name;
    this.getIndustrySectorDropdown().click();
    cy.get('[role="listbox"]').contains(sectorValue).click();
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
