export class RoadmapPage {
  getEditProfileLink = () => {
    return cy.get('[data-testid="grey-callout-link"]');
  };

  clickEditProfileLink = () => {
    this.getEditProfileLink().click();
  };

  clickRoadmapTask = (taskId: string) => {
    cy.get('[id="plan-header"]').click();
    cy.get('[id="start-header"]').click();
    const taskValue = `[data-task="${taskId}"]`;
    cy.get(taskValue).click({ force: true });
    cy.url().should("not.contain", "roadmap");
  };
}

export const onRoadmapPage = new RoadmapPage();
