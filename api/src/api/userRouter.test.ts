import { userRouterFactory } from "@api/userRouter";
import { CryptoClient, DatabaseClient, TimeStampBusinessSearch } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { createEmptyFormationFormData, emptyAddressData } from "@shared/formationData";
import { LicenseName } from "@shared/license";
import {
  generateBusiness,
  generateBusinessNameAvailability,
  generateFormationData,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateLicenseData,
  generateProfileData,
  generateStartingProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
  generateUserDataForBusiness,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { generateAnnualFilings, getLastCalledWith } from "@test/helpers";
import dayjs from "dayjs";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import request, { type Response } from "supertest";

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

const fiftyNineMinutesAgo: string = getCurrentDate()
  .subtract(1, "hour")
  .add(1, "minute")
  .toISOString();
const sixtyOneMinutesAgo: string = getCurrentDate()
  .subtract(1, "hour")
  .subtract(1, "minute")
  .toISOString();

describe("userRouter", () => {
  let app: Express;

  let stubUnifiedDataClient: jest.Mocked<DatabaseClient>;
  let stubUpdateLicenseStatus: jest.Mock;
  let stubUpdateRoadmapSidebarCards: jest.Mock;
  let stubUpdateOperatingPhase: jest.Mock;
  let stubCryptoEncryptionClient: jest.Mocked<CryptoClient>;
  let stubCryptoHashingClient: jest.Mocked<CryptoClient>;
  let stubTimeStampBusinessSearch: jest.Mocked<TimeStampBusinessSearch>;

  beforeEach(async () => {
    stubUnifiedDataClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
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
    stubCryptoEncryptionClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    stubCryptoHashingClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    stubTimeStampBusinessSearch = {
      search: jest.fn(),
    };
    app = setupExpress(false);
    app.use(
      userRouterFactory(
        stubUnifiedDataClient,
        stubUpdateLicenseStatus,
        stubUpdateRoadmapSidebarCards,
        stubUpdateOperatingPhase,
        stubCryptoEncryptionClient,
        stubCryptoHashingClient,
        stubTimeStampBusinessSearch,
        DummyLogWriter,
      ),
    );
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("GET /users/:userId", () => {
    it("gets user with id", async () => {
      const userData = generateUserData({});
      stubUnifiedDataClient.get.mockResolvedValue(userData);
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app)
        .get(`/users/123`)
        .set("Authorization", "Bearer user-123-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual(userData);
    });

    it("does not return a hashed tax ID to the frontend if present in profileData", async () => {
      const business = generateBusiness({
        profileData: {
          ...generateProfileData({ hashedTaxId: "some-hashed-tax-id" }),
        },
      });
      const userData = generateUserDataForBusiness(business);
      const currentBusiness = userData.businesses[userData.currentBusinessId];
      expect(currentBusiness.profileData.hashedTaxId).not.toBeUndefined();

      stubUnifiedDataClient.get.mockResolvedValue(userData);
      stubUnifiedDataClient.put.mockResolvedValue(generateUserData({}));
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));

      const response = await request(app)
        .get(`/users/123`)
        .set("Authorization", "Bearer user-123-token");

      const profileData = response.body.businesses[userData.currentBusinessId].profileData;
      expect(profileData.hashedTaxId).toBeUndefined();
    });

    it("does not remove a hashed tax ID from profileData in a DB PUT", async () => {
      const business = generateBusiness({
        profileData: {
          ...generateProfileData({ hashedTaxId: "some-hashed-tax-id" }),
        },
      });
      const userData = generateUserDataForBusiness(business);
      const currentBusiness = userData.businesses[userData.currentBusinessId];
      expect(currentBusiness.profileData.hashedTaxId).not.toBeUndefined();

      stubUnifiedDataClient.get.mockResolvedValue(userData);
      stubUnifiedDataClient.put.mockResolvedValue(generateUserData({}));
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));

      await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

      expect(stubUnifiedDataClient.put).toHaveBeenCalledWith(userData);
    });

    it("returns NOT FOUND when a user isn't registered", async () => {
      stubUnifiedDataClient.get.mockImplementation(() => {
        return Promise.reject(new Error("Not found"));
      });
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app)
        .get(`/users/123`)
        .set("Authorization", "Bearer user-123-token");
      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(StatusCodes.NOT_FOUND);
    });

    it("returns a FORBIDDEN when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "other-user-id" }));
      const response = await request(app)
        .get(`/users/123`)
        .set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUnifiedDataClient.get).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.FORBIDDEN);
    });

    it("returns a INTERNAL SERVER ERROR when user get fails", async () => {
      stubUnifiedDataClient.get.mockRejectedValue(new Error("error"));

      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app)
        .get(`/users/123`)
        .set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({ error: "error" });
    });

    describe("updating roadmap cards", () => {
      it("saves user data with updated cards", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123" }),
        });
        const updatedUserData = generateUserData({});
        stubUnifiedDataClient.get.mockResolvedValue(userData);
        stubUnifiedDataClient.put.mockResolvedValue(updatedUserData);
        stubUpdateOperatingPhase.mockReturnValue(updatedUserData);
        stubUpdateRoadmapSidebarCards.mockReturnValue(updatedUserData);
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        const response = await request(app)
          .get(`/users/123`)
          .set("Authorization", "Bearer user-123-token");

        expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual(updatedUserData);
        expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);
        expect(stubUpdateRoadmapSidebarCards).toHaveBeenCalledWith(updatedUserData);
        expect(stubUnifiedDataClient.put).toHaveBeenCalledWith(updatedUserData);
      });
    });

    describe("updating license status", () => {
      beforeEach(async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      });

      it("does not update license if licenseData is undefined and formationFormData address does not exist", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: undefined,
            formationData: {
              ...generateFormationData({
                formationFormData: createEmptyFormationFormData(),
              }),
            },
          }),
        );

        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("does not update license if businessName is empty string and licenses is undefined and has formation address", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: {
              licenses: undefined,
              lastUpdatedISO: sixtyOneMinutesAgo,
            },
            formationData: generateFormationData({
              formationFormData: generateFormationFormData({
                addressLine1: "123 Main Street",
                addressLine2: "Suite 100",
                addressZipCode: "07123",
              }),
            }),
            profileData: generateProfileData({
              businessName: "",
            }),
          }),
        );

        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("does not update license if licenses is undefined and formationFormData address does not exist", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: {
              licenses: undefined,
              lastUpdatedISO: sixtyOneMinutesAgo,
            },
            formationData: {
              ...generateFormationData({
                formationFormData: createEmptyFormationFormData(),
              }),
            },
          }),
        );

        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("updates license if licenseData is undefined and if an address exists in formationFormData and has a business name", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: undefined,
            formationData: generateFormationData({}),
          }),
        );

        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).toHaveBeenCalled();
      });

      it("updates license if licenseData is present and if no address exists in formationFormData", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: generateLicenseData({
              lastUpdatedISO: sixtyOneMinutesAgo,
            }),
            formationData: generateFormationData({
              formationFormData: generateFormationFormData({
                ...emptyAddressData,
              }),
            }),
          }),
        );

        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).toHaveBeenCalled();
      });

      it("queries for license data using name and address from licenseData if present", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: generateLicenseData({
              lastUpdatedISO: sixtyOneMinutesAgo,
            }),
            formationData: generateFormationData({
              formationFormData: generateFormationFormData({
                addressLine1: "123 Main Street",
                addressLine2: "Suite 100",
                addressZipCode: "07123",
              }),
            }),
          }),
        );

        const currentBusiness = getCurrentBusiness(userData);
        const licenses = currentBusiness.licenseData!.licenses;
        const licenseName = Object.keys(licenses!)[0] as LicenseName;
        const licenseNameAndAddress = licenses![licenseName]?.nameAndAddress;

        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).toHaveBeenLastCalledWith(userData, licenseNameAndAddress);
      });

      it("queries for license data using formation address if no licenseData is present", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: undefined,
            formationData: generateFormationData({
              formationFormData: generateFormationFormData({
                addressLine1: "123 Main Street",
                addressLine2: "Suite 100",
                addressZipCode: "07123",
              }),
            }),
          }),
        );

        const currentBusiness = getCurrentBusiness(userData);
        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).toHaveBeenLastCalledWith(userData, {
          name: currentBusiness.profileData.businessName,
          addressLine1: "123 Main Street",
          addressLine2: "Suite 100",
          zipCode: "07123",
        });
      });

      it("does not update license if licenseData lastCheckedDate is within the last hour", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: generateLicenseData({
              lastUpdatedISO: fiftyNineMinutesAgo,
            }),
          }),
        );
        stubUnifiedDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("updates userData with license information if license query returns data", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              industryId: "home-contractor",
            }),
            licenseData: generateLicenseData({
              lastUpdatedISO: sixtyOneMinutesAgo,
            }),
          }),
        );
        stubUnifiedDataClient.get.mockResolvedValue(userData);
        const updatedUserData = generateUserData({});
        stubUpdateLicenseStatus.mockResolvedValue(updatedUserData);

        const result = await request(app)
          .get(`/users/123`)
          .set("Authorization", "Bearer user-123-token");
        const expectedCurrentBusiness = getCurrentBusiness(updatedUserData);
        const resultUserData = result.body as UserData;
        const resultCurrentBusiness = getCurrentBusiness(resultUserData);
        expect(stubUpdateLicenseStatus).toHaveBeenCalled();
        expect(resultCurrentBusiness.licenseData).toEqual(expectedCurrentBusiness.licenseData);
      });

      it("sets licenseData lastUpdatedISO if license check fails", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              industryId: "home-contractor",
            }),
            licenseData: generateLicenseData({
              lastUpdatedISO: sixtyOneMinutesAgo,
            }),
          }),
        );
        stubUnifiedDataClient.get.mockResolvedValue(userData);
        stubUpdateLicenseStatus.mockRejectedValue(new Error("license failure"));

        const result = await request(app)
          .get(`/users/123`)
          .set("Authorization", "Bearer user-123-token");
        expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);

        const initialCurrentBusiness = getCurrentBusiness(userData);
        const updatedUserData = result.body as UserData;
        const currentBusiness = getCurrentBusiness(updatedUserData);
        expect(
          parseDate(currentBusiness.licenseData?.lastUpdatedISO).isSame(getCurrentDate(), "minute"),
        ).toEqual(true);
        expect(currentBusiness.licenseData?.licenses).toEqual(
          initialCurrentBusiness.licenseData?.licenses,
        );
      });
    });

    describe("updating business name search status", () => {
      beforeEach(async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      });

      describe("when businessPersona is 'STARTING'", () => {
        it("does not update business name search if businessNameAvailability is undefined", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateStartingProfileData({}),
              formationData: generateFormationData({ businessNameAvailability: undefined }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("does not update businessNameAvailability if it's lastUpdatedTimeStamp is within the last hour", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateStartingProfileData({}),
              formationData: generateFormationData({
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: fiftyNineMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("does not update businessNameAvailability if it's completedFilingPayment is true", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateStartingProfileData({}),
              formationData: generateFormationData({
                completedFilingPayment: true,
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: fiftyNineMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("updates user in the background if businessNameAvailability lastUpdatedTimeStamp is older than last hour", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateStartingProfileData({}),
              formationData: generateFormationData({
                completedFilingPayment: false,
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            }),
          );

          const result = await request(app)
            .get(`/users/123`)
            .set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual(
            "UNAVAILABLE",
          );
          expect(
            parseDate(
              resultBusiness.formationData.businessNameAvailability?.lastUpdatedTimeStamp,
            ).isSame(getCurrentDate(), "minute"),
          ).toEqual(true);
        });

        it("updates user in the background only if completedFilingPayment is false", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateStartingProfileData({}),
              formationData: generateFormationData({
                completedFilingPayment: false,
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            }),
          );

          const result = await request(app)
            .get(`/users/123`)
            .set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual(
            "UNAVAILABLE",
          );
          expect(
            parseDate(
              resultBusiness.formationData.businessNameAvailability?.lastUpdatedTimeStamp,
            ).isSame(getCurrentDate(), "minute"),
          ).toEqual(true);
        });

        it("does not update userData if the business name search fails and continues with other updates", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateStartingProfileData({}),
              formationData: generateFormationData({
                completedFilingPayment: false,
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockRejectedValue(new Error("message"));

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalledWith(
            getCurrentBusiness(userData).profileData.businessName,
          );
          expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);
        });
      });

      describe("when businessPersona is 'FOREIGN' and Foreign type is Nexus", () => {
        it("does not recheck business name availability if businessNameAvailability and dbaBusinessNameAvailability are undefined", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
              }),
              formationData: generateFormationData({
                businessNameAvailability: undefined,
                dbaBusinessNameAvailability: undefined,
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("does not update dbaBusinessNameAvailability if businessNameAvailability status is not Unavailable", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
              }),
              formationData: generateFormationData({
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                }),
                dbaBusinessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("sets businessNameAvailability status to unavailable", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
              }),
              formationData: generateFormationData({
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            }),
          );

          const result = await request(app)
            .get(`/users/123`)
            .set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual(
            "UNAVAILABLE",
          );
        });

        it("when businessNameAvailability status is not unavailable then businessNameAvailability is updated", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
              }),
              formationData: generateFormationData({
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
                dbaBusinessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            }),
          );

          const result = await request(app)
            .get(`/users/123`)
            .set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual(
            "UNAVAILABLE",
          );
          expect(resultBusiness.formationData.dbaBusinessNameAvailability?.status).toEqual(
            "AVAILABLE",
          );
        });

        it("when businessNameAvailability status is unavailable then dbaBusinessNameAvailability is updated", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
              }),
              formationData: generateFormationData({
                completedFilingPayment: false,
                dbaBusinessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            }),
          );

          const result = await request(app)
            .get(`/users/123`)
            .set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.dbaBusinessNameAvailability?.status).toEqual(
            "AVAILABLE",
          );
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual(
            "UNAVAILABLE",
          );
          expect(
            parseDate(resultBusiness.lastUpdatedISO).isSame(getCurrentDate(), "minute"),
          ).toEqual(true);
        });

        it("updates user in the background if dbaBusinessNameAvailability lastUpdatedTimeStamp is older than last hour", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
              }),
              formationData: generateFormationData({
                completedFilingPayment: false,
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "UNAVAILABLE",
                }),
                dbaBusinessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            }),
          );
          stubUnifiedDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            }),
          );

          const result = await request(app)
            .get(`/users/123`)
            .set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();

          const resultBusiness = getCurrentBusiness(result.body);
          expect(resultBusiness.formationData.dbaBusinessNameAvailability?.status).toEqual(
            "UNAVAILABLE",
          );
          expect(
            parseDate(
              resultBusiness.formationData.dbaBusinessNameAvailability?.lastUpdatedTimeStamp,
            ).isSame(getCurrentDate(), "minute"),
          ).toEqual(true);
        });
      });
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendRequest = async (body: any): Promise<Response> => {
    return request(app).post(`/users/emailCheck`).send(body);
  };

  describe("POST /users/emailCheck", () => {
    it("is called without an email property and return an error", async () => {
      const response = await sendRequest({ notEmail: "user@example.org" });

      expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({ error: "`email` property required." });
    });

    it.each(["User@EXAMPLE.com", "USERNAME@gmail.COM", "MixedCase@COMPANY.com"])(
      "converts email '%s' to lowercase before lookup",
      async (mixedCaseEmail) => {
        await sendRequest({ email: mixedCaseEmail });
        expect(stubUnifiedDataClient.findByEmail).toHaveBeenCalledWith(
          mixedCaseEmail.toLowerCase(),
        );
      },
    );

    it("looks up a user by email that does not exist and returns an error", async () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      stubUnifiedDataClient.findByEmail.mockResolvedValue(undefined);

      const response = await sendRequest({ email: "user@example.org" });

      expect(response.status).toEqual(StatusCodes.NOT_FOUND);
      expect(response.body).toEqual({ email: "user@example.org", found: false });
    });

    it("looks up a user by email that does exist and returns successful", async () => {
      const mockUser = generateUserData({});

      stubUnifiedDataClient.findByEmail.mockResolvedValue(mockUser);

      const response = await sendRequest({ email: mockUser.user.email });

      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual({ email: mockUser.user.email, found: true });
    });
  });

  describe("POST", () => {
    beforeEach(() => {
      stubUnifiedDataClient.get.mockResolvedValue(generateUserData({}));
    });

    it("puts user data", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });
      stubUnifiedDataClient.put.mockResolvedValue(userData);

      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual(userData);
    });

    it("sets current time as lastUpdatedISO", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const dateOneDayAgo = dayjs().subtract(1, "day").toISOString();
      const userData = generateUserData({
        lastUpdatedISO: dateOneDayAgo,
        user: generateUser({ id: "123" }),
      });
      stubUnifiedDataClient.put.mockResolvedValue(userData);

      await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(
        parseDate(getLastCalledWith(stubUnifiedDataClient.put)[0].lastUpdatedISO).isSame(
          getCurrentDate(),
          "minute",
        ),
      ).toEqual(true);
    });

    it("calculates 3 new annual filing dates and updates them for dateOfFormation", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const formationDate = dayjs().subtract(3, "year").add(1, "month").day(1).format("YYYY-MM-DD");

      const postedUserData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({
            dateOfFormation: formationDate,
            entityId: undefined,
            legalStructureId: "limited-liability-company",
          }),
          taxFilingData: generateTaxFilingData({
            filings: [],
          }),
        }),
        { user: generateUser({ id: "123" }) },
      );

      stubUnifiedDataClient.get.mockResolvedValue(postedUserData);
      stubUnifiedDataClient.put.mockResolvedValue(postedUserData);

      await request(app)
        .post(`/users`)
        .send(postedUserData)
        .set("Authorization", "Bearer user-123-token");

      const taxFilingsPut = getCurrentBusiness(getLastCalledWith(stubUnifiedDataClient.put)[0])
        .taxFilingData.filings;
      expect(taxFilingsPut).toEqual(
        generateAnnualFilings([
          getFirstAnnualFiling(formationDate),
          getSecondAnnualFiling(formationDate),
          getThirdAnnualFiling(formationDate),
        ]),
      );
    });

    it("clears taskChecklistItems if industry has changed", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const newIndustryUserData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ industryId: "cannabis" }),
          taskItemChecklist: { "some-id": true },
        }),
        { user: generateUser({ id: "123" }) },
      );

      const updatedIndustryUserData = modifyCurrentBusiness(newIndustryUserData, (business) => ({
        ...business,
        profileData: {
          ...business.profileData,
          industryId: "home-contractor",
        },
      }));

      stubUnifiedDataClient.get.mockResolvedValue(updatedIndustryUserData);
      stubUnifiedDataClient.put.mockResolvedValue(newIndustryUserData);

      await request(app)
        .post(`/users`)
        .send(newIndustryUserData)
        .set("Authorization", "Bearer user-123-token");

      const taskItemChecklistPut = getCurrentBusiness(
        getLastCalledWith(stubUnifiedDataClient.put)[0],
      ).taskItemChecklist;
      expect(taskItemChecklistPut).toEqual({});
    });

    it("does not clear taskChecklistItems if industry has not changed", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const newIndustryUserData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ industryId: "cannabis" }),
          taskItemChecklist: { "some-id": true },
        }),
        { user: generateUser({ id: "123" }) },
      );

      stubUnifiedDataClient.get.mockResolvedValue(newIndustryUserData);
      stubUnifiedDataClient.put.mockResolvedValue(newIndustryUserData);

      await request(app)
        .post(`/users`)
        .send(newIndustryUserData)
        .set("Authorization", "Bearer user-123-token");

      const taskItemChecklistPut = getCurrentBusiness(
        getLastCalledWith(stubUnifiedDataClient.put)[0],
      ).taskItemChecklist;
      expect(taskItemChecklistPut).toEqual({ "some-id": true });
    });

    it("returns FORBIDDEN when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "other-user-id" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUnifiedDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.FORBIDDEN);
    });

    it("returns INTERNAL SERVER ERROR when user put fails", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      stubUnifiedDataClient.put.mockRejectedValue(new Error("error"));
      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
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

        const newLegalStructureUserData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({ legalStructureId: "c-corporation" }),
            formationData: completedFormationData,
          }),
          { user: generateUser({ id: "123" }) },
        );

        const updatedLegalStructureUserData = modifyCurrentBusiness(
          newLegalStructureUserData,
          (business) => ({
            ...business,
            profileData: {
              ...business.profileData,
              legalStructureId: "limited-liability-company",
            },
          }),
        );

        stubUnifiedDataClient.get.mockResolvedValue(updatedLegalStructureUserData);
        stubUnifiedDataClient.put.mockResolvedValue(updatedLegalStructureUserData);

        await request(app)
          .post(`/users`)
          .send(newLegalStructureUserData)
          .set("Authorization", "Bearer user-123-token");

        const formationDataPut = getCurrentBusiness(
          getLastCalledWith(stubUnifiedDataClient.put)[0],
        ).formationData;
        const legalStructurePut = getCurrentBusiness(
          getLastCalledWith(stubUnifiedDataClient.put)[0],
        ).profileData.legalStructureId;

        expect(legalStructurePut).toEqual("limited-liability-company");
        expect(formationDataPut).toEqual(completedFormationData);
      });

      it("allows changing the legal structure (and clears formationData while preserving address) if formation is not completed", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));

        const existingUserData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateStartingProfileData({
              legalStructureId: "limited-liability-company",
            }),
            formationData: generateFormationData({
              formationResponse: generateFormationSubmitResponse({}),
              getFilingResponse: generateGetFilingResponse({ success: false }),
              formationFormData: {
                ...createEmptyFormationFormData(),
                addressLine1: "123 Testing Way",
                addressLine2: "Test Suite",
                addressMunicipality: {
                  displayName: "Newark Display Name",
                  name: "Newark",
                  county: "",
                  id: "",
                },
                addressZipCode: "07781",
              },
            }),
          }),
          { user: generateUser({ id: "123" }) },
        );

        stubUnifiedDataClient.get.mockResolvedValue(existingUserData);

        const newUserData = modifyCurrentBusiness(existingUserData, (business) => ({
          ...business,
          profileData: {
            ...business.profileData,
            legalStructureId: "c-corporation",
          },
        }));

        stubUnifiedDataClient.put.mockResolvedValue(newUserData);

        const response = await request(app)
          .post(`/users`)
          .send(newUserData)
          .set("Authorization", "Bearer user-123-token");

        expect(getCurrentBusiness(response.body).profileData.legalStructureId).toEqual(
          "c-corporation",
        );
        const formationDataPut = getCurrentBusiness(
          getLastCalledWith(stubUnifiedDataClient.put)[0],
        ).formationData;
        const legalStructurePut = getCurrentBusiness(
          getLastCalledWith(stubUnifiedDataClient.put)[0],
        ).profileData.legalStructureId;
        expect(legalStructurePut).toEqual("c-corporation");
        expect(formationDataPut).toEqual({
          formationFormData: {
            ...createEmptyFormationFormData(),
            addressLine1: "123 Testing Way",
            addressLine2: "Test Suite",
            addressMunicipality: {
              displayName: "Newark Display Name",
              name: "Newark",
              county: "",
              id: "",
            },
            addressZipCode: "07781",
          },
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
          lastVisitedPageIndex: 0,
        });
      });
    });

    describe("when user changes Tax ID and Tax PIN", () => {
      it("encrypts and masks the tax id and tax pin before getting put into the user data client", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubCryptoEncryptionClient.encryptValue.mockImplementation((valueToBeEncrypted: string) => {
          const encryptedValues: { [key: string]: string } = {
            "123456789000": "encrypted-tax-id",
            "1234": "encrypted-tax-pin",
          };
          return Promise.resolve(encryptedValues[valueToBeEncrypted] ?? "unexpected value");
        });

        const oldUserData = generateUserData({
          user: generateUser({ id: "123" }),
        });

        const updatedUserData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              ...getCurrentBusiness(oldUserData).profileData,
              taxId: "123456789000",
              encryptedTaxId: undefined,
              taxPin: "1234",
              encryptedTaxPin: undefined,
            }),
          }),
          { user: oldUserData.user },
        );

        stubUnifiedDataClient.get.mockResolvedValue(oldUserData);
        stubUnifiedDataClient.put.mockResolvedValue(updatedUserData);

        await request(app)
          .post(`/users`)
          .send(updatedUserData)
          .set("Authorization", "Bearer user-123-token");

        const profileDataPut = getCurrentBusiness(
          getLastCalledWith(stubUnifiedDataClient.put)[0],
        ).profileData;
        expect(profileDataPut).toEqual({
          ...getCurrentBusiness(updatedUserData).profileData,
          taxId: "*******89000",
          encryptedTaxId: "encrypted-tax-id",
          taxPin: "****",
          encryptedTaxPin: "encrypted-tax-pin",
        });
      });
    });
  });
});
