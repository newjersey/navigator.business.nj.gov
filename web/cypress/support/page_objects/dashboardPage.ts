export class DashboardPage {
  getEditProfileLink = () => {
    return cy.get('[data-testid="grey-callout-link"]');
  };

  clickEditProfileLink = () => {
    this.getEditProfileLink().click();
  };
}

export const onDashboardPage = new DashboardPage();
