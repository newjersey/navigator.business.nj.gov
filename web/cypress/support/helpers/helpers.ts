import { onBusinessStructurePage } from "@businessnjgovnavigator/cypress/support/page_objects/businessStructurePage";
import { allFormationLegalTypes, FormationLegalType, LegalStructures } from "@businessnjgovnavigator/shared";
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
  cy.get('[data-task="business-structure"]').click();
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
  return cy.get(`button[data-testid="deferred-question-save"]`).click();
};

//Cypress Mobile Viewport
export const setMobileViewport = () => {
  cy.viewport(375, 667);
};
