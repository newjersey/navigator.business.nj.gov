export class RoadmapPage {
  getEditProfileLink = () => {
    return cy.get('[data-testid="grey-callout-link"]');
  };

  clickEditProfileLink = () => {
    this.getEditProfileLink().click();
  };
}

export const onRoadmapPage = new RoadmapPage();
