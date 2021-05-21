export const clickNext = () => {
  cy.get('[data-testid="next"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

export const clickEdit = () => {
  cy.get("[data-grey-callout-link]").click();
  cy.wait(1000); // wait for onboarding animation
};
