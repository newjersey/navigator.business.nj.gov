import { externalEndpointRouterFactory } from "@api/externalEndpointRouter";
import { AddNewsletter, AddToUserTesting, DatabaseClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { generateUser, generateUserData } from "@shared/test";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

jest.mock("jsonwebtoken", () => {
  return {
    decode: jest.fn(),
  };
});
const mockJwt = jwt as jest.Mocked<typeof jwt>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cognitoPayload = ({ id }: { id: string }): any => {
  return {
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
  };
};

describe("externalEndpointRouter", () => {
  let app: Express;
  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;
  let stubAddNewsletter: jest.MockedFunction<AddNewsletter>;
  let stubAddToUserTesting: jest.MockedFunction<AddToUserTesting>;

  beforeEach(async () => {
    stubDynamoDataClient = {
      migrateData: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubAddNewsletter = jest.fn();
    stubAddToUserTesting = jest.fn();
    app = setupExpress(false);
    app.use(externalEndpointRouterFactory(stubDynamoDataClient, stubAddNewsletter, stubAddToUserTesting));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
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
        expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
      });

      it("adds to newsletter and updates the db if the user is authenticated", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, receiveNewsletter: true }),
        });
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubDynamoDataClient.put.mockResolvedValue(userData);
        await request(app).post(`/newsletter`).send(userData).set("Authorization", "Bearer user-123-token");
        expect(stubAddNewsletter).toHaveBeenCalled();
        expect(stubDynamoDataClient.put).toHaveBeenCalled();
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
        expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
      });

      it("adds to newsletter and updates the db if the user is authenticated", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, userTesting: true }),
        });
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubDynamoDataClient.put.mockResolvedValue(userData);
        await request(app).post(`/userTesting`).send(userData).set("Authorization", "Bearer user-123-token");
        expect(stubAddToUserTesting).toHaveBeenCalled();
        expect(stubDynamoDataClient.put).toHaveBeenCalled();
      });
    });
  });
});
