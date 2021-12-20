import { EntityIdStatus } from "@shared/taxFiling";
import bodyParser from "body-parser";
import dayjs from "dayjs";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import {
  generateLicenseData,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "../../test/factories";
import { AddNewsletter, AddToUserTesting, TaxFilingClient, UserDataClient } from "../domain/types";
import { userRouterFactory } from "./userRouter";

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
}));
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("userRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubTaxFilingClient: jest.Mocked<TaxFilingClient>;
  let stubAddNewsletter: jest.MockedFunction<AddNewsletter>;
  let stubAddToUserTesting: jest.MockedFunction<AddToUserTesting>;
  let stubUpdateLicenseStatus: jest.Mock;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubUpdateLicenseStatus = jest.fn();
    stubAddNewsletter = jest.fn();
    stubAddToUserTesting = jest.fn();
    stubTaxFilingClient = {
      fetchForEntityId: jest.fn(),
    };
    app = express();
    app.use(bodyParser.json());
    app.use(
      userRouterFactory(
        stubUserDataClient,
        stubUpdateLicenseStatus,
        stubTaxFilingClient,
        stubAddNewsletter,
        stubAddToUserTesting
      )
    );
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

  describe("GET", () => {
    it("gets user with id", async () => {
      const userData = generateUserData({});
      stubUserDataClient.get.mockResolvedValue(userData);
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(userData);
    });

    it("returns a 404 when a user isn't registered", async () => {
      stubUserDataClient.get.mockImplementation(() => Promise.reject("Not found"));
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(404);
    });

    it("returns a 403 when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "other-user-id" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUserDataClient.get).not.toHaveBeenCalled();
      expect(response.status).toEqual(403);
    });

    it("returns a 500 when user get fails", async () => {
      stubUserDataClient.get.mockRejectedValue("error");

      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: "error" });
    });

    describe("updating license status", () => {
      beforeEach(async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      });
      it("does not update license if licenseData is undefined", async () => {
        const userData = generateUserData({ licenseData: undefined });
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("does not update license if licenseData lastCheckedDate is within the last hour", async () => {
        const userData = generateUserData({
          licenseData: generateLicenseData({
            lastCheckedStatus: dayjs().subtract(1, "hour").add(1, "minute").toISOString(),
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("updates user in the background if licenseData lastCheckedDate is older than last hour", async () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            industryId: "home-contractor",
          }),
          licenseData: generateLicenseData({
            lastCheckedStatus: dayjs().subtract(1, "hour").subtract(1, "minute").toISOString(),
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);
        const updatedUserData = generateUserData({});
        stubUpdateLicenseStatus.mockResolvedValue(updatedUserData);

        const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).toHaveBeenCalled();
        expect(result.body).toEqual(userData);
      });
    });
  });

  describe("POST", () => {
    it("puts user data", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });
      stubUserDataClient.put.mockResolvedValue(userData);

      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(userData);
    });

    it("fetches new entity ID status and updates taxFilingData", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const postedUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({ entityId: "1234567890" }),
        taxFilingData: generateTaxFilingData({ entityIdStatus: "UNKNOWN", filings: [] }),
      });

      const stubFilingData = {
        entityIdStatus: "EXISTS_AND_REGISTERED" as EntityIdStatus,
        filings: [generateTaxFiling({})],
      };

      stubUserDataClient.put.mockResolvedValue(generateUserData({}));
      stubTaxFilingClient.fetchForEntityId.mockResolvedValue(stubFilingData);

      await request(app).post(`/users`).send(postedUserData).set("Authorization", "Bearer user-123-token");

      expect(stubTaxFilingClient.fetchForEntityId).toHaveBeenCalledWith("1234567890");
      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...postedUserData,
        taxFilingData: stubFilingData,
      });
    });

    it("does not fetch data and overwrites taxFilingData if entity ID is empty", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const postedUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({ entityId: "" }),
        taxFilingData: generateTaxFilingData({ entityIdStatus: "EXISTS_AND_REGISTERED", filings: [] }),
      });

      stubUserDataClient.put.mockResolvedValue(generateUserData({}));
      await request(app).post(`/users`).send(postedUserData).set("Authorization", "Bearer user-123-token");

      expect(stubTaxFilingClient.fetchForEntityId).not.toHaveBeenCalled();
      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...postedUserData,
        taxFilingData: {
          entityIdStatus: "UNKNOWN",
          filings: [],
        },
      });
    });

    it("returns a 403 when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "other-user-id" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(403);
    });

    it("returns a 500 when user put fails", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      stubUserDataClient.put.mockRejectedValue("error");
      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: "error" });
    });

    it("adds to newsletter and user testing if true", async () => {
      const userData = generateUserData({
        user: generateUser({ id: "123", externalStatus: {}, userTesting: true, receiveNewsletter: true }),
      });
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      stubUserDataClient.put.mockResolvedValue(generateUserData({}));

      await request(app).post(`/users`).send(userData).set("Authorization", "Bearer user-123-token");
      expect(stubAddNewsletter).toHaveBeenCalled();
      expect(stubAddToUserTesting).toHaveBeenCalled();
    });
    it("does not add to newsletter and user testing if true", async () => {
      const userData = generateUserData({
        user: generateUser({
          id: "123",
          externalStatus: { newsletter: { status: "IN_PROGRESS" }, userTesting: { status: "IN_PROGRESS" } },
          userTesting: true,
          receiveNewsletter: true,
        }),
      });
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      stubUserDataClient.put.mockResolvedValue(generateUserData({}));

      await request(app).post(`/users`).send(userData).set("Authorization", "Bearer user-123-token");
      expect(stubAddNewsletter).not.toHaveBeenCalled();
      expect(stubAddToUserTesting).not.toHaveBeenCalled();
    });
  });
});
