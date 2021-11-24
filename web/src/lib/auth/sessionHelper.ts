import { Auth } from "@aws-amplify/auth";
import { BusinessUser } from "@businessnjgovnavigator/shared/";
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

export const getCurrentToken = async (): Promise<string> => {
  const cognitoSession = await Auth.currentSession();
  return cognitoSession.getIdToken().getJwtToken();
};

export const getCurrentUser = async (): Promise<BusinessUser> => {
  configureAmplify();
  const cognitoSession = await Auth.currentSession();
  const cognitoPayload = cognitoSession.getIdToken().decodePayload() as CognitoIdPayload;
  return cognitoPayloadToBusinessUser(cognitoPayload);
};

const cognitoPayloadToBusinessUser = (cognitoPayload: CognitoIdPayload): BusinessUser => {
  const myNJIdentityPayload = cognitoPayload.identities?.find((it) => it.providerName === "myNJ");
  return {
    name: undefined,
    id: myNJIdentityPayload?.userId || cognitoPayload.sub,
    email: cognitoPayload.email,
    externalStatus: {},
    userTesting: false,
    receiveNewsletter: false,
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
