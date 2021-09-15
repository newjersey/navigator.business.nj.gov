/* eslint-disable cypress/no-unnecessary-waiting */
export const clickNext = (): void => {
  cy.wait(300);
  cy.get('[data-testid="next"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

export const clickEdit = (): void => {
  cy.get('[data-testid="grey-callout-link"]').click();
  cy.wait(1000); // wait for onboarding animation
};

export const completeOnboarding = (businessName: string, industry: string, companyType: string, homeBased = true,city = "Absecon"): void => {
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
}