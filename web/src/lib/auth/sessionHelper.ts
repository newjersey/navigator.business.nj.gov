import type { ResourcesConfig } from "@aws-amplify/core";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import {
  getSignInProvider,
  MYNJ_PROVIDER_NAME,
  PROFILE_NJ_PROVIDER_NAME,
  resolveSignedInUserId,
  type SignedInUserClaims,
} from "@businessnjgovnavigator/shared/signedInUser";
import { Amplify } from "aws-amplify";
import {
  type CredentialsAndIdentityId,
  fetchAuthSession,
  type JWT,
  signInWithRedirect,
  signOut,
  type UpdateUserAttributesInput,
  updateUserAttributes,
} from "aws-amplify/auth";
import type { ActiveUser } from "@/lib/auth/AuthContext";
import { AccountLinkingErrorStorageFactory } from "@/lib/storage/AccountLinkingErrorStorage";

type CognitoIdPayload = {
  aud: string;
  auth_time: number;
  "cognito:username": string;
  email: string;
  email_verified: boolean;
  event_id: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  token_use: string;
  "custom:myNJUserKey": string;
  "custom:identityId": string | undefined;
  "custom:profileNJResidentId"?: string;
  identities: CognitoIdentityPayload[] | undefined;
};

type CognitoIdentityPayload = {
  dateCreated: string;
  issuer: string;
  primary: string;
  providerName: string;
  providerType: string;
  userId: string;
};

export const getCredentialsAndIdentity = async (): Promise<CredentialsAndIdentityId> => {
  const session = await fetchAuthSession();
  const credentials = session?.credentials;
  const identityId = session?.identityId;
  if (!credentials || !identityId) {
    throw new Error("Missing AWS credentials or IdentityId");
  }
  return {
    credentials,
    identityId,
  };
};

export const configureAmplify = (): void => {
  const responseType: "code" | "token" = "code";
  const amplifyConfig = {
    Auth: {
      Cognito: {
        identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
        userPoolId: process.env.COGNITO_USER_POOL_ID,
        userPoolClientId: process.env.COGNITO_WEB_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: process.env.AUTH_DOMAIN,
            scopes: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
            redirectSignIn: [process.env.REDIRECT_URL],
            redirectSignOut: [process.env.REDIRECT_URL],
            responseType,
          },
        },
      },
    },
  };
  Amplify.configure(amplifyConfig as ResourcesConfig, { ssr: true });
};

export const triggerSignOut = async (): Promise<void> => {
  await signOut();
};

const signInWithProvider = async (providerName: string): Promise<void> => {
  configureAmplify();
  await signInWithRedirect({
    provider: {
      custom: providerName,
    },
  });
};

export const triggerSignIn = async (): Promise<void> => {
  await signInWithProvider(MYNJ_PROVIDER_NAME);
};

export const triggerProfileNJSignIn = async (): Promise<void> => {
  await signInWithProvider(PROFILE_NJ_PROVIDER_NAME);
};

export const getSignedS3Link = async (value: string, expires?: number): Promise<string> => {
  const credentialsAndIdentityId = await getCredentialsAndIdentity();
  const credentials = credentialsAndIdentityId.credentials;
  const presigner = new S3RequestPresigner({
    credentials,
    region: process.env.AWS_REGION || "us-east-1",
    sha256: Sha256,
  });

  const url = await presigner.presign(new HttpRequest(parseUrl(value)), {
    expiresIn: expires ?? 900,
  });
  return formatUrl(url);
};

export const getCurrentToken = async (): Promise<JWT> => {
  const session = await fetchAuthSession();
  if (!session.tokens || !session.tokens.idToken) {
    throw new Error("Unable to retrieve access token. Ensure the session is valid.");
  }
  return session.tokens.idToken;
};

export const getActiveUser = async (): Promise<ActiveUser> => {
  configureAmplify();
  const cognitoSession = await getCurrentToken();
  let cognitoPayload = cognitoSession.payload as CognitoIdPayload;
  if (!cognitoPayload["custom:identityId"]) {
    cognitoPayload = await addCustomFieldToCognito();
  }
  const encounteredMyNjLinkingError =
    AccountLinkingErrorStorageFactory().getEncounteredMyNjLinkingError();
  return cognitoPayloadToActiveUser({ cognitoPayload, encounteredMyNjLinkingError });
};

const addCustomFieldToCognito = async (): Promise<CognitoIdPayload> => {
  const credentialsAndIdentityId = await getCredentialsAndIdentity();
  const input: UpdateUserAttributesInput = {
    userAttributes: {
      "custom:identityId": credentialsAndIdentityId.identityId,
    },
  };
  await updateUserAttributes(input);
  const session = await fetchAuthSession({ forceRefresh: true });
  const newCognitoSession = session.tokens?.idToken;
  const newCognitoPayload = newCognitoSession?.payload as CognitoIdPayload;
  return newCognitoPayload;
};

const cognitoPayloadToActiveUser = ({
  cognitoPayload,
  encounteredMyNjLinkingError,
}: {
  cognitoPayload: CognitoIdPayload;
  encounteredMyNjLinkingError?: boolean | undefined;
}): ActiveUser => {
  const claims: SignedInUserClaims = cognitoPayload;
  return {
    id: resolveSignedInUserId(claims),
    email: cognitoPayload.email,
    encounteredMyNjLinkingError,
    signInProvider: getSignInProvider(claims),
  };
};
