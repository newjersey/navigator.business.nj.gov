export class DashboardPage {
  getEditProfileLink = () => {
    return cy.get('[data-testid="header-link-to-profile"]');
  };

  getDropdown = () => {
    return cy.get('[data-testid="nav-bar-desktop-dropdown-button"]');
  };

  getProfileLinkInDropdown = () => {
    return cy.get('[data-testid="profile-link"]');
  };

  getAddBusinessButtonInDropdown = () => {
    return cy.get('[data-testid="addBusinessMenuItem"]');
  };

  clickEditProfileLink = () => {
    this.getEditProfileLink().first().click();
  };

  clickEditProfileInDropdown = () => {
    this.getDropdown().first().click();
    this.getProfileLinkInDropdown().first().click();
  };

  clickRoadmapTask = (taskId: string) => {
    cy.get('[id="plan-header"]').first().click();
    cy.get('[id="start-header"]').first().click();
    const taskValue = `[data-task="${taskId}"]`;
    cy.get(taskValue).first().click({ force: true });
    cy.url().should("not.contain", "roadmap");
  };

  selectHomeBased(radio: boolean) {
    // radio checked twice to prevent local flaky tests
    this.getHomeBased(radio).first().check();
    this.getHomeBased(radio).first().check();
  }

  getHomeBased(radio?: boolean) {
    return cy.get(`input[name="home-based-business"]${radio === undefined ? "" : `[value="${radio}"]`}`);
  }
}

export const onDashboardPage = new DashboardPage();
