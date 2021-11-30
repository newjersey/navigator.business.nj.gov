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

import "cypress-wait-until";

import { Auth } from "@aws-amplify/auth";
import { testUserEmail, testUserPassword } from "./index";
import { createEmptyUserData } from "../../src/lib/types/types";
import "cypress-audit/commands";

Auth.configure({
  aws_project_region: "us-east-1",
  aws_cognito_identity_pool_id: Cypress.env("AWS_COGNITO_IDENTITY_POOL_ID"),
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: Cypress.env("AWS_USER_POOLS_ID"),
  aws_user_pools_web_client_id: Cypress.env("AWS_USER_POOLS_WEB_CLIENT_ID"),
  oauth: {},
});

Cypress.Commands.add("loginByCognitoApi", () => {
  const log = Cypress.log({
    displayName: "COGNITO LOGIN",
    message: [`🔐 Authenticating | ${testUserEmail}`],
    autoEnd: false,
  });

  log.snapshot("before");

  const signIn = Auth.signIn({ username: testUserEmail, password: testUserPassword });

  cy.wrap(signIn, { log: false }).then((cognitoResponse) => {
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

    cy.request({
      method: "POST",
      url: `${Cypress.env("API_BASE_URL")}/api/users`,
      body: createEmptyUserData({
        email: testUserEmail,
        id: cognitoResponse.attributes.sub,
        receiveNewsletter: true,
        externalStatus: {},
      }),
      auth: {
        bearer: cognitoResponse.signInUserSession.idToken.jwtToken,
      },
    }).then(() => cy.visit("/onboarding"));
  });
});

Cypress.Commands.add("resetUserData", () => {
  Auth.currentSession()
    .then((currentSession) => {
      const userId = currentSession.getIdToken().decodePayload().sub;
      cy.request({
        method: "POST",
        url: `${Cypress.env("API_BASE_URL")}/api/users`,
        body: createEmptyUserData({
          email: testUserEmail,
          id: userId,
          receiveNewsletter: true,
          externalStatus: {},
        }),
        auth: {
          bearer: currentSession.getIdToken().getJwtToken(),
        },
      });
    })
    .catch((err) => console.log(err));
});

Cypress.Commands.add("forceClick", { prevSubject: "element" }, (subject) => {
  cy.wrap(subject).click({ force: true });
});
