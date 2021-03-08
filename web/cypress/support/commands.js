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

import 'cypress-wait-until';

import Amplify, { Auth } from 'aws-amplify'
import {testUserEmail, testUserPassword} from "./index";

const awsConfig = {
  "aws_project_region": "us-east-1",
  "aws_cognito_identity_pool_id": Cypress.env("AWS_COGNITO_IDENTITY_POOL_ID"),
  "aws_cognito_region": "us-east-1",
  "aws_user_pools_id": Cypress.env("AWS_USER_POOLS_ID"),
  "aws_user_pools_web_client_id": Cypress.env("AWS_USER_POOLS_WEB_CLIENT_ID"),
  "oauth": {}
};
Amplify.configure(awsConfig)

Cypress.Commands.add('loginByCognitoApi', () => {
  const log = Cypress.log({
    displayName: 'COGNITO LOGIN',
    message: [`🔐 Authenticating | ${testUserEmail}`],
    autoEnd: false,
  })

  log.snapshot('before')

  const signIn = Auth.signIn({ username: testUserEmail, password: testUserPassword })

  cy.wrap(signIn, { log: false }).then((cognitoResponse) => {
    const keyPrefixWithUsername = `${cognitoResponse.keyPrefix}.${cognitoResponse.username}`

    window.localStorage.setItem(
      `${keyPrefixWithUsername}.idToken`,
      cognitoResponse.signInUserSession.idToken.jwtToken
    )

    window.localStorage.setItem(
      `${keyPrefixWithUsername}.accessToken`,
      cognitoResponse.signInUserSession.accessToken.jwtToken
    )

    window.localStorage.setItem(
      `${keyPrefixWithUsername}.refreshToken`,
      cognitoResponse.signInUserSession.refreshToken.token
    )

    window.localStorage.setItem(
      `${keyPrefixWithUsername}.clockDrift`,
      cognitoResponse.signInUserSession.clockDrift
    )

    window.localStorage.setItem(
      `${cognitoResponse.keyPrefix}.LastAuthUser`,
      cognitoResponse.username
    )

    window.localStorage.setItem('amplify-authenticator-authState', 'signedIn')
    log.snapshot('after')
    log.end()

    cy.request('POST', `${Cypress.env("API_BASE_URL")}/users`, {
      user: {
        email: testUserEmail,
        id: cognitoResponse.attributes.sub
      },
      formData: {
        user: {
          email: testUserEmail
        }
      },
      formProgress: "UNSTARTED"
    })
      .then(() => cy.visit('/'))
  })
})

Cypress.Commands.add('resetUserData', () => {
  Auth.currentSession().then((currentSession) => {
    const userId = currentSession.getIdToken().decodePayload().sub
    cy.request('POST', `${Cypress.env("API_BASE_URL")}/users`, {
      user: {
        email: testUserEmail,
        id: userId
      },
      formData: {
        user: {
          email: testUserEmail
        }
      },
      formProgress: "UNSTARTED"
    })
  })
})