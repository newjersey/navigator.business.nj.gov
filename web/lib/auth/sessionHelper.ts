import { BusinessUser } from "@/lib/types/types";
import { Auth } from "@aws-amplify/auth";

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
};

export const getCurrentToken = async (): Promise<string> => {
  const cognitoSession = await Auth.currentSession();
  return cognitoSession.getAccessToken().getJwtToken();
};

export const getCurrentUser = async (): Promise<BusinessUser> => {
  const cognitoSession = await Auth.currentSession();
  const cognitoPayload = cognitoSession.getIdToken().decodePayload() as CognitoIdPayload;
  return cognitoPayloadToBusinessUser(cognitoPayload);
};

const cognitoPayloadToBusinessUser = (cognitoPayload: CognitoIdPayload): BusinessUser => {
  return {
    name: undefined,
    id: cognitoPayload.sub,
    email: cognitoPayload.email,
  };
};
