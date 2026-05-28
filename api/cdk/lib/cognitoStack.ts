import * as cognito from "aws-cdk-lib/aws-cognito";
import * as fs from "node:fs";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  COGNITO_DOMAIN_NAME,
  COGNITO_USERPOOL_CLIENT_NAME,
  COGNITO_USERPOOL_NAME,
  COGNITO_USERPOOL_WEBCLIENT_NAME,
  PROD_STAGE,
} from "./constants";

export interface CognitoStackProps extends StackProps {
  stage: string;
  authRoleArn: string;
  unAuthRoleArn: string;
}

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);
    const metadataFilePath = process.env.COGNITO_METADATA_FILE;
    const metadataXml = metadataFilePath ? fs.readFileSync(metadataFilePath, "utf8") : undefined;

    if (!metadataXml) {
      console.warn("No Cognito metadata provided — skipping identity provider creation");
    }

    const webClientName =
      props.stage === PROD_STAGE
        ? COGNITO_USERPOOL_WEBCLIENT_NAME
        : `${COGNITO_USERPOOL_WEBCLIENT_NAME}-${props.stage}`;
    const domainName =
      props.stage === PROD_STAGE ? COGNITO_DOMAIN_NAME : `${COGNITO_DOMAIN_NAME}-${props.stage}`;

    const workspaceToCognitoClientUrlMap: Record<string, string[]> = {
      testing: [
        "https://testing.account.business.nj.gov/",
        "https://testing.account.business.nj.gov/loading",
      ],

      content: [
        "https://content.account.business.nj.gov/",
        "https://content.account.business.nj.gov/loading",
      ],

      dev: [
        "https://dev.account.business.nj.gov/",
        "https://dev.account.business.nj.gov/loading",
        "http://localhost:3000/",
        "http://localhost:3000/loading",
      ],

      prod: ["https://account.business.nj.gov/loading"],

      staging: [
        "https://staging.account.business.nj.gov/",
        "https://staging.account.business.nj.gov/loading",
      ],
    };

    const callbackUrls = workspaceToCognitoClientUrlMap[props.stage];

    const cognitoSloRedirect =
      props.stage === PROD_STAGE
        ? "https://my.nj.gov/idp/profile/SAML2/Redirect/SLO"
        : "https://myt1.nj.gov/idp/profile/SAML2/POST/SLO";

    const cognitoSsoRedirect =
      props.stage === PROD_STAGE
        ? "https://my.nj.gov/idp/profile/SAML2/Redirect/SSO"
        : "https://myt1.nj.gov/idp/profile/SAML2/POST/SSO";

    const userPool = new cognito.CfnUserPool(this, "UserPool", {
      userPoolName: `${COGNITO_USERPOOL_NAME}-${props.stage}`,
      usernameAttributes: ["email"],
      autoVerifiedAttributes: ["email"],
      policies: {
        passwordPolicy: {
          minimumLength: 8,
          requireLowercase: false,
          requireNumbers: false,
          requireSymbols: false,
          requireUppercase: false,
          temporaryPasswordValidityDays: 7,
        },
      },

      adminCreateUserConfig: {
        allowAdminCreateUserOnly: false,
      },

      accountRecoverySetting: {
        recoveryMechanisms: [
          {
            name: "verified_email",
            priority: 1,
          },
        ],
      },

      emailConfiguration: {
        emailSendingAccount: "COGNITO_DEFAULT",
      },

      schema: [
        {
          attributeDataType: "String",
          developerOnlyAttribute: false,
          mutable: true,
          name: "email",
          required: true,
          stringAttributeConstraints: {
            maxLength: "2048",
            minLength: "0",
          },
        },
        {
          attributeDataType: "String",
          developerOnlyAttribute: false,
          mutable: true,
          name: "myNJUserKey",
          required: false,
          stringAttributeConstraints: {
            maxLength: "256",
            minLength: "1",
          },
        },
        {
          attributeDataType: "String",
          developerOnlyAttribute: false,
          mutable: true,
          name: "identityId",
          required: false,
          stringAttributeConstraints: {
            maxLength: "256",
            minLength: "1",
          },
        },
      ],
    });

    new cognito.CfnUserPoolDomain(this, "UserPoolDomain", {
      domain: domainName,
      userPoolId: userPool.ref,
    });

    new cognito.CfnUserPoolClient(this, "UserPoolClient", {
      clientName: COGNITO_USERPOOL_CLIENT_NAME,
      userPoolId: userPool.ref,
      callbackUrLs: callbackUrls,
      logoutUrLs: callbackUrls,
      idTokenValidity: 1,
      accessTokenValidity: 1,
      allowedOAuthFlows: ["code"],
      allowedOAuthFlowsUserPoolClient: true,
      supportedIdentityProviders: ["COGNITO"],
      explicitAuthFlows: ["ALLOW_CUSTOM_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"],
      allowedOAuthScopes: ["aws.cognito.signin.user.admin", "email", "openid", "profile"],
    });

    const myNJidentityProvider = new cognito.CfnUserPoolIdentityProvider(
      this,
      "CognitoIdentityProvider",
      {
        userPoolId: userPool.ref,
        providerName: "myNJ",
        providerType: "SAML",
        providerDetails: {
          IDPSignout: "true",
          SLORedirectBindingURI: cognitoSloRedirect,
          SSORedirectBindingURI: cognitoSsoRedirect,
          MetadataFile: metadataXml,
        },
        idpIdentifiers: ["myNewJersey"],
        attributeMapping: {
          "custom:myNJUserKey": "urn:mynj:userKey",
          email: "Email",
        },
      },
    );

    const userpoolWebClient = new cognito.CfnUserPoolClient(this, "UserPoolWebClient", {
      clientName: webClientName,
      userPoolId: userPool.ref,
      supportedIdentityProviders: [myNJidentityProvider.providerName],
      callbackUrLs: callbackUrls,
      logoutUrLs: callbackUrls,
      allowedOAuthFlowsUserPoolClient: true,
      idTokenValidity: 1,
      accessTokenValidity: 1,
      allowedOAuthFlows: ["code", "implicit"],
      allowedOAuthScopes: ["aws.cognito.signin.user.admin", "email", "openid", "profile"],
      explicitAuthFlows: ["ALLOW_CUSTOM_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH"],
      tokenValidityUnits: {
        accessToken: "days",
        idToken: "days",
        refreshToken: "days",
      },
    });

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      identityPoolName: `${COGNITO_USERPOOL_NAME}-${props.stage}`,
      allowUnauthenticatedIdentities: false,
      allowClassicFlow: false,
      cognitoIdentityProviders: [
        {
          clientId: userpoolWebClient.ref,
          providerName: userPool.attrProviderName,
          serverSideTokenCheck: false,
        },
      ],
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, "IdentityPoolRoleAttachment", {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: props.authRoleArn,
        unauthenticated: props.unAuthRoleArn,
      },
    });
  }
}
