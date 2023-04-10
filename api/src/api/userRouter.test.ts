import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { createEmptyFormationFormData } from "@shared/formationData";
import {
  generateBusinessNameAvailability,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
} from "@shared/test";
import dayjs from "dayjs";
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
import { generateAnnualFilings, getLastCalledWith } from "../../test/helpers";
import { EncryptionDecryptionClient, TimeStampBusinessSearch, UserDataClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { userRouterFactory } from "./userRouter";

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

describe("userRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubUpdateLicenseStatus: jest.Mock;
  let stubUpdateRoadmapSidebarCards: jest.Mock;
  let stubUpdateOperatingPhase: jest.Mock;
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;
  let stubTimeStampBusinessSearch: jest.Mocked<TimeStampBusinessSearch>;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
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
    stubEncryptionDecryptionClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
    };
    stubTimeStampBusinessSearch = {
      search: jest.fn(),
    };
    app = setupExpress(false);
    app.use(
      userRouterFactory(
        stubUserDataClient,
        stubUpdateLicenseStatus,
        stubUpdateRoadmapSidebarCards,
        stubUpdateOperatingPhase,
        stubEncryptionDecryptionClient,
        stubTimeStampBusinessSearch
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
            lastUpdatedISO: getCurrentDate().subtract(1, "hour").add(1, "minute").toISOString(),
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
            lastUpdatedISO: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
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

    describe("updating business name search status", () => {
      beforeEach(async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      });

      it("does not update business name search if businessNameAvailability is undefined", async () => {
        const userData = generateUserData({
          formationData: generateFormationData({ businessNameAvailability: undefined }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
      });

      it("does not update businessNameAvailability if it's lastUpdatedTimeStamp is within the last hour", async () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            businessNameAvailability: generateBusinessNameAvailability({
              status: "AVAILABLE",
              lastUpdatedTimeStamp: getCurrentDate().subtract(1, "hour").add(1, "minute").toISOString(),
            }),
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
      });

      it("updates user in the background if businessNameAvailability lastUpdatedTimeStamp is older than last hour", async () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            businessNameAvailability: generateBusinessNameAvailability({
              status: "AVAILABLE",
              lastUpdatedTimeStamp: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
            }),
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);
        stubTimeStampBusinessSearch.search.mockResolvedValue(
          generateBusinessNameAvailability({
            status: "UNAVAILABLE",
            similarNames: ["random-name"],
          })
        );

        const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
        expect(result.body.formationData.businessNameAvailability.status).toEqual("UNAVAILABLE");
        expect(
          parseDate(result.body.formationData.lastUpdatedTimeStamp).isSame(getCurrentDate(), "minute")
        ).toEqual(true);
      });

      it("does not update userData if the business name search fails and continues with other updates", async () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            businessNameAvailability: generateBusinessNameAvailability({
              status: "AVAILABLE",
              lastUpdatedTimeStamp: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
            }),
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);
        stubTimeStampBusinessSearch.search.mockRejectedValue({});

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).toHaveBeenCalledWith(userData.profileData.businessName);
        expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);
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

    it("sets current time as lastUpdatedISO", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const dateOneDayAgo = dayjs().subtract(1, "day").toISOString();
      const userData = generateUserData({ lastUpdatedISO: dateOneDayAgo, user: generateUser({ id: "123" }) });
      stubUserDataClient.put.mockResolvedValue(userData);

      await request(app).post(`/users`).send(userData).set("Authorization", "Bearer user-123-token");

      expect(
        parseDate(getLastCalledWith(stubUserDataClient.put)[0].lastUpdatedISO).isSame(
          getCurrentDate(),
          "minute"
        )
      ).toEqual(true);
    });

    it("calculates 3 new annual filing dates and updates them for dateOfFormation", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const formationDate = "2021-03-01";

      const postedUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({
          dateOfFormation: formationDate,
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

      const taxFilingsPut = getLastCalledWith(stubUserDataClient.put)[0].taxFilingData.filings;
      expect(taxFilingsPut).toEqual(
        generateAnnualFilings([
          getFirstAnnualFiling(formationDate),
          getSecondAnnualFiling(formationDate),
          getThirdAnnualFiling(formationDate),
        ])
      );
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

      const taskItemChecklistPut = getLastCalledWith(stubUserDataClient.put)[0].taskItemChecklist;
      expect(taskItemChecklistPut).toEqual({});
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

      const taskItemChecklistPut = getLastCalledWith(stubUserDataClient.put)[0].taskItemChecklist;
      expect(taskItemChecklistPut).toEqual({ "some-id": true });
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
      it("does not allow changing the legal structure if formation is completed", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const formationData = generateFormationData({});
        const completedFormationData = {
          ...formationData,
          getFilingResponse: generateGetFilingResponse({ success: true }),
        };

        const newLegalStructureUserData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({ legalStructureId: "c-corporation" }),
          formationData: completedFormationData,
        });

        const existingProfileData = {
          ...newLegalStructureUserData,
          profileData: {
            ...newLegalStructureUserData.profileData,
            legalStructureId: "limited-liability-company",
          },
        };

        stubUserDataClient.get.mockResolvedValue(existingProfileData);
        stubUserDataClient.put.mockResolvedValue(existingProfileData);

        await request(app)
          .post(`/users`)
          .send(newLegalStructureUserData)
          .set("Authorization", "Bearer user-123-token");

        const formationDataPut = getLastCalledWith(stubUserDataClient.put)[0].formationData;
        const legalStructurePut = getLastCalledWith(stubUserDataClient.put)[0].profileData.legalStructureId;

        expect(legalStructurePut).toEqual("limited-liability-company");
        expect(formationDataPut).toEqual(completedFormationData);
      });

      it("allows changing the legal structure (and clears formationData) if formation is not completed", async () => {
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

        expect(response.body.profileData.legalStructureId).toEqual("c-corporation");
        const formationDataPut = getLastCalledWith(stubUserDataClient.put)[0].formationData;
        const legalStructurePut = getLastCalledWith(stubUserDataClient.put)[0].profileData.legalStructureId;
        expect(legalStructurePut).toEqual("c-corporation");
        expect(formationDataPut).toEqual({
          formationFormData: createEmptyFormationFormData(),
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
        });
      });
    });

    describe("when user changes Tax ID", () => {
      it("encrypts and masks the tax id before getting put into the user data client", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubEncryptionDecryptionClient.encryptValue.mockResolvedValue("my cool encrypted value");

        const oldUserData = generateUserData({
          user: generateUser({ id: "123" }),
        });

        const updatedUserData = generateUserData({
          ...oldUserData,
          profileData: generateProfileData({
            ...oldUserData.profileData,
            taxId: "123456789123",
            encryptedTaxId: undefined,
          }),
        });

        stubUserDataClient.get.mockResolvedValue(oldUserData);
        stubUserDataClient.put.mockResolvedValue(updatedUserData);

        await request(app).post(`/users`).send(updatedUserData).set("Authorization", "Bearer user-123-token");

        const profileDataPut = getLastCalledWith(stubUserDataClient.put)[0].profileData;
        expect(profileDataPut).toEqual({
          ...updatedUserData.profileData,
          taxId: "*******89123",
          encryptedTaxId: "my cool encrypted value",
        });
      });

      it("doesn't encrypt tax id if the same masked value as before is being posted", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const oldUserData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({
            taxId: "*******89123",
          }),
        });
        const updatedUserData = generateUserData({
          ...oldUserData,
          profileData: generateProfileData({
            ...oldUserData.profileData,
            taxId: "*******89123",
          }),
        });
        stubUserDataClient.get.mockResolvedValue(oldUserData);
        stubUserDataClient.put.mockResolvedValue(updatedUserData);

        await request(app).post(`/users`).send(updatedUserData).set("Authorization", "Bearer user-123-token");

        expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledTimes(0);
      });
    });
  });
});
