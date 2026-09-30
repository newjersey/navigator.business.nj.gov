import {
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { randomBytes } from "node:crypto";

const EXTERNAL_PROVIDER = "EXTERNAL_PROVIDER";

// Cognito refuses EMAIL_OTP sign-in for an EXTERNAL_PROVIDER user. Setting a permanent
// password moves them to CONFIRMED. The password is never stored or logged, so nobody
// can use it. The pool requires no character classes today; the fixed suffix keeps the
// password valid if that policy is ever tightened.
const generateUnknowablePassword = (): string => {
  return `${randomBytes(30).toString("base64url")}aA1!`;
};

export const CognitoUserClientFactory = (
  userPoolId: string,
  logger: LogWriterType,
): CognitoUserClient => {
  const client = new CognitoIdentityProviderClient({});

  const getUserStatus = async (username: string): Promise<string | undefined> => {
    try {
      const response = await client.send(
        new AdminGetUserCommand({ UserPoolId: userPoolId, Username: username }),
      );
      return response.UserStatus;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        return undefined;
      }
      throw error;
    }
  };

  const findUsername = async (candidateUsernames: string[]): Promise<string | undefined> => {
    for (const candidate of candidateUsernames) {
      const status = await getUserStatus(candidate);
      if (status !== undefined) {
        return candidate;
      }
    }
    return undefined;
  };

  const ensureSignInEnabled = async (username: string): Promise<void> => {
    const status = await getUserStatus(username);
    if (status !== EXTERNAL_PROVIDER) {
      return;
    }

    await client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: username,
        Password: generateUnknowablePassword(),
        Permanent: true,
      }),
    );
    // The username is deliberately omitted: it is the one value this flow keeps out of logs.
    logger.LogInfo("Enabled code sign-in for a previously federated Cognito user");
  };

  return { findUsername, ensureSignInEnabled };
};
