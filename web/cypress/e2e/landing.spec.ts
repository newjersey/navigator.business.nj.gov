import { onLandingPage } from "cypress/support/page_objects/landingPage";

describe("Landing [feature] [all] [group2]", () => {
  it("calls the landing_page_how_it_works.scroll.how_it_works_seen analytics when scrolled to the how it works section ", () => {
    cy.intercept(
      {
        pathname: "/collect",
        query: {
          ec: "landing_page_how_it_works",
          ea: "scroll",
          el: "how_it_works_seen",
        },
      },
      {
        statusCode: 200,
      }
    ).as("how_it_works_event");
    cy.visit("/");
    onLandingPage.scrollToHowItWorksSection();

    cy.wait("@how_it_works_event").then((res) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(res.response!.statusCode).to.equal(200);
    });
  });

  it("calls the landing_page_more_support.scroll.more_support_seen analytics when scrolled to the more support section ", () => {
    cy.intercept(
      {
        pathname: "/collect",
        query: {
          ec: "landing_page_more_support",
          ea: "scroll",
          el: "more_support_seen",
        },
      },
      {
        statusCode: 200,
      }
    ).as("more_support_seen_event");
    cy.visit("/");
    onLandingPage.scrollToMoreSupportSection();

    cy.wait("@more_support_seen_event").then((res) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(res.response!.statusCode).to.equal(200);
    });
  });
});
