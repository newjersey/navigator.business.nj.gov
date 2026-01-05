import { onBusinessStructurePage } from "@businessnjgovnavigator/cypress/support/page_objects/businessStructurePage";
import { onOnboardingPageStartingBusiness } from "@businessnjgovnavigator/cypress/support/page_objects/onboardingPageNew";
import {
  allFormationLegalTypes,
  EmploymentPlacementType,
  FormationLegalType,
  getMergedConfig,
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
    // React 19 workaround: Use slow typing to properly trigger React onChange and updateOnBlur logic
    cy.get('input[data-testid="businessName"]')
      .focus()
      .clear({ force: true })
      .type(businessName, { delay: 100, force: true })
      .blur({ force: true });
    cy.wait(1000); // Wait for React 19 batched updates to complete
  }

  if (addressLine1) {
    // React 19 workaround: Use slow typing to properly trigger React onChange and updateOnBlur logic
    cy.get('input[id="addressLine1"]')
      .focus()
      .clear({ force: true })
      .type(addressLine1, { delay: 100, force: true })
      .blur({ force: true });
    cy.wait(1000);
  }

  if (addressCity) {
    // React 19 workaround: Use slow typing to properly trigger React onChange and updateOnBlur logic
    cy.get('input[id="addressCity"]')
      .focus()
      .clear({ force: true })
      .type(addressCity, { delay: 100, force: true })
      .blur({ force: true });
    cy.wait(1000);
  }

  if (addressState) {
    // React 19 workaround: MUI Autocomplete - type to select state
    cy.get('input[data-testid="addressState"]')
      .focus()
      .clear({ force: true })
      .type(addressState, { delay: 100, force: true })
      .blur({ force: true });
    cy.wait(1000);
  }

  if (addressZipCode) {
    // React 19 workaround: Use slow typing to properly trigger React onChange and updateOnBlur logic
    cy.get('input[id="addressZipCode"]')
      .focus()
      .clear({ force: true })
      .type(addressZipCode, { delay: 100, force: true })
      .blur({ force: true });
    cy.wait(1000);
  }

  if (taxPayerId) {
    cy.log(`Setting Tax ID value: ${taxPayerId} (length: ${taxPayerId.length})`);

    // React 19 + MUI numeric input workaround: Use React's internal value setter
    cy.get('input[id="taxId"]').then(($input) => {
      const input = $input[0] as HTMLInputElement;

      // Get React's value setter from the input element
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;

      if (nativeInputValueSetter) {
        // Use React's setter to update the value
        nativeInputValueSetter.call(input, taxPayerId);

        // Dispatch input event that React will intercept
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      cy.log(`Tax ID set to: ${input.value}`);
    });

    cy.wait(2000);

    // Trigger blur to complete the field update
    cy.get('input[id="taxId"]').blur({ force: true });
    cy.wait(2000);

    // Verify the field value
    cy.get('input[id="taxId"]').then(($input) => {
      const fieldValue = $input.val() as string;
      cy.log(`Tax ID field value verified: "${fieldValue}"`);
    });
  }

  if (taxPayerPin) {
    cy.log(`Setting Tax Pin value: ${taxPayerPin} (length: ${taxPayerPin.length})`);

    // React 19 + MUI numeric input workaround: Use React's internal value setter
    cy.get('input[id="taxPin"]').then(($input) => {
      const input = $input[0] as HTMLInputElement;

      // Get React's value setter from the input element
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;

      if (nativeInputValueSetter) {
        // Use React's setter to update the value
        nativeInputValueSetter.call(input, taxPayerPin);

        // Dispatch input event that React will intercept
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      cy.log(`Tax PIN set to: ${input.value}`);
    });

    cy.wait(2000);

    // Trigger blur to complete the field update
    cy.get('input[id="taxPin"]').blur({ force: true });
    cy.wait(2000);

    // Verify the field value
    cy.get('input[id="taxPin"]').then(($input) => {
      const fieldValue = $input.val() as string;
      cy.log(`Tax PIN field value verified: "${fieldValue}"`);
    });
  }
};

export const completeTaxClearanceFlow = (): void => {
  // NOTE: This function assumes we're already on the Check Eligibility screen with form filled out

  // React 19: Wait to ensure all form field updates have completed and saved to context
  // This prevents clicking "Save & Continue" before state is fully saved
  // Increased to 5000ms to allow fireEvent approach + all state propagation to complete
  cy.wait(5000);

  // Click Save & Continue to go from Check Eligibility → Review
  // This triggers handleSaveButtonClick with 300ms setTimeout before save
  cy.contains("button", "Save & Continue").click();

  // React 19: Wait for Review screen to load
  // Check for previous-button data-testid which ONLY exists on Review screen
  cy.get('[data-testid="previous-button"]', { timeout: 10000 }).should("be.visible");

  // Additional wait to ensure Review component is fully mounted and data is loaded
  cy.wait(1000);

  // Now on Review screen - click the Save button (use data-testid to be specific) to submit to Tax Clearance API
  cy.get('[data-testid="next-button"]').click();

  // Wait for Download screen with success message
  // Increased timeout to 30 seconds to allow for:
  // 1. postUserData to complete (encrypts Tax ID/Pin)
  // 2. postTaxClearanceCertificate API call
  // 3. Certificate PDF to be generated (large PDF ~3MB)
  // 4. Download screen to render
  cy.contains(Config.taxClearanceCertificateDownload.headerTwoLabel, { timeout: 30000 })
    .should("be.visible")
    .and("contain.text", "Your Certificate is Ready!");
};
