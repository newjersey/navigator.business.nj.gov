import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import {
  answerIndustrySpecificQuestions,
  deriveIndustrySpecificAnswers,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers-industry-specific-questions";
import { onOnboardingPage } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPage";
import {
  ExistingOnboardingData,
  ForeignOnboardingData,
  Registration,
  StartingOnboardingData,
} from "@businessnjgovnavigator/cypress/support/types";
import { getIndustries, Industry } from "@businessnjgovnavigator/shared/lib/shared/src/industry";
import {
  arrayOfSectors,
  LookupSectorTypeById,
} from "@businessnjgovnavigator/shared/lib/shared/src/sector";

export const completeNewBusinessOnboarding = ({
  industry = undefined,
  liquorLicenseQuestion = undefined,
  requiresCpa = undefined,
  providesStaffingService = undefined,
  certifiedInteriorDesigner = undefined,
  realEstateAppraisalManagement = undefined,
  interstateLogistics = undefined,
  interstateMoving = undefined,
  carService = undefined,
  isChildcareForSixOrMore = undefined,
  willSellPetCareItems = undefined,
  petCareHousing = undefined,
  whatIsPropertyLeaseType = undefined,
  hasThreeOrMoreRentalUnits = undefined,
  cannabisLicenseType = undefined,
  constructionType = undefined,
  residentialConstructionType = undefined,
  publicWorksContractor = undefined,
  employmentPersonnelServiceType = undefined,
  employmentPlacementType = undefined,
}: Partial<StartingOnboardingData> & Partial<Registration>): void => {
  if (industry === undefined) {
    industry = randomElementFromArray(getIndustries()) as Industry;
  }

  const industrySpecificAnswers = deriveIndustrySpecificAnswers(industry, {
    liquorLicenseQuestion,
    requiresCpa,
    providesStaffingService,
    certifiedInteriorDesigner,
    realEstateAppraisalManagement,
    interstateLogistics,
    interstateMoving,
    carService,
    isChildcareForSixOrMore,
    willSellPetCareItems,
    petCareHousing,
    whatIsPropertyLeaseType,
    hasThreeOrMoreRentalUnits,
    cannabisLicenseType,
    constructionType,
    residentialConstructionType,
    publicWorksContractor,
    employmentPersonnelServiceType,
    employmentPlacementType,
  });

  cy.url().should("include", "onboarding?page=1");
  onOnboardingPage.selectBusinessPersona("STARTING");
  onOnboardingPage.getBusinessPersona("STARTING").should("be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("not.be.checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", "onboarding?page=2");

  onOnboardingPage.selectIndustry((industry as Industry).id);
  onOnboardingPage
    .getIndustryDropdown()
    .invoke("prop", "value")
    .should("contain", (industry as Industry).name);

  answerIndustrySpecificQuestions({ page: onOnboardingPage, ...industrySpecificAnswers });

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};
export const completeExistingBusinessOnboarding = ({
  sectorId = randomElementFromArray(arrayOfSectors).id,
}: Partial<ExistingOnboardingData> & Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("OWNING");
  onOnboardingPage.getBusinessPersona("OWNING").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("not.be.checked");

  onOnboardingPage.selectIndustrySector(sectorId);
  onOnboardingPage
    .getIndustrySectorDropdown()
    .invoke("prop", "value")
    .then((value) => {
      expect(value).to.contain(LookupSectorTypeById(sectorId).name);
    });
  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};
export const completeForeignBusinessOnboarding = ({
  foreignBusinessTypeIds,
}: Partial<ForeignOnboardingData> & Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("FOREIGN");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  if (foreignBusinessTypeIds) {
    for (const id of foreignBusinessTypeIds) {
      onOnboardingPage.checkForeignBusinessType(id);
    }
  }

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};
export const completeForeignNexusBusinessOnboarding = ({
  industry = undefined,
  locationInNewJersey = false,
}: Partial<ForeignOnboardingData> &
  Partial<StartingOnboardingData> &
  Partial<Registration>): void => {
  let pageIndex = 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  onOnboardingPage.selectBusinessPersona("FOREIGN");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("be.checked");
  onOnboardingPage.getBusinessPersona("STARTING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.clickNext();

  pageIndex += 1;
  cy.url().should("include", `onboarding?page=${pageIndex}`);

  if (locationInNewJersey === true) {
    onOnboardingPage.checkForeignBusinessType("officeInNJ");
  }

  onOnboardingPage.checkForeignBusinessType("employeeOrContractorInNJ");
  onOnboardingPage.clickNext();
  cy.url().should("include", `onboarding?page=3`);

  if (industry === undefined) {
    industry = randomElementFromArray(getIndustries()) as Industry;
  }

  onOnboardingPage.selectIndustry((industry as Industry).id);
  onOnboardingPage
    .getIndustryDropdown()
    .invoke("prop", "value")
    .should("contain", (industry as Industry).name);

  onOnboardingPage.clickNext();

  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);
};
