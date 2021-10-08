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

export const clickToastLink = (): void => {
  cy.wait(300);
  cy.get('[data-testid="toast-link"]:visible').click({ force: true });
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

export const completeOnboarding = (
  businessName: string,
  industry: string,
  companyType: string,
  homeBased = true,
  city = "Absecon"
): void => {
  cy.wait(1000); // wait for onboarding animation

  cy.get('input[aria-label="Business name"]').type(businessName);
  clickNext();

  const industryValue = `[data-value="${industry}"]`;
  cy.get('[aria-label="Industry"]').click();
  cy.get(industryValue).click(); // need to be HIC for the task ID to work
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

export const defaultPa11yThresholds: Pa11yThresholds = {
  ignore: [
    "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail",
    "color-contrast",
    "landmark-no-duplicate-banner",
    "landmark-unique",
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
  formFactor: "desktop";
  screenEmulation?: {
    disabled: boolean;
  };
}

export interface Pa11yThresholds {
  ignore?: string[];
  runners?: string[];
}
