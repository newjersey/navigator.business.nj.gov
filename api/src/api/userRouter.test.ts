import { getCurrentDate } from "@shared/dateHelpers";
import { createEmptyFormationFormData } from "@shared/formationData";
import { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import {
  generateFormationData,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateLicenseData,
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "../../test/factories";
import { determineAnnualFilingDate } from "../../test/helpers";
import { UserDataClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { userRouterFactory } from "./userRouter";

jest.mock("jsonwebtoken", () => {
  return {
    decode: jest.fn(),
  };
});
const mockJwt = jwt as jest.Mocked<typeof jwt>;

const cognitoPayload = ({ id }: { id: string }) => {
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

describe("userRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubUpdateLicenseStatus: jest.Mock;
  let stubUpdateRoadmapSidebarCards: jest.Mock;
  let stubUpdateOperatingPhase: jest.Mock;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubUpdateLicenseStatus = jest.fn();
    stubUpdateRoadmapSidebarCards = jest.fn();
    stubUpdateRoadmapSidebarCards.mockImplementation((userData) => {
      return userData;
    });
    stubUpdateOperatingPhase = jest.fn();
    stubUpdateOperatingPhase.mockImplementation((userData) => {
      return userData;
    });

    app = setupExpress(false);
    app.use(
      userRouterFactory(
        stubUserDataClient,
        stubUpdateLicenseStatus,
        stubUpdateRoadmapSidebarCards,
        stubUpdateOperatingPhase
      )
    );
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
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
      stubUserDataClient.get.mockImplementation(() => {
        return Promise.reject("Not found");
      });
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

    describe("updating roadmap cards", () => {
      it("saves user data with updated cards", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123" }),
        });
        const updatedUserData = generateUserData({});
        stubUserDataClient.get.mockResolvedValue(userData);
        stubUserDataClient.put.mockResolvedValue(updatedUserData);
        stubUpdateOperatingPhase.mockReturnValue(updatedUserData);
        stubUpdateRoadmapSidebarCards.mockReturnValue(updatedUserData);
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

        expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(updatedUserData);
        expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);
        expect(stubUpdateRoadmapSidebarCards).toHaveBeenCalledWith(updatedUserData);
        expect(stubUserDataClient.put).toHaveBeenCalledWith(updatedUserData);
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
        taxFilingData: generateTaxFilingData({
          filings: [],
        }),
      });

      stubUserDataClient.get.mockResolvedValue(postedUserData);
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

    describe("legal structure changes", () => {
      it("does not change the legal structure if formation is completed", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const formationData = generateFormationData({});
        const updatedFormationData = {
          ...formationData,
          getFilingResponse: generateGetFilingResponse({ success: true }),
        };
        const newLegalStructureUserData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({ legalStructureId: "c-corporation" }),
          formationData: updatedFormationData,
        });

        const existingProfileData = {
          ...newLegalStructureUserData,
          profileData: {
            ...newLegalStructureUserData.profileData,
            legalStructureId: "limited-liability-company",
          },
        };

        stubUserDataClient.get.mockResolvedValue(existingProfileData);
        stubUserDataClient.put.mockResolvedValue(newLegalStructureUserData);

        await request(app)
          .post(`/users`)
          .send(newLegalStructureUserData)
          .set("Authorization", "Bearer user-123-token");

        expect(stubUserDataClient.put).toHaveBeenCalledWith({
          ...existingProfileData,
        });
      });

      it("changes the legal structure if formation is not completed", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));

        const existingUserData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({ legalStructureId: "limited-liability-company" }),
          formationData: generateFormationData({
            formationResponse: generateFormationSubmitResponse({}),
            getFilingResponse: generateGetFilingResponse({ success: false }),
          }),
        });

        stubUserDataClient.get.mockResolvedValue(existingUserData);

        const newUserData = {
          ...existingUserData,
          profileData: {
            ...existingUserData.profileData,
            legalStructureId: "c-corporation",
          },
        };

        stubUserDataClient.put.mockResolvedValue(newUserData);

        const response = await request(app)
          .post(`/users`)
          .send(newUserData)
          .set("Authorization", "Bearer user-123-token");

        expect(response.body.profileData.legalStructureId).toBe("c-corporation");
        expect(stubUserDataClient.put).toHaveBeenCalledWith({
          ...newUserData,
          formationData: {
            formationFormData: createEmptyFormationFormData(),
            formationResponse: undefined,
            getFilingResponse: undefined,
            completedFilingPayment: false,
          },
        });
      });
    });
  });
});
