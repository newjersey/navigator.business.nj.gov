import {netlifyIdentityUrl, testUserEmail, testUserPassword} from "./index";

const getIframeDocument = () => {
  return cy.get("iframe#netlify-identity-widget").its("0.contentDocument").should("exist");
};

const getIframeBody = () => {
  return getIframeDocument().its("body").should("not.be.undefined").then(cy.wrap);
};

export const tryLogIn = () => {
  cy.visit("/");

  // this is a prevent-running-twice workaround
  // unfixed cypress bug: https://github.com/cypress-io/cypress/issues/2777
  cy.get("body").then(($body) => {
    if (!$body.text().includes("Get Started")) {
      cy.contains("Log in").click();

      getIframeBody().then(($widget) => {
        if (!$widget.text().includes("Clear localhost URL")) {
          getIframeBody().find('input[name="url"]').type(netlifyIdentityUrl);
          getIframeBody().find("button").contains("Set site's URL").click();
        }
      });

      getIframeBody().find('input[name="email"]').type(testUserEmail);
      getIframeBody().find('input[name="password"]').type(testUserPassword);
      getIframeBody().find('button[type="submit"]').contains("Log in").click();
    }
  })
}