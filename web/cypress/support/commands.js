// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import "@cypress-audit/lighthouse/commands";
import "@cypress-audit/pa11y/commands";
import { Amplify } from "aws-amplify";
import { fetchAuthSession, signIn } from "aws-amplify/auth";

import "cypress-wait-until";
import { getCurrentBusiness } from "../../../shared/src/domain-logic/getCurrentBusiness";
import { createEmptyUserData } from "../../../shared/src/userData";
import { testUserEmail, testUserPassword } from "./e2e";

Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: Cypress.env("COGNITO_IDENTITY_POOL_ID"),
      userPoolId: Cypress.env("COGNITO_USER_POOL_ID"),
      userPoolClientId: Cypress.env("COGNITO_WEB_CLIENT_ID"),
      loginWith: { oauth: {} },
    },
  },
});

Cypress.Commands.add("loginByCognitoApi", () => {
  const log = Cypress.log({
    displayName: "COGNITO LOGIN",
    message: [`🔐 Authenticating | ${testUserEmail}`],
    autoEnd: false,
  });

  log.snapshot("before");
  return cy
    .clearLocalStorage()
    .clearCookies()
    .wrap(signIn({ username: testUserEmail, password: testUserPassword }), { log: true })
    .then(() => fetchAuthSession({ forceRefresh: true }))
    .then((response) => {
      const keyPrefixWithUsername = response.tokens.accessToken.payload.username;
      window.localStorage.setItem(`${keyPrefixWithUsername}.accessToken`, response.tokens.accessToken);
      window.localStorage.setItem(
        `${keyPrefixWithUsername}.LastAuthUser`,
        response.tokens.accessToken.payload.username
      );
      window.localStorage.setItem("amplify-authenticator-authState", "signedIn");
      log.snapshot("after");
      log.end();
      return {
        accessToken: response.tokens.accessToken.toString(),
        userID: response.tokens.accessToken.payload.username,
      };
    })
    .wait(2000)
    .then((response) => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("API_BASE_URL")}/api/users`,
        body: createEmptyUserData({
          email: testUserEmail,
          name: "Some Name",
          id: response.userID,
          receiveNewsletter: true,
          externalStatus: {},
        }),
        auth: {
          bearer: response.accessToken,
        },
      })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(getCurrentBusiness(response.body).onboardingFormProgress).to.equal("UNSTARTED");
        })
        .visit("/onboarding", {
          onBeforeLoad: (win) => {
            win.sessionStorage.clear();
          },
        });
    });
});

Cypress.Commands.add("forceClick", { prevSubject: "element" }, (subject) => {
  cy.wrap(subject).click({ force: true });
});

Cypress.Commands.add("chooseDatePicker", (selector, value) => {
  cy.get("body").then(($body) => {
    const mobilePickerSelector = `input${selector}[readonly]`;
    const isMobile = $body.find(mobilePickerSelector).length > 0;
    if (isMobile) {
      // The MobileDatePicker component has readonly inputs and needs to
      // be opened and clicked on edit so its inputs can be edited
      cy.get(mobilePickerSelector).click({ force: true });
      cy.get('[role="dialog"] [aria-label="calendar view is open, go to text input view"]').click({
        force: true,
      });
      cy.get(`[role="dialog"] input${selector}`).last().clear({ force: true }).type(value);
      cy.contains('[role="dialog"] button', "OK").click({ force: true });
    } else {
      cy.get(`input${selector} `).clear({ force: true }).type(value).blur();
    }
  });
});
