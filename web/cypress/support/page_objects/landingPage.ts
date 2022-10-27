class LandingPage {
  getHowItWorksSection = () => {
    return cy.get('[aria-label="How it works"]');
  };

  scrollToHowItWorksSection = () => {
    this.getHowItWorksSection().scrollIntoView();
  };

  getMoreSupportSection = () => {
    return cy.get('[aria-label="Looking for more support?"]');
  };

  scrollToMoreSupportSection = () => {
    this.getMoreSupportSection().scrollIntoView();
  };
}

export const onLandingPage = new LandingPage();
