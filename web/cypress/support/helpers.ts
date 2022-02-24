import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { onOnboardingPage } from "./page_objects/onboardingPage";

/* eslint-disable cypress/no-unnecessary-waiting */
export const clickNext = (): void => {
  cy.wait(300);
  cy.get('[data-testid="next"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

/* eslint-disable cypress/no-unnecessary-waiting */
export const clickSave = (): void => {
  cy.wait(300);
  cy.get('[data-testid="save"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

export const clickEdit = (): void => {
  cy.get('[data-testid="grey-callout-link"]').click();
  cy.wait(1000); // wait for onboarding animation
};

export const clickTask = (taskId: string): void => {
  cy.get('[id="plan-header"]').click();
  cy.get('[id="start-header"]').click();
  const taskValue = `[data-task="${taskId}"]`;
  cy.get(taskValue).click({ force: true });
  cy.wait(1000);
};

export const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );

export const completeNewBusinessOnboarding = (
  businessName: string,
  industry: string,
  companyType: string,
  city: string,
  homeBased: boolean | undefined,
  liquor: boolean | undefined
): void => {
  cy.url().should("include", `onboarding?page=${1}`);
  onOnboardingPage.selectNewBusiness(false);
  onOnboardingPage.getHasExistingBusiness(true).should("not.be.checked");
  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${2}`);
  onOnboardingPage.typeBusinessName(businessName);
  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${3}`);
  onOnboardingPage.selectIndustry(industry);

  if (liquor === undefined) {
    onOnboardingPage.getLiquorLicense().should("not.exist");
  } else {
    onOnboardingPage.selectLiquorLicense(liquor);
  }

  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${4}`);
  onOnboardingPage.selectLegalStructure(companyType);
  onOnboardingPage.clickNext();

  cy.url().should("include", `onboarding?page=${5}`);
  onOnboardingPage.selectLocation(city);

  if (homeBased === undefined) {
    onOnboardingPage.getHomeBased().should("not.exist");
  } else {
    onOnboardingPage.selectHomeBased(homeBased);
  }

  onOnboardingPage.clickNext();
  cy.url().should("include", `roadmap`);
};

export const completeOnboarding = (
  businessName: string,
  industry: string,
  companyType: string,
  homeBased = true,
  city = "Absecon"
): void => {
  cy.wait(1000); // wait for onboarding animation

  // check 'starting a business'
  cy.get('input[type="radio"][value="false"]').check();
  clickNext();

  cy.get('input[aria-label="Business name"]').type(businessName);
  clickNext();

  const industryValue = LookupIndustryById(industry).name;
  cy.get('[aria-label="Industry"]').click();
  cy.contains(industryValue).click();
  clickNext();

  const companyTypeValue = `[data-value="${companyType}"]`;
  cy.get(companyTypeValue).click();
  clickNext();

  if (!homeBased) {
    cy.get('input[type="radio"][value="false"]').check();
  }

  cy.get('[aria-label="Location"]').click();
  cy.contains(city).click();
  clickNext();
};

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

export interface LighthouseThresholds {
  accessibility: number;
  "best-practices": number;
  performance: number;
  seo: number;
  pwa: number;
}

export interface LighthouseConfig {
  formFactor: "desktop" | "mobile";
  screenEmulation?: {
    disabled: boolean;
  };
}

export interface Pa11yThresholds {
  ignore?: string[];
  runners?: string[];
}
