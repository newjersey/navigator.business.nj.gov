export const clickNext = () => {
  cy.wait(300);
  cy.get('[data-testid="next"]:visible').click({ force: true });
  cy.wait(1000); // wait for onboarding animation
};

export const clickEdit = () => {
  cy.get('[data-testid="grey-callout-link"]').click();
  cy.wait(1000); // wait for onboarding animation
};
