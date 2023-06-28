// I had to use wait here because there's no good way to .should on a value in an object in an array
import { onLandingPage } from "@businessnjgovnavigator/cypress/support/page_objects/landingPage";

describe("Landing [feature] [all] [group2]", () => {
  it("calls the landing_page_how_it_works.scroll.how_it_works_seen analytics when scrolled to the how it works section ", () => {
    cy.visit("/");
    onLandingPage.scrollToHowItWorksSection();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.window()
      .its("dataLayer")
      .wait(5000)
      .then((list) => Cypress._.map(list, (o) => Cypress._.pick(o, ["event", "scroll_depth"])))
      .and("deep.include", {
        event: "scroll_tracking",
        scroll_depth: "how_it_works",
      });
  });

  it("calls the landing_page_more_support.scroll.more_support_seen analytics when scrolled to the more support section ", () => {
    cy.visit("/");
    onLandingPage.scrollToMoreSupportSection();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.window()
      .its("dataLayer")
      .wait(5000)
      .then((list) => Cypress._.map(list, (o) => Cypress._.pick(o, ["event", "scroll_depth"])))
      .and("deep.include", {
        event: "scroll_tracking",
        scroll_depth: "more_support_seen",
      });
  });
});
