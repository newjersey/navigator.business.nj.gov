import { useConfig } from "@/lib/data-hooks/useConfig";

const { Config } = useConfig();

class LandingPage {
  getHowItWorksSection = () => {
    return cy.get(`[aria-label="${Config.landingPage.section4HeaderText}"]`);
  };

  scrollToHowItWorksSection = () => {
    this.getHowItWorksSection().scrollIntoView();
  };

  getMoreSupportSection = () => {
    return cy.get(`[aria-label="${Config.landingPage.section6Header}"]`);
  };

  scrollToMoreSupportSection = () => {
    this.getMoreSupportSection().scrollIntoView();
  };
}

export const onLandingPage = new LandingPage();
