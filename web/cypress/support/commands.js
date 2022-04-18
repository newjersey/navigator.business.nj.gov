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

import { Auth } from "@aws-amplify/auth";
import "cypress-audit/commands";
import "cypress-wait-until";
import { createEmptyUserData } from "../../../shared/src/userData";
import { testUserEmail, testUserPassword } from "./index";
Auth.configure({
  identityPoolRegion: "us-east-1",
  identityPoolId: Cypress.env("COGNITO_IDENTITY_POOL_ID"),
  region: "us-east-1",
  userPoolId: Cypress.env("COGNITO_USER_POOL_ID"),
  userPoolWebClientId: Cypress.env("COGNITO_WEB_CLIENT_ID"),
  oauth: {},
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
    .wrap(Auth.signIn({ username: testUserEmail, password: testUserPassword }), { log: true })
    .then((cognitoResponse) => {
      const keyPrefixWithUsername = `${cognitoResponse.keyPrefix}.${cognitoResponse.username}`;
      window.localStorage.setItem(
        `${keyPrefixWithUsername}.idToken`,
        cognitoResponse.signInUserSession.idToken.jwtToken
      );

      window.localStorage.setItem(
        `${keyPrefixWithUsername}.accessToken`,
        cognitoResponse.signInUserSession.accessToken.jwtToken
      );

      window.localStorage.setItem(
        `${keyPrefixWithUsername}.refreshToken`,
        cognitoResponse.signInUserSession.refreshToken.token
      );

      window.localStorage.setItem(
        `${keyPrefixWithUsername}.clockDrift`,
        cognitoResponse.signInUserSession.clockDrift
      );

      window.localStorage.setItem(`${cognitoResponse.keyPrefix}.LastAuthUser`, cognitoResponse.username);

      window.localStorage.setItem("amplify-authenticator-authState", "signedIn");
      log.snapshot("after");
      log.end();
      return cognitoResponse;
    })
    .wait(2000)
    .then((cognitoResponse) => {
      cy.request({
        method: "POST",
        url: `${Cypress.env("API_BASE_URL")}/api/users`,
        body: createEmptyUserData({
          email: testUserEmail,
          name: "Some Name",
          id: cognitoResponse.attributes.sub,
          receiveNewsletter: true,
          externalStatus: {},
        }),
        auth: {
          bearer: cognitoResponse.signInUserSession.idToken.jwtToken,
        },
      })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.formProgress).to.equal("UNSTARTED");
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
      cy.get(mobilePickerSelector).click();
      cy.get('[role="dialog"] [aria-label="calendar view is open, go to text input view"]').click();
      cy.get(`[role="dialog"] input${selector}`).clear().type(value);
      cy.contains('[role="dialog"] button', "OK").click();
    } else {
      cy.get(`input${selector} `).clear().type(value);
    }
  });
});
