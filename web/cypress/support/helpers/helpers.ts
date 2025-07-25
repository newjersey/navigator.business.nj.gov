import { getMergedConfig } from "@/contexts/configContext";
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

const Config = getMergedConfig();

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

export const completeBusinessStructureTask = ({
  legalStructureId,
}: {
  legalStructureId: string;
}): void => {
  cy.get('[data-task="business-structure"]').first().scrollIntoView();
  cy.get('[data-task="business-structure"]').first().click();
  cy.get('[data-testid="business-structure-task"]').should("be.visible");

  onBusinessStructurePage.selectLegalStructure(legalStructureId as string);
  onBusinessStructurePage.getLegalStructure(legalStructureId as string).should("be.checked");
  onBusinessStructurePage.saveLegalStructure();

  cy.get('[data-testid="back-to-dashboard"]').click();
  cy.url().should("contain", "/dashboard");
};

export const randomFormationLegalType = (): FormationLegalType => {
  return randomElementFromArray(
    allFormationLegalTypes as unknown as string[],
  ) as FormationLegalType;
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

export const clickModalSaveButton = (): void => {
  cy.get('[data-testid="modal-button-primary"]').first().click();
  cy.wait(1000);
};

export const selectDate = (monthYear: string): void => {
  cy.chooseDatePicker('[name="dateOfFormation"]', monthYear);
};

export const selectLocation = (townDisplayName: string): void => {
  cy.get('[data-testid="municipality"]').type(townDisplayName);
  cy.get("#municipality-option-0").click({ force: true });
};

export const openFormationDateModal = (): void => {
  cy.get('[data-testid="cta-formation-nudge"]').first().click();
};

//Cypress Mobile Viewport
export const setMobileViewport = () => {
  cy.viewport(375, 667);
};

export const completeEmploymentAgencyOnboarding = (industry: Industry) => {
  if (industry.industryOnboardingQuestions.isEmploymentAndPersonnelTypeApplicable === undefined) {
    onOnboardingPageStartingBusiness
      .getEmploymentAndPersonnelServicesTypeItemsRadio()
      .should("not.exist");
  } else {
    const employmentAndPersonnelServicesType = randomInt() % 2 ? "EMPLOYERS" : "JOB_SEEKERS";
    onOnboardingPageStartingBusiness.selectEmploymentAndPersonnelServicesType(
      employmentAndPersonnelServicesType,
    );
    onOnboardingPageStartingBusiness
      .getEmploymentAndPersonnelServicesTypeItemsRadio(employmentAndPersonnelServicesType)
      .should("be.checked");
    if (employmentAndPersonnelServicesType === "EMPLOYERS") {
      const employmentPlacementChoices = [
        "TEMPORARY",
        "PERMANENT",
        "BOTH",
      ] as EmploymentPlacementType[];
      const randomAnswerIndex = Math.floor(Math.random() * 3);
      const employmentPlacementTypeOption = employmentPlacementChoices[randomAnswerIndex];

      onOnboardingPageStartingBusiness.selectEmploymentPlacementTypeRadio(
        employmentPlacementTypeOption,
      );
      onOnboardingPageStartingBusiness
        .getEmploymentPlacementTypeItemsRadio(employmentPlacementTypeOption)
        .should("be.checked");
    }
  }
};

export const fillOutTaxClearanceForm = ({
  businessName,
  addressLine1,
  addressCity,
  addressState,
  addressZipCode,
  taxPayerId,
  taxPayerPin,
}: Partial<{
  businessName: string;
  addressLine1: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  taxPayerId: string;
  taxPayerPin: string;
}>): void => {
  if (businessName) {
    cy.get('input[data-testid="businessName"]').type(businessName);
    cy.get('input[data-testid="businessName"]')
      .invoke("prop", "value")
      .should("contain", businessName);
  }

  if (addressLine1) {
    cy.get('input[id="addressLine1"]').type(addressLine1);
    cy.get('input[id="addressLine1"]').invoke("prop", "value").should("contain", addressLine1);
  }

  if (addressCity) {
    cy.get('input[id="addressCity"]').type(addressCity);
    cy.get('input[id="addressCity"]').invoke("prop", "value").should("contain", addressCity);
  }

  if (addressState) {
    cy.get('input[data-testid="addressState"]').type(addressState);
    cy.get('input[data-testid="addressState"]')
      .invoke("prop", "value")
      .should("contain", addressState);
  }

  if (addressZipCode) {
    cy.get('input[id="addressZipCode"]').type(addressZipCode);
    cy.get('input[id="addressZipCode"]').invoke("prop", "value").should("contain", addressZipCode);
  }

  if (taxPayerId) {
    cy.get('input[id="taxId"]').clear().type(taxPayerId, { delay: 50 });
  }

  if (taxPayerPin) {
    cy.get('input[id="taxPin"]').type(taxPayerPin);
    cy.get('input[id="taxPin"]').invoke("prop", "value").should("contain", taxPayerPin);
  }
};

export const completeTaxClearanceFlow = (): void => {
  cy.contains("button", "Save & Continue").click();
  cy.wait(1000);
  cy.contains("button", "Save & Continue").click();
  cy.wait(1000);

  cy.contains(Config.taxClearanceCertificateDownload.headerTwoLabel, { timeout: 500 })
    .should("be.visible")
    .and("contain.text", "Your Certificate is Ready!");
};
