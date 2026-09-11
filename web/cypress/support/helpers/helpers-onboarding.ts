import { randomElementFromArray } from "@businessnjgovnavigator/cypress/support/helpers/helpers";
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
import { onProfilePage } from "@businessnjgovnavigator/cypress/support/page_objects/profilePage";
import { onOnboardingPageStartingBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageNew";

type Props = {
  isLearningBusiness?: boolean;
  industry_id?: string;
};

export const completeNewBusinessOnboarding = (props?: Props): void => {
  cy.url().should("include", "onboarding?page=1");
  onOnboardingPage.selectBusinessPersona("STARTING");
  onOnboardingPage.getBusinessPersona("STARTING").should("be.checked");
  onOnboardingPage.getBusinessPersona("OWNING").should("not.be.checked");
  onOnboardingPage.getBusinessPersona("FOREIGN").should("not.be.checked");
  onOnboardingPage.clickNext();
  cy.url().should("include", "onboarding?page=2");

  const isLearningBusinessSelection = props?.isLearningBusiness
    ? String(props.isLearningBusiness)
    : "false";
  onOnboardingPageStartingBusiness.selectBusinessIntentRadio(isLearningBusinessSelection);
  onOnboardingPage.clickNext();
  cy.url().should("include", `dashboard`);

  if (props?.industry_id) {
    cy.visit("/profile");
    onProfilePage.selectIndustry(props.industry_id);
    onProfilePage.getSaveButton().first().click();
    cy.url().should("include", `dashboard`);
    cy.wait(1000);
  }
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
