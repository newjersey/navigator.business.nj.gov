import { UserData } from "@shared/userData";
import { Express } from "express";
import request from "supertest";
import { generateSelfRegResponse, generateUser, generateUserData } from "../../test/factories";
import { generateHashedKey } from "../../test/helpers";
import { SelfRegClient, UserDataClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { selfRegRouterFactory } from "./selfRegRouter";

describe("selfRegRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubSelfRegClient: jest.Mocked<SelfRegClient>;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };

    stubSelfRegClient = {
      grant: jest.fn(),
      resume: jest.fn(),
    };

    app = setupExpress(false);
    app.use(selfRegRouterFactory(stubUserDataClient, stubSelfRegClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  const sendRequest = async (userData: UserData) => request(app).post(`/self-reg`).send(userData);

  describe("when record has a myNJ key", () => {
    const myNJKey = "some-mynj-key";
    const stubRecordWithMyNJKey = generateUserData({ user: generateUser({ myNJUserKey: myNJKey }) });

    it("calls auth resume with myNJ key, saves data, & returns the auth redirect URL on success", async () => {
      const selfRegResponse = generateSelfRegResponse({ myNJUserKey: myNJKey });
      stubSelfRegClient.resume.mockResolvedValue(selfRegResponse);

      const response = await sendRequest(stubRecordWithMyNJKey);
      const hashedKey = generateHashedKey(myNJKey);
      expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...stubRecordWithMyNJKey,
        user: {
          ...stubRecordWithMyNJKey.user,
          intercomHash: hashedKey,
        },
      });
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
      stubSelfRegClient.resume.mockRejectedValue("DUPLICATE_SIGNUP");

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

      const newUserWithKey = {
        ...stubRecordNoKey,
        user: {
          ...stubRecordNoKey.user,
          myNJUserKey: selfRegResponse.myNJUserKey,
          intercomHash: hashedKey,
        },
      };
      expect(stubUserDataClient.put).toHaveBeenCalledWith(newUserWithKey);

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
      stubSelfRegClient.grant.mockRejectedValue("DUPLICATE_SIGNUP");

      const response = await sendRequest(stubRecordNoKey);
      expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(409);
    });
  });
});
