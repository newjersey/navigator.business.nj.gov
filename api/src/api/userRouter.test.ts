import { getCurrentDate } from "@shared/dateHelpers";
import bodyParser from "body-parser";
import express, { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import {
  generateLicenseData,
  generatePreferences,
  generateProfileData,
  generateUser,
  generateUserData,
} from "../../test/factories";
import { determineAnnualFilingDate } from "../../test/helpers";
import { UserDataClient } from "../domain/types";
import { userRouterFactory } from "./userRouter";

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
}));
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("userRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubUpdateLicenseStatus: jest.Mock;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubUpdateLicenseStatus = jest.fn();
    app = express();
    app.use(bodyParser.json());
    app.use(userRouterFactory(stubUserDataClient, stubUpdateLicenseStatus));
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

    describe("update registration card", () => {
      it("does not add successful registration card if not registered card does not exist", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({}),
          taxFilingData: { filings: [] },
          preferences: generatePreferences({
            visibleRoadmapSidebarCards: ["welcome"],
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

        expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(userData);
      });

      it("removes not registered card and adds successful registration card", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({}),
          taxFilingData: { filings: [] },
          preferences: generatePreferences({
            visibleRoadmapSidebarCards: ["not-registered"],
          }),
        });

        stubUserDataClient.get.mockResolvedValue(userData);
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

        expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
        expect(response.status).toEqual(200);

        expect(response.body).toEqual({
          ...userData,
          preferences: {
            ...userData.preferences,
            visibleRoadmapSidebarCards: ["successful-registration"],
          },
        });
      });

      it("leaves existing cards besides not registered when adding successful registration card", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({}),
          taxFilingData: { filings: [] },
          preferences: generatePreferences({
            visibleRoadmapSidebarCards: ["welcome", "not-registered"],
          }),
        });

        stubUserDataClient.get.mockResolvedValue(userData);
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

        expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
        expect(response.status).toEqual(200);

        expect(response.body).toEqual({
          ...userData,
          preferences: {
            ...userData.preferences,
            visibleRoadmapSidebarCards: ["welcome", "successful-registration"],
          },
        });
      });
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
            lastCheckedStatus: getCurrentDate().subtract(1, "hour").add(1, "minute").toISOString(),
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
            lastCheckedStatus: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
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
    beforeEach(() => {
      stubUserDataClient.get.mockResolvedValue(generateUserData({}));
    });

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

    it("calculates new annual filing date and updates it for dateOfFormation", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const postedUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({
          dateOfFormation: "2021-03-01",
          entityId: undefined,
          legalStructureId: "limited-liability-company",
        }),
        taxFilingData: { filings: [] },
      });

      stubUserDataClient.put.mockResolvedValue(postedUserData);

      await request(app).post(`/users`).send(postedUserData).set("Authorization", "Bearer user-123-token");

      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...postedUserData,
        taxFilingData: {
          ...postedUserData.taxFilingData,
          filings: [{ identifier: "ANNUAL_FILING", dueDate: determineAnnualFilingDate("2021-03-01") }],
        },
      });
    });

    it("clears taskChecklistItems if industry has changed", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const newIndustryUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({ industryId: "cannabis" }),
        taskItemChecklist: { "some-id": true },
      });

      stubUserDataClient.get.mockResolvedValue({
        ...newIndustryUserData,
        profileData: {
          ...newIndustryUserData.profileData,
          industryId: "home-contractor",
        },
      });
      stubUserDataClient.put.mockResolvedValue(newIndustryUserData);

      await request(app)
        .post(`/users`)
        .send(newIndustryUserData)
        .set("Authorization", "Bearer user-123-token");

      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...newIndustryUserData,
        taskItemChecklist: {},
      });
    });

    it("does not clear taskChecklistItems if industry has not changed", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const newIndustryUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({ industryId: "cannabis" }),
        taskItemChecklist: { "some-id": true },
      });

      stubUserDataClient.get.mockResolvedValue(newIndustryUserData);
      stubUserDataClient.put.mockResolvedValue(newIndustryUserData);

      await request(app)
        .post(`/users`)
        .send(newIndustryUserData)
        .set("Authorization", "Bearer user-123-token");

      expect(stubUserDataClient.put).toHaveBeenCalledWith(newIndustryUserData);
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
  });
});
