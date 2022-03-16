import bodyParser from "body-parser";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { generateUser, generateUserData } from "../../test/factories";
import { AddNewsletter, AddToUserTesting, UserDataClient } from "../domain/types";
import { externalEndpointFactory } from "./externalEndpointRouter";

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
}));
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("externalEndpointRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubAddNewsletter: jest.MockedFunction<AddNewsletter>;
  let stubAddToUserTesting: jest.MockedFunction<AddToUserTesting>;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubAddNewsletter = jest.fn();
    stubAddToUserTesting = jest.fn();
    app = express();
    app.use(bodyParser.json());
    app.use(externalEndpointFactory(stubUserDataClient, stubAddNewsletter, stubAddToUserTesting));
  });

  const cognitoPayload = ({ id }: { id: string }) => ({
    sub: "some-sub",
    "custom:myNJUserKey": undefined,
    email: "some-eamail",
    identities: [
      {
        dateCreated: "some-date",
        issuer: "some-issuer",
        primary: "some-primary",
        providerName: "myNJ",
        providerType: "some-provider-type",
        userId: id,
      },
    ],
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe("POST", () => {
    it("adds to newsletter and user testing if true", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: {}, userTesting: true, receiveNewsletter: true }),
      });
      stubUserDataClient.put.mockResolvedValue(generateUserData({}));
      await request(app).post(`/newsletter`).send(userData);
      expect(stubAddNewsletter).toHaveBeenCalled();
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
    });

    it("adds to newsletter and puts to db if user is authenticated", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: {}, userTesting: true, receiveNewsletter: true }),
      });
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      stubUserDataClient.put.mockResolvedValue(generateUserData({}));

      await request(app).post(`/newsletter`).send(userData).set("Authorization", "Bearer user-123-token");
      expect(stubAddNewsletter).toHaveBeenCalled();
      expect(stubUserDataClient.put).toHaveBeenCalled();
    });

    it("does not add to newsletter if the request has been attempted", async () => {
      const userData = generateUserData({
        user: generateUser({
          id: "123",
          externalStatus: { newsletter: { status: "IN_PROGRESS" } },
          userTesting: true,
          receiveNewsletter: true,
        }),
      });
      await request(app).post(`/newsletter`).send(userData);
      expect(stubAddNewsletter).not.toHaveBeenCalled();
    });

    it("adds to userTesting and user testing if true", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: {}, userTesting: true, receiveNewsletter: true }),
      });
      stubUserDataClient.put.mockResolvedValue(generateUserData({}));
      await request(app).post(`/userTesting`).send(userData);
      expect(stubAddToUserTesting).toHaveBeenCalled();
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
    });

    it("adds to userTesting and puts to db if user is authenticated", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: {}, userTesting: true, receiveNewsletter: true }),
      });
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      stubUserDataClient.put.mockResolvedValue(generateUserData({}));

      await request(app).post(`/userTesting`).send(userData).set("Authorization", "Bearer user-123-token");
      expect(stubAddToUserTesting).toHaveBeenCalled();
      expect(stubUserDataClient.put).toHaveBeenCalled();
    });

    it("does not add to userTesting if the request has been attempted", async () => {
      const userData = generateUserData({
        user: generateUser({
          id: "123",
          externalStatus: { userTesting: { status: "IN_PROGRESS" } },
          userTesting: true,
          receiveNewsletter: true,
        }),
      });
      await request(app).post(`/userTesting`).send(userData);
      expect(stubAddToUserTesting).not.toHaveBeenCalled();
    });
  });
});
