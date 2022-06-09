export class DashboardPage {
  getEditProfileLink = () => {
    return cy.get('[data-testid="header-link-to-profile"]');
  };

  clickEditProfileLink = () => {
    this.getEditProfileLink().click();
  };
}

export const onDashboardPage = new DashboardPage();
