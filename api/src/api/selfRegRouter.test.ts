import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { createEmptyUserData, SelfRegClient, UserDataClient } from "../domain/types";
import { generateSelfRegResponse, generateUser, generateUserData } from "../../test/factories";
import { selfRegRouterFactory } from "./selfRegRouter";
import uuid from "uuid";

jest.mock("uuid", () => ({ v4: jest.fn() }));
const mockUuid = uuid as jest.Mocked<typeof uuid>;

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

    app = express();
    app.use(bodyParser.json());
    app.use(selfRegRouterFactory(stubUserDataClient, stubSelfRegClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns an error if emails do not match", async () => {
    const response = await request(app).post(`/self-reg`).send({
      email: "some-email",
      confirmEmail: "non-matching-email",
    });

    expect(response.status).toEqual(400);
  });

  describe("when emails match", () => {
    const email = "some-email";
    const name = "some name";
    const sendRequest = async () =>
      request(app).post(`/self-reg`).send({
        email: email,
        confirmEmail: email,
        name: name,
      });

    it("fetches user data from database via email", async () => {
      stubUserDataClient.findByEmail.mockResolvedValue(generateUserData({}));
      await sendRequest();
      expect(stubUserDataClient.findByEmail).toHaveBeenCalledWith(email);
    });

    describe("when record matching email found", () => {
      describe("when record has a myNJ key", () => {
        const myNJKey = "some-mynj-key";
        const stubRecordWithMyNJKey = generateUserData({ user: generateUser({ myNJUserKey: myNJKey }) });

        it("calls auth resume with myNJ key & returns the auth redirect URL on success", async () => {
          stubUserDataClient.findByEmail.mockResolvedValue(stubRecordWithMyNJKey);
          const selfRegResponse = generateSelfRegResponse({});
          stubSelfRegClient.resume.mockResolvedValue(selfRegResponse);

          const response = await sendRequest();
          expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
        });

        it("returns an error when auth resume fails", async () => {
          stubUserDataClient.findByEmail.mockResolvedValue(stubRecordWithMyNJKey);
          stubSelfRegClient.resume.mockRejectedValue({});

          const response = await sendRequest();
          expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
          expect(response.status).toEqual(500);
        });

        it("returns a 409 error when auth resume returns DUPLICATE_SIGNUP", async () => {
          stubUserDataClient.findByEmail.mockResolvedValue(stubRecordWithMyNJKey);
          stubSelfRegClient.resume.mockRejectedValue("DUPLICATE_SIGNUP");

          const response = await sendRequest();
          expect(stubSelfRegClient.resume).toHaveBeenCalledWith(myNJKey);
          expect(response.status).toEqual(409);
        });
      });

      describe("when record DOES NOT have a myNJ key", () => {
        const stubRecordNoKey = generateUserData({ user: generateUser({ myNJUserKey: undefined }) });

        it("calls auth grant with user info & returns the auth redirect URL & saves myNJ key on success", async () => {
          stubUserDataClient.findByEmail.mockResolvedValue(stubRecordNoKey);
          const selfRegResponse = generateSelfRegResponse({});
          stubSelfRegClient.grant.mockResolvedValue(selfRegResponse);

          const response = await sendRequest();

          expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);

          const newUserWithKey = {
            ...stubRecordNoKey,
            user: {
              ...stubRecordNoKey.user,
              myNJUserKey: selfRegResponse.myNJUserKey,
            },
          };
          expect(stubUserDataClient.put).toHaveBeenCalledWith(newUserWithKey);

          expect(response.status).toEqual(200);
          expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
        });

        it("returns an error when auth grant fails", async () => {
          stubUserDataClient.findByEmail.mockResolvedValue(stubRecordNoKey);
          stubSelfRegClient.grant.mockRejectedValue({});

          const response = await sendRequest();
          expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
          expect(stubUserDataClient.put).not.toHaveBeenCalled();
          expect(response.status).toEqual(500);
        });

        it("returns a 409 error when auth grant returns DUPLICATE_SIGNUP", async () => {
          stubUserDataClient.findByEmail.mockResolvedValue(stubRecordNoKey);
          stubSelfRegClient.grant.mockRejectedValue("DUPLICATE_SIGNUP");

          const response = await sendRequest();
          expect(stubSelfRegClient.grant).toHaveBeenCalledWith(stubRecordNoKey.user);
          expect(stubUserDataClient.put).not.toHaveBeenCalled();
          expect(response.status).toEqual(409);
        });
      });
    });

    describe("when NO record matching email found", () => {
      const stubUuid = "some-uuid";
      beforeEach(async () => {
        mockUuid.v4.mockReturnValue(stubUuid);
        stubUserDataClient.findByEmail.mockResolvedValue(undefined);
      });

      it("puts initial user data into database with generated UUID, calls auth grant, saves new user & returns redirect", async () => {
        const emptyUserData = createEmptyUserData({
          myNJUserKey: undefined,
          email: email,
          id: stubUuid,
          name: name,
        });
        stubUserDataClient.put.mockResolvedValue(emptyUserData);

        const selfRegResponse = generateSelfRegResponse({});
        stubSelfRegClient.grant.mockResolvedValue(selfRegResponse);

        const response = await sendRequest();
        expect(stubUserDataClient.put).toHaveBeenCalledWith(emptyUserData);
        expect(stubSelfRegClient.grant).toHaveBeenCalledWith(emptyUserData.user);

        const newUserWithKey = {
          ...emptyUserData,
          user: {
            ...emptyUserData.user,
            myNJUserKey: selfRegResponse.myNJUserKey,
          },
        };
        expect(stubUserDataClient.put).toHaveBeenCalledWith(newUserWithKey);

        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ authRedirectURL: selfRegResponse.authRedirectURL });
      });

      it("returns an error when save new user fails", async () => {
        stubUserDataClient.put.mockRejectedValue({});
        const response = await sendRequest();
        expect(response.status).toEqual(500);
      });

      it("returns an error when auth grant fails", async () => {
        const emptyUserData = createEmptyUserData({
          myNJUserKey: undefined,
          email: email,
          id: stubUuid,
          name: "",
        });

        stubUserDataClient.put.mockResolvedValue(emptyUserData);
        stubSelfRegClient.grant.mockRejectedValue({});

        const response = await sendRequest();
        expect(response.status).toEqual(500);
      });

      it("returns a 409 error when auth grant returns DUPLICATE_SIGNUP", async () => {
        const emptyUserData = createEmptyUserData({
          myNJUserKey: undefined,
          email: email,
          id: stubUuid,
          name: "",
        });

        stubUserDataClient.put.mockResolvedValue(emptyUserData);
        stubSelfRegClient.grant.mockRejectedValue("DUPLICATE_SIGNUP");

        const response = await sendRequest();
        expect(response.status).toEqual(409);
      });
    });

    describe("when find email call fails", () => {
      it("returns an error", async () => {
        stubUserDataClient.findByEmail.mockRejectedValue({});
        const response = await sendRequest();
        expect(response.status).toEqual(500);
      });
    });
  });
});
