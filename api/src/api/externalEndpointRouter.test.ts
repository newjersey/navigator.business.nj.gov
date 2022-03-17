import bodyParser from "body-parser";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { generateUser, generateUserData } from "../../test/factories";
import { AddNewsletter, AddToUserTesting, UserDataClient } from "../domain/types";
import { externalEndpointRouterFactory } from "./externalEndpointRouter";

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
    app.use(externalEndpointRouterFactory(stubUserDataClient, stubAddNewsletter, stubAddToUserTesting));
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
    describe("newsletter", () => {
      it("adds to newsletter if receiveNewsletter is set to true and externalStatus is empty", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { userTesting: { status: "IN_PROGRESS" } },
            receiveNewsletter: true,
          }),
        });
        await request(app).post(`/newsletter`).send(userData);
        expect(stubAddNewsletter).toHaveBeenCalled();
      });

      it("does not add to newsletter if the request has been attempted", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { newsletter: { status: "IN_PROGRESS" } },
            receiveNewsletter: true,
          }),
        });
        await request(app).post(`/newsletter`).send(userData);
        expect(stubAddNewsletter).not.toHaveBeenCalled();
      });

      it("adds to newsletter and does not update the db if the user is unauthenticated", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, userTesting: true }),
        });
        await request(app).post(`/newsletter`).send(userData);
        expect(stubAddNewsletter).toHaveBeenCalled();
        expect(stubUserDataClient.put).not.toHaveBeenCalled();
      });

      it("adds to newsletter and updates the db if the user is authenticated", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, receiveNewsletter: true }),
        });
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubUserDataClient.put.mockResolvedValue(userData);
        await request(app).post(`/newsletter`).send(userData).set("Authorization", "Bearer user-123-token");
        expect(stubAddNewsletter).toHaveBeenCalled();
        expect(stubUserDataClient.put).toHaveBeenCalled();
      });
    });
    describe("userTesting", () => {
      it("adds to userTesting if userTesting is set to true and externalStatus is empty", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { newsletter: { status: "IN_PROGRESS" } },
            userTesting: true,
          }),
        });
        await request(app).post(`/userTesting`).send(userData);
        expect(stubAddToUserTesting).toHaveBeenCalled();
      });

      it("does not add to userTesting if the request has been attempted", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { userTesting: { status: "IN_PROGRESS" } },
            userTesting: true,
          }),
        });
        await request(app).post(`/userTesting`).send(userData);
        expect(stubAddToUserTesting).not.toHaveBeenCalled();
      });

      it("adds to newsletter and does not update the db if the user is unauthenticated", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, userTesting: true }),
        });
        await request(app).post(`/userTesting`).send(userData);
        expect(stubAddToUserTesting).toHaveBeenCalled();
        expect(stubUserDataClient.put).not.toHaveBeenCalled();
      });

      it("adds to newsletter and updates the db if the user is authenticated", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, userTesting: true }),
        });
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubUserDataClient.put.mockResolvedValue(userData);
        await request(app).post(`/userTesting`).send(userData).set("Authorization", "Bearer user-123-token");
        expect(stubAddToUserTesting).toHaveBeenCalled();
        expect(stubUserDataClient.put).toHaveBeenCalled();
      });
    });
  });
});
