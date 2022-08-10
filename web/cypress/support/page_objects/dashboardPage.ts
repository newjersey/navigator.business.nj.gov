export class DashboardPage {
  getEditProfileLink = () => {
    return cy.get('[data-testid="header-link-to-profile"]');
  };

  getDropdown = () => {
    return cy.get('[data-testid="profile-dropdown"]');
  };

  getProfileLinkInDropdown = () => {
    return cy.get('[data-testid="profile-link"]');
  };

  clickEditProfileLink = () => {
    this.getEditProfileLink().click();
  };

  clickEditProfileInDropdown = () => {
    this.getDropdown().click();
    this.getProfileLinkInDropdown().click();
  };

  clickRoadmapTask = (taskId: string) => {
    cy.get('[id="plan-header"]').click();
    cy.get('[id="start-header"]').click();
    const taskValue = `[data-task="${taskId}"]`;
    cy.get(taskValue).click({ force: true });
    cy.url().should("not.contain", "roadmap");
  };
}

export const onDashboardPage = new DashboardPage();
