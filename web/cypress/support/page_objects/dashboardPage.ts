export class DashboardPage {
  getDashboardHeader = () => {
    return cy.get('[data-testid="dashboard-header"]');
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
    cy.get('[data-testid="nav-bar-desktop-dropdown-button"]').first().click();
    cy.get('[data-testid="profile-link"]').first().click();
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
    return cy.get(
      `input[name="home-based-business"]${radio === undefined ? "" : `[value="${radio}"]`}`,
    );
  }

  getTaxFilingCalendar() {
    return cy.get('[data-testid="filings-calendar"]');
  }

  registerForTaxes() {
    return cy.get('[data-testid="register-for-taxes"]').first().click();
  }

  getRemoveBusinessLink = () => {
    return cy.get('[data-testid="remove-business-link"]');
  };

  clickRemoveBusinessLink = () => {
    this.getRemoveBusinessLink().click();
  };

  getRemoveBusinessModalCheckbox = () => {
    return cy.get('[data-testid="agreement-checkbox"]');
  };

  getRemoveBusinessModalPrimaryButton = () => {
    return cy.get('[data-testid="modal-button-primary"]');
  };

  getRemoveBusinessModalSecondaryButton = () => {
    return cy.get('[data-testid="modal-button-secondary"]');
  };

  getRemoveBusinessModalErrorAlert = () => {
    return cy.get('[data-testid="error-alert"]');
  };
}

export const onDashboardPage = new DashboardPage();
