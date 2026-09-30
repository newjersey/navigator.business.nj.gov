import {
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserClientFactory } from "@client/CognitoUserClient";
import { CognitoUserClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";

jest.mock("@aws-sdk/client-cognito-identity-provider", () => {
  const actual = jest.requireActual("@aws-sdk/client-cognito-identity-provider");
  return { ...actual, CognitoIdentityProviderClient: jest.fn() };
});

const notFound = (): UserNotFoundException =>
  new UserNotFoundException({ message: "not found", $metadata: {} });

describe("CognitoUserClient", () => {
  const userPoolId = "us-east-1_TEST";
  let send: jest.Mock;
  let client: CognitoUserClient;

  beforeEach(() => {
    send = jest.fn();
    (CognitoIdentityProviderClient as unknown as jest.Mock).mockImplementation(() => ({ send }));
    client = CognitoUserClientFactory(userPoolId, DummyLogWriter);
  });

  describe("findUsername", () => {
    it("returns the first candidate that exists", async () => {
      send.mockRejectedValueOnce(notFound()).mockResolvedValueOnce({ UserStatus: "CONFIRMED" });

      expect(await client.findUsername(["myNJ_abc", "abc"])).toBe("abc");
    });

    it("returns undefined when no candidate exists", async () => {
      send.mockRejectedValue(notFound());

      expect(await client.findUsername(["myNJ_abc", "abc"])).toBeUndefined();
    });

    it("rethrows an unexpected error", async () => {
      send.mockRejectedValue(new Error("throttled"));

      await expect(client.findUsername(["myNJ_abc"])).rejects.toThrow("throttled");
    });
  });

  describe("ensureSignInEnabled", () => {
    it("sets a permanent password for an EXTERNAL_PROVIDER user", async () => {
      send.mockResolvedValueOnce({ UserStatus: "EXTERNAL_PROVIDER" }).mockResolvedValueOnce({});

      await client.ensureSignInEnabled("myNJ_abc");

      const command = send.mock.calls[1][0];
      expect(command).toBeInstanceOf(AdminSetUserPasswordCommand);
      expect(command.input.UserPoolId).toBe(userPoolId);
      expect(command.input.Permanent).toBe(true);
      expect(command.input.Username).toBe("myNJ_abc");
      expect(command.input.Password.length).toBeGreaterThanOrEqual(32);
    });

    it("generates a different password on every conversion", async () => {
      send
        .mockResolvedValueOnce({ UserStatus: "EXTERNAL_PROVIDER" })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ UserStatus: "EXTERNAL_PROVIDER" })
        .mockResolvedValueOnce({});

      await client.ensureSignInEnabled("myNJ_abc");
      await client.ensureSignInEnabled("myNJ_def");

      expect(send.mock.calls[1][0].input.Password).not.toEqual(
        send.mock.calls[3][0].input.Password,
      );
    });

    it("does nothing for a CONFIRMED user", async () => {
      send.mockResolvedValueOnce({ UserStatus: "CONFIRMED" });

      await client.ensureSignInEnabled("myNJ_abc");

      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0]).toBeInstanceOf(AdminGetUserCommand);
    });
  });
});
