import { ActiveUser } from "@/lib/auth/AuthContext";
import { AccountLinkingErrorStorageFactory } from "@/lib/storage/AccountLinkingErrorStorage";
import { Auth } from "@aws-amplify/auth";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@aws-sdk/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import axios, { AxiosResponse } from "axios";

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

type CognitoRefreshAuthResult = {
  AuthenticationResult: {
    AccessToken: string;
    ExpiresIn: number;
    IdToken: string;
    TokenType: string;
  };
};

type CognitoRefreshAuth = {
  token: string;
  expires_at: number;
  identity_id: string;
};

export const configureAmplify = (): void => {
  console.log(process.env.COGNITO_IDENTITY_POOL_ID?.slice(-4));
  console.log(process.env.COGNITO_USER_POOL_ID?.slice(-4));
  console.log(process.env.COGNITO_WEB_CLIENT_ID?.slice(-4));
  console.log(process.env.REDIRECT_URL?.slice(-4));

  Auth.configure({
    identityPoolRegion: process.env.AWS_REGION,
    identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.COGNITO_WEB_CLIENT_ID,
    ssr: true,
    oauth: {
      domain: process.env.AUTH_DOMAIN,
      scope: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
      redirectSignIn: process.env.REDIRECT_URL,
      redirectSignOut: process.env.REDIRECT_URL,
      responseType: "code",
    },
    refreshHandlers: {
      myNJ: refreshToken,
    },
  });
};

export const triggerSignOut = async (): Promise<void> => {
  await Auth.signOut();
};

export const triggerSignIn = async (): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  configureAmplify();
  await Auth.federatedSignIn({ customProvider: "myNJ" });
};

export const getSignedS3Link = async (value: string, expires?: number): Promise<string> => {
  const credentials = await Auth.currentUserCredentials();
  const presigner = new S3RequestPresigner({
    credentials,
    region: process.env.AWS_REGION || "us-east-1",
    sha256: Sha256,
  });

  const url = await presigner.presign(new HttpRequest(parseUrl(value)), { expiresIn: expires ?? 900 });
  return formatUrl(url);
};

export const getCurrentToken = async (): Promise<string> => {
  const cognitoSession = await Auth.currentSession();
  return cognitoSession.getIdToken().getJwtToken();
};

export const getActiveUser = async (): Promise<ActiveUser> => {
  configureAmplify();
  const cognitoSession = await Auth.currentSession();
  const cognitoPayload = cognitoSession.getIdToken().decodePayload() as CognitoIdPayload;
  if (!cognitoPayload["custom:identityId"]) {
    const user = await Auth.currentAuthenticatedUser();
    const credentials = await Auth.currentUserCredentials();
    await Auth.updateUserAttributes(user, {
      "custom:identityId": credentials.identityId,
    });
  }
  const encounteredMyNjLinkingError = AccountLinkingErrorStorageFactory().getEncounteredMyNjLinkingError();
  return cognitoPayloadToActiveUser({ cognitoPayload, encounteredMyNjLinkingError });
};

const cognitoPayloadToActiveUser = ({
  cognitoPayload,
  encounteredMyNjLinkingError,
}: {
  cognitoPayload: CognitoIdPayload;
  encounteredMyNjLinkingError?: boolean | undefined;
}): ActiveUser => {
  const myNJIdentityPayload = cognitoPayload.identities?.find((it) => {
    return it.providerName === "myNJ";
  });
  return {
    id: myNJIdentityPayload?.userId || cognitoPayload.sub,
    email: cognitoPayload.email,
    encounteredMyNjLinkingError,
  };
};

export const refreshToken = async (): Promise<CognitoRefreshAuth> => {
  const cognitoSession = await Auth.currentSession();
  const token = cognitoSession.getRefreshToken().getToken();
  return axios
    .post(
      "https://cognito-idp.us-east-1.amazonaws.com/",
      {
        ClientId: process.env.COGNITO_WEB_CLIENT_ID,
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: { REFRESH_TOKEN: token },
      },
      {
        headers: {
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
          "Content-Type": "application/x-amz-json-1.1",
        },
      }
    )
    .then((response: AxiosResponse<CognitoRefreshAuthResult>) => {
      return {
        token: response.data.AuthenticationResult.AccessToken,
        expires_at: response.data.AuthenticationResult.ExpiresIn,
        identity_id: response.data.AuthenticationResult.IdToken,
      };
    });
};
