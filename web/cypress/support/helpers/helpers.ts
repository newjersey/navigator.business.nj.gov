import { onBusinessStructurePage } from "@businessnjgovnavigator/cypress/support/page_objects/businessStructurePage";
import { onOnboardingPageStartingBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageNew";
import {
  allFormationLegalTypes,
  EmploymentPlacementType,
  FormationLegalType,
  Industry,
  LegalStructures,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { LighthouseConfig, Pa11yThresholds } from "../types";

/* eslint-disable cypress/no-unnecessary-waiting */

export const lighthouseDesktopConfig: LighthouseConfig = {
  formFactor: "desktop",
  screenEmulation: {
    disabled: true,
  },
};

export const lighthouseMobileConfig: LighthouseConfig = {
  formFactor: "mobile",
  screenEmulation: {
    disabled: true,
  },
};

export const defaultPa11yThresholds: Pa11yThresholds = {
  ignore: [
    "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail",
    "color-contrast",
    "landmark-no-duplicate-banner",
    "landmark-unique",
    "aria-allowed-attr",
  ],
  runners: ["axe", "htmlcs"],
};

export const randomElementFromArray = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const completeBusinessStructureTask = ({ legalStructureId }: { legalStructureId: string }): void => {
  cy.get('[data-task="business-structure"]').first().click();
  cy.get('[data-testid="business-structure-task"]');

  onBusinessStructurePage.selectLegalStructure(legalStructureId as string);
  onBusinessStructurePage.getLegalStructure(legalStructureId as string).should("be.checked");
  onBusinessStructurePage.saveLegalStructure();

  cy.get('[data-testid="back-to-dashboard"]').click();
  cy.url().should("contain", "/dashboard");
};

export const randomFormationLegalType = (): FormationLegalType => {
  return randomElementFromArray(allFormationLegalTypes as unknown as string[]) as FormationLegalType;
};

export const randomPublicFilingLegalStructure = (): string => {
  return randomElementFromArray(LegalStructures.filter((x) => x.requiresPublicFiling)).id;
};

export const randomTradeNameLegalStructure = (): string => {
  return randomElementFromArray(LegalStructures.filter((x) => x.hasTradeName)).id;
};

export const clickDeferredSaveButton = () => {
  return cy.get(`button[data-testid="deferred-question-save"]`).first().click();
};

//Cypress Mobile Viewport
export const setMobileViewport = () => {
  cy.viewport(375, 667);
};

export const completeEmploymentAgencyOnboarding = (industry: Industry) => {
  if (industry.industryOnboardingQuestions.isEmploymentAndPersonnelTypeApplicable === undefined) {
    onOnboardingPageStartingBusiness.getEmploymentAndPersonnelServicesTypeItemsRadio().should("not.exist");
  } else {
    const employmentAndPersonnelServicesType = randomInt() % 2 ? "EMPLOYERS" : "JOB_SEEKERS";
    onOnboardingPageStartingBusiness.selectEmploymentAndPersonnelServicesType(
      employmentAndPersonnelServicesType
    );
    onOnboardingPageStartingBusiness
      .getEmploymentAndPersonnelServicesTypeItemsRadio(employmentAndPersonnelServicesType)
      .should("be.checked");
    if (employmentAndPersonnelServicesType === "EMPLOYERS") {
      const employmentPlacementChoices = ["TEMPORARY", "PERMANENT", "BOTH"] as EmploymentPlacementType[];
      const randomAnswerIndex = Math.floor(Math.random() * 3);
      const employmentPlacementTypeOption = employmentPlacementChoices[randomAnswerIndex];

      onOnboardingPageStartingBusiness.selectEmploymentPlacementTypeRadio(employmentPlacementTypeOption);
      onOnboardingPageStartingBusiness
        .getEmploymentPlacementTypeItemsRadio(employmentPlacementTypeOption)
        .should("be.checked");
    }
  }
};
