import { cognitoPayloadToActiveUser } from "@/lib/auth/sessionHelper";

type CognitoPayload = Parameters<typeof cognitoPayloadToActiveUser>[0]["cognitoPayload"];

describe("cognitoPayloadToActiveUser", () => {
  const basePayload: CognitoPayload = {
    aud: "some-client-id",
    auth_time: 0,
    "cognito:username": "cognito-sub-value",
    email: "test@example.com",
    email_verified: true,
    event_id: "some-event-id",
    exp: 0,
    iat: 0,
    iss: "some-issuer",
    sub: "cognito-sub-value",
    token_use: "id",
    "custom:identityId": "us-east-1:some-identity",
    "custom:myNJUserKey": "some-key",
    identities: undefined,
  };

  it("strips the myNJ_ prefix from the username", () => {
    const activeUser = cognitoPayloadToActiveUser({
      cognitoPayload: {
        ...basePayload,
        "cognito:username": "myNJ_c32cdf52-2b0c-4dba-9941-b095f9d6de7d",
      },
    });
    expect(activeUser.id).toBe("c32cdf52-2b0c-4dba-9941-b095f9d6de7d");
  });

  it("uses sub for a native username", () => {
    const activeUser = cognitoPayloadToActiveUser({
      cognitoPayload: { ...basePayload, "cognito:username": "cognito-sub-value" },
    });
    expect(activeUser.id).toBe("cognito-sub-value");
  });
});
