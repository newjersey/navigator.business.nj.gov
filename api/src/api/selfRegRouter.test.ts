import { selfRegRouterFactory } from "@api/selfRegRouter";
import { DatabaseClient, MessagingServiceClient, SelfRegClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { CONFIG_VARS, getConfigValue } from "@libs/ssmUtils";
import { generateUser, generateUserData } from "@shared/test";
import { UserData } from "@shared/userData";
import { generateSelfRegResponse } from "@test/factories";
import { generateHashedKey, getLastCalledWith } from "@test/helpers";
import dayjs from "dayjs";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request, { Response } from "supertest";

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  (paramName: CONFIG_VARS) => Promise<string>
>;

describe("selfRegRouter", () => {
  let app: Express;

  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;
  let stubSelfRegClient: jest.Mocked<SelfRegClient>;
  let stubMessagingServiceClient: jest.Mocked<MessagingServiceClient>;

  beforeEach(async () => {
    stubDynamoDataClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };

    stubSelfRegClient = {
      grant: jest.fn(),
      resume: jest.fn(),
    };

    stubMessagingServiceClient = {
      sendMessage: jest.fn().mockResolvedValue({ success: true, messageId: "test-message-id" }),
      health: jest.fn(),
    };

    mockGetConfigValue.mockResolvedValue("true");

    app = setupExpress(false);
    app.use(
      selfRegRouterFactory(
        stubDynamoDataClient,
        stubSelfRegClient,
        stubMessagingServiceClient,
        DummyLogWriter,
      ),
    );
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  const sendRequest = async (userData: UserData): Promise<Response> => {
    return request(app).post(`/self-reg`).send(userData);
  };

  describe("when record has a myNJ key", () => {
    const myNJKey = "some-mynj-key";
    const stubRecordWithMyNJKey = generateUserData({
      user: generateUser({ myNJUserKey: myNJKey }),
    });

    it("calls auth resume with myNJ key, saves data, & returns the auth redirect URL on success", async () => {
      const selfRegResponse = generateSelfRegResponse({ myNJUserKey: myNJKey });
      stubSelfRegClient.resume.mockResolvedValue(selfRegResponse);

      const response = await sendRequest(stubRecordWithMyNJKey);
      const hashedKey = generateHashedKey(myNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);

      const putCalledWith = getLastCalledWith(stubDynamoDataClient.put)[0];
      expect(putCalledWith.user.intercomHash).toEqual(hashedKey);
      expect(putCalledWith.lastUpdatedISO).not.toBeUndefined();
      expect(putCalledWith.dateCreatedISO).not.toBeUndefined();
      expect(dayjs(putCalledWith.lastUpdatedISO).isSame(dayjs(), "minute")).toBe(true);
      expect(dayjs(putCalledWith.dateCreatedISO).isSame(dayjs(), "minute")).toBe(true);

      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
    });

    it("returns an INTERNAL SERVER ERROR when auth resume fails", async () => {
      stubDynamoDataClient.findByEmail.mockResolvedValue(stubRecordWithMyNJKey);
      stubSelfRegClient.resume.mockRejectedValue({});

      const response = await sendRequest(stubRecordWithMyNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it("returns a CONFLICT error when auth resume returns DUPLICATE_SIGNUP", async () => {
      stubSelfRegClient.resume.mockRejectedValue(new Error("DUPLICATE_SIGNUP"));

      const response = await sendRequest(stubRecordWithMyNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
      expect(response.status).toEqual(StatusCodes.CONFLICT);
    });
  });

  describe("when record DOES NOT have a myNJ key", () => {
    const stubRecordNoKey = generateUserData({ user: generateUser({ myNJUserKey: undefined }) });

    it("calls auth grant with user info & returns the auth redirect URL & saves myNJ key / hash on success", async () => {
      const selfRegResponse = generateSelfRegResponse({});
      stubSelfRegClient.grant.mockResolvedValue(selfRegResponse);

      const response = await sendRequest(stubRecordNoKey);

      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
      const hashedKey = generateHashedKey(selfRegResponse.myNJUserKey);

      const putCalledWith = getLastCalledWith(stubDynamoDataClient.put)[0];
      expect(putCalledWith.user.intercomHash).toEqual(hashedKey);
      expect(putCalledWith.user.myNJUserKey).toEqual(selfRegResponse.myNJUserKey);
      expect(putCalledWith.lastUpdatedISO).not.toBeUndefined();
      expect(putCalledWith.dateCreatedISO).not.toBeUndefined();
      expect(dayjs(putCalledWith.lastUpdatedISO).isSame(dayjs(), "minute")).toBe(true);
      expect(dayjs(putCalledWith.dateCreatedISO).isSame(dayjs(), "minute")).toBe(true);

      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
    });

    it("returns an INTERNAL SERVER ERROR when auth grant fails", async () => {
      stubSelfRegClient.grant.mockRejectedValue({});
      const response = await sendRequest(stubRecordNoKey);
      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
      expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it("returns a CONFLICT error when auth grant returns DUPLICATE_SIGNUP", async () => {
      stubSelfRegClient.grant.mockRejectedValue(new Error("DUPLICATE_SIGNUP"));

      const response = await sendRequest(stubRecordNoKey);
      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
      expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.CONFLICT);
    });
  });

  describe("welcome message sending", () => {
    it("sends welcome message with correct parameters when registration succeeds", async () => {
      const selfRegResponse = generateSelfRegResponse({});
      stubSelfRegClient.grant.mockResolvedValue(selfRegResponse);
      const stubRecord = generateUserData({
        user: generateUser({ myNJUserKey: undefined, email: "Test@Example.com" }),
      });

      await sendRequest(stubRecord);

      expect(stubMessagingServiceClient.sendMessage).toHaveBeenCalledWith(
        stubRecord.user.id,
        "welcome-email",
      );
    });

    it("does not send welcome message when registration fails", async () => {
      stubSelfRegClient.grant.mockRejectedValue({});
      const stubRecord = generateUserData({ user: generateUser({ myNJUserKey: undefined }) });

      await sendRequest(stubRecord);

      expect(stubMessagingServiceClient.sendMessage).not.toHaveBeenCalled();
    });

    it("successfully completes registration even if message sending fails", async () => {
      const selfRegResponse = generateSelfRegResponse({});
      stubSelfRegClient.grant.mockResolvedValue(selfRegResponse);
      stubMessagingServiceClient.sendMessage.mockResolvedValue({
        success: false,
        error: "Message service unavailable",
      });
      const stubRecord = generateUserData({ user: generateUser({ myNJUserKey: undefined }) });

      const response = await sendRequest(stubRecord);

      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toHaveProperty("authRedirectURL");
      expect(stubDynamoDataClient.put).toHaveBeenCalled();
      expect(stubMessagingServiceClient.sendMessage).toHaveBeenCalled();
    });
  });

  describe("converts email to lowercase before self registration", () => {
    it.each([
      { testCase: "uppercase email", email: "USERNAME@EXAMPLE.COM" },
      { testCase: "mixed case email", email: "UserName@EXAMPLE.com" },
      { testCase: "already lowercase email", email: "username@example.com" },
    ])("should convert $testCase to lowercase", async ({ email }) => {
      const userData = generateUserData({ user: generateUser({ email }) });
      await sendRequest(userData);
      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(
        expect.objectContaining({
          email: email.toLowerCase(),
        }),
      );
    });
  });
});
