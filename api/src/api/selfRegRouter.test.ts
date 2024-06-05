import { selfRegRouterFactory } from "@api/selfRegRouter";
import { SelfRegClient, UserDataClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { generateUser, generateUserData } from "@shared/test";
import { UserData } from "@shared/userData";
import { generateSelfRegResponse } from "@test/factories";
import { generateHashedKey, getLastCalledWith } from "@test/helpers";
import dayjs from "dayjs";
import { Express } from "express";
import request, { Response } from "supertest";

describe("selfRegRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubSelfRegClient: jest.Mocked<SelfRegClient>;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
    };

    stubSelfRegClient = {
      grant: jest.fn(),
      resume: jest.fn(),
    };

    app = setupExpress(false);
    app.use(selfRegRouterFactory(stubUserDataClient, stubSelfRegClient));
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
    const stubRecordWithMyNJKey = generateUserData({ user: generateUser({ myNJUserKey: myNJKey }) });

    it("calls auth resume with myNJ key, saves data, & returns the auth redirect URL on success", async () => {
      const selfRegResponse = generateSelfRegResponse({ myNJUserKey: myNJKey });
      stubSelfRegClient.resume.mockResolvedValue(selfRegResponse);

      const response = await sendRequest(stubRecordWithMyNJKey);
      const hashedKey = generateHashedKey(myNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);

      const putCalledWith = getLastCalledWith(stubUserDataClient.put)[0];
      expect(putCalledWith.user.intercomHash).toEqual(hashedKey);
      expect(putCalledWith.lastUpdatedISO).not.toBeUndefined();
      expect(putCalledWith.dateCreatedISO).not.toBeUndefined();
      expect(dayjs(putCalledWith.lastUpdatedISO).isSame(dayjs(), "minute")).toBe(true);
      expect(dayjs(putCalledWith.dateCreatedISO).isSame(dayjs(), "minute")).toBe(true);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
    });

    it("returns an error when auth resume fails", async () => {
      stubUserDataClient.findByEmail.mockResolvedValue(stubRecordWithMyNJKey);
      stubSelfRegClient.resume.mockRejectedValue({});

      const response = await sendRequest(stubRecordWithMyNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
      expect(response.status).toEqual(500);
    });

    it("returns a 409 error when auth resume returns DUPLICATE_SIGNUP", async () => {
      stubSelfRegClient.resume.mockRejectedValue(new Error("DUPLICATE_SIGNUP"));

      const response = await sendRequest(stubRecordWithMyNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
      expect(response.status).toEqual(409);
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

      const putCalledWith = getLastCalledWith(stubUserDataClient.put)[0];
      expect(putCalledWith.user.intercomHash).toEqual(hashedKey);
      expect(putCalledWith.user.myNJUserKey).toEqual(selfRegResponse.myNJUserKey);
      expect(putCalledWith.lastUpdatedISO).not.toBeUndefined();
      expect(putCalledWith.dateCreatedISO).not.toBeUndefined();
      expect(dayjs(putCalledWith.lastUpdatedISO).isSame(dayjs(), "minute")).toBe(true);
      expect(dayjs(putCalledWith.dateCreatedISO).isSame(dayjs(), "minute")).toBe(true);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
    });

    it("returns an error when auth grant fails", async () => {
      stubSelfRegClient.grant.mockRejectedValue({});

      const response = await sendRequest(stubRecordNoKey);
      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(500);
    });

    it("returns a 409 error when auth grant returns DUPLICATE_SIGNUP", async () => {
      stubSelfRegClient.grant.mockRejectedValue(new Error("DUPLICATE_SIGNUP"));

      const response = await sendRequest(stubRecordNoKey);
      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(409);
    });
  });
});
