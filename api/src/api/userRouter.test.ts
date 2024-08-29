/* eslint-disable jest/no-commented-out-tests */

import { userRouterFactory } from "@api/userRouter";
import { EncryptionDecryptionClient, TimeStampBusinessSearch, UserDataClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
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
  generateTaxFilingData,
  generateUser,
  generateUserData,
  generateUserDataForBusiness,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
  modifyCurrentBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { generateAnnualFilings, getLastCalledWith } from "@test/helpers";
import dayjs from "dayjs";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
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

const fiftyNineMinutesAgo: string = getCurrentDate().subtract(1, "hour").add(1, "minute").toISOString();
const sixtyOneMinutesAgo: string = getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString();

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
      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual(userData);
    });

    it("returns NOT FOUND when a user isn't registered", async () => {
      stubUserDataClient.get.mockImplementation(() => {
        return Promise.reject(new Error("Not found"));
      });
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(StatusCodes.NOT_FOUND);
    });

    it("returns a FORBIDDEN when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "other-user-id" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUserDataClient.get).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.FORBIDDEN);
    });

    it("returns a INTERNAL SERVER ERROR when user get fails", async () => {
      stubUserDataClient.get.mockRejectedValue(new Error("error"));

      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
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
        expect(response.status).toEqual(StatusCodes.OK);
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

      it("does not update license if licenseData is undefined and formationFormData address does not exist", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: undefined,
            formationData: {
              ...generateFormationData({
                formationFormData: createEmptyFormationFormData(),
              }),
            },
          })
        );

        stubUserDataClient.get.mockResolvedValue(userData);

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
          })
        );

        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateLicenseStatus).not.toHaveBeenCalled();
      });

      it("updates license if licenseData is undefined and if an address exists in formationFormData", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            licenseData: undefined,
            formationData: generateFormationData({}),
          })
        );

        stubUserDataClient.get.mockResolvedValue(userData);

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
          })
        );

        stubUserDataClient.get.mockResolvedValue(userData);

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
          })
        );

        const currentBusiness = getCurrentBusiness(userData);
        const licenses = currentBusiness.licenseData!.licenses;
        const licenseName = Object.keys(licenses!)[0] as LicenseName;
        const licenseNameAndAddress = licenses![licenseName]?.nameAndAddress;

        stubUserDataClient.get.mockResolvedValue(userData);

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
          })
        );

        const currentBusiness = getCurrentBusiness(userData);
        stubUserDataClient.get.mockResolvedValue(userData);

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
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);

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
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);
        const updatedUserData = generateUserData({});
        stubUpdateLicenseStatus.mockResolvedValue(updatedUserData);

        const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        const expectedCurrentBusiness = getCurrentBusiness(updatedUserData);
        const resultUserData = result.body as UserData;
        const resultCurrentBuseinss = getCurrentBusiness(resultUserData);

        expect(stubUpdateLicenseStatus).toHaveBeenCalled();
        expect(resultCurrentBuseinss.licenseData).toEqual(expectedCurrentBusiness.licenseData);
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
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);
        stubUpdateLicenseStatus.mockRejectedValue(new Error("license failure"));

        const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);

        const initialCurrentBusiness = getCurrentBusiness(userData);
        const updatedUserData = result.body as UserData;
        const currentBusiness = getCurrentBusiness(updatedUserData);
        expect(
          parseDate(currentBusiness.licenseData?.lastUpdatedISO).isSame(getCurrentDate(), "minute")
        ).toEqual(true);
        expect(currentBusiness.licenseData?.licenses).toEqual(initialCurrentBusiness.licenseData?.licenses);
      });
    });

    describe("updating business name search status", () => {
      beforeEach(async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      });

      it("does not update business name search if businessNameAvailability is undefined", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            formationData: generateFormationData({ businessNameAvailability: undefined }),
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
      });

      it("does not update businessNameAvailability if it's lastUpdatedTimeStamp is within the last hour", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            formationData: generateFormationData({
              businessNameAvailability: generateBusinessNameAvailability({
                status: "AVAILABLE",
                lastUpdatedTimeStamp: fiftyNineMinutesAgo,
              }),
            }),
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
      });

      it("does not update businessNameAvailability if it's completedFilingPayment is true", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            formationData: generateFormationData({
              completedFilingPayment: true,
              businessNameAvailability: generateBusinessNameAvailability({
                status: "AVAILABLE",
                lastUpdatedTimeStamp: fiftyNineMinutesAgo,
              }),
            }),
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
      });

      it("updates user in the background if businessNameAvailability lastUpdatedTimeStamp is older than last hour", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            formationData: generateFormationData({
              completedFilingPayment: false,
              businessNameAvailability: generateBusinessNameAvailability({
                status: "AVAILABLE",
                lastUpdatedTimeStamp: sixtyOneMinutesAgo,
              }),
            }),
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);
        stubTimeStampBusinessSearch.search.mockResolvedValue(
          generateBusinessNameAvailability({
            status: "UNAVAILABLE",
            similarNames: ["random-name"],
          })
        );

        const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        const resultBusiness = getCurrentBusiness(result.body as UserData);
        expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
        expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual("UNAVAILABLE");
        expect(resultBusiness.profileData.needsNexusDbaName).toEqual(false);
        expect(
          parseDate(resultBusiness.formationData.businessNameAvailability?.lastUpdatedTimeStamp).isSame(
            getCurrentDate(),
            "minute"
          )
        ).toEqual(true);
      });

      it("updates user in the background only if completedFilingPayment is false", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            formationData: generateFormationData({
              completedFilingPayment: false,
              businessNameAvailability: generateBusinessNameAvailability({
                status: "AVAILABLE",
                lastUpdatedTimeStamp: sixtyOneMinutesAgo,
              }),
            }),
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);
        stubTimeStampBusinessSearch.search.mockResolvedValue(
          generateBusinessNameAvailability({
            status: "UNAVAILABLE",
            similarNames: ["random-name"],
          })
        );

        const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        const resultBusiness = getCurrentBusiness(result.body as UserData);
        expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
        expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual("UNAVAILABLE");
        expect(resultBusiness.profileData.needsNexusDbaName).toEqual(false);
        expect(
          parseDate(resultBusiness.formationData.businessNameAvailability?.lastUpdatedTimeStamp).isSame(
            getCurrentDate(),
            "minute"
          )
        ).toEqual(true);
      });

      it("does not update userData if the business name search fails and continues with other updates", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            formationData: generateFormationData({
              completedFilingPayment: false,
              businessNameAvailability: generateBusinessNameAvailability({
                status: "AVAILABLE",
                lastUpdatedTimeStamp: sixtyOneMinutesAgo,
              }),
            }),
          })
        );
        stubUserDataClient.get.mockResolvedValue(userData);
        stubTimeStampBusinessSearch.search.mockRejectedValue(new Error("message"));

        await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
        expect(stubTimeStampBusinessSearch.search).toHaveBeenCalledWith(
          getCurrentBusiness(userData).profileData.businessName
        );
        expect(stubUpdateOperatingPhase).toHaveBeenCalledWith(userData);
      });

      describe("when businessPersona is 'FOREIGN'", () => {
        it("does not recheck business name availability if businessNameAvailability and dbaBusinessNameAvailability are undefined", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                needsNexusDbaName: true,
              }),
              formationData: generateFormationData({
                businessNameAvailability: undefined,
                dbaBusinessNameAvailability: undefined,
              }),
            })
          );
          stubUserDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("does not update dbaBusinessNameAvailability if needsNexusDbaName is false", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                needsNexusDbaName: false,
              }),
              formationData: generateFormationData({
                dbaBusinessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            })
          );
          stubUserDataClient.get.mockResolvedValue(userData);

          await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).not.toHaveBeenCalled();
        });

        it("sets needsNexusDbaName to true when business name becomes unavailable", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                needsNexusDbaName: false,
              }),
              formationData: generateFormationData({
                businessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            })
          );
          stubUserDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            })
          );

          const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual("UNAVAILABLE");
          expect(resultBusiness.profileData.needsNexusDbaName).toEqual(true);
        });

        it("when needsNexusDbaName is false only businessNameAvailability is updated", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                needsNexusDbaName: false,
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
            })
          );
          stubUserDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            })
          );

          const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual("UNAVAILABLE");
          expect(resultBusiness.formationData.dbaBusinessNameAvailability?.status).toEqual("AVAILABLE");
          expect(resultBusiness.profileData.needsNexusDbaName).toEqual(true);
        });

        it("when needsNexusDbaName is true only dbaBusinessNameAvailability is updated", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                needsNexusDbaName: true,
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
            })
          );
          stubUserDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            })
          );

          const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          const resultBusiness = getCurrentBusiness(result.body as UserData);
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();
          expect(resultBusiness.formationData.dbaBusinessNameAvailability?.status).toEqual("UNAVAILABLE");
          expect(resultBusiness.formationData.businessNameAvailability?.status).toEqual("AVAILABLE");
          expect(parseDate(resultBusiness.lastUpdatedISO).isSame(getCurrentDate(), "minute")).toEqual(true);
        });

        it("updates user in the background if dbaBusinessNameAvailability lastUpdatedTimeStamp is older than last hour", async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                businessPersona: "FOREIGN",
                needsNexusDbaName: true,
              }),
              formationData: generateFormationData({
                completedFilingPayment: false,
                dbaBusinessNameAvailability: generateBusinessNameAvailability({
                  status: "AVAILABLE",
                  lastUpdatedTimeStamp: sixtyOneMinutesAgo,
                }),
              }),
            })
          );
          stubUserDataClient.get.mockResolvedValue(userData);
          stubTimeStampBusinessSearch.search.mockResolvedValue(
            generateBusinessNameAvailability({
              status: "UNAVAILABLE",
              similarNames: ["random-name"],
            })
          );

          const result = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");
          expect(stubTimeStampBusinessSearch.search).toHaveBeenCalled();

          const resultBusiness = getCurrentBusiness(result.body);
          expect(resultBusiness.formationData.dbaBusinessNameAvailability?.status).toEqual("UNAVAILABLE");
          expect(
            parseDate(resultBusiness.formationData.dbaBusinessNameAvailability?.lastUpdatedTimeStamp).isSame(
              getCurrentDate(),
              "minute"
            )
          ).toEqual(true);
        });
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
        { user: generateUser({ id: "123" }) }
      );

      stubUserDataClient.get.mockResolvedValue(postedUserData);
      stubUserDataClient.put.mockResolvedValue(postedUserData);

      await request(app).post(`/users`).send(postedUserData).set("Authorization", "Bearer user-123-token");

      const taxFilingsPut = getCurrentBusiness(getLastCalledWith(stubUserDataClient.put)[0]).taxFilingData
        .filings;
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
      const newIndustryUserData = generateUserDataForBusiness(
        generateBusiness({
          profileData: generateProfileData({ industryId: "cannabis" }),
          taskItemChecklist: { "some-id": true },
        }),
        { user: generateUser({ id: "123" }) }
      );

      const updatedIndustryUserData = modifyCurrentBusiness(newIndustryUserData, (business) => ({
        ...business,
        profileData: {
          ...business.profileData,
          industryId: "home-contractor",
        },
      }));

      stubUserDataClient.get.mockResolvedValue(updatedIndustryUserData);
      stubUserDataClient.put.mockResolvedValue(newIndustryUserData);

      await request(app)
        .post(`/users`)
        .send(newIndustryUserData)
        .set("Authorization", "Bearer user-123-token");

      const taskItemChecklistPut = getCurrentBusiness(
        getLastCalledWith(stubUserDataClient.put)[0]
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
        { user: generateUser({ id: "123" }) }
      );

      stubUserDataClient.get.mockResolvedValue(newIndustryUserData);
      stubUserDataClient.put.mockResolvedValue(newIndustryUserData);

      await request(app)
        .post(`/users`)
        .send(newIndustryUserData)
        .set("Authorization", "Bearer user-123-token");

      const taskItemChecklistPut = getCurrentBusiness(
        getLastCalledWith(stubUserDataClient.put)[0]
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
      expect(stubUserDataClient.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.FORBIDDEN);
    });

    it("returns INTERNAL SERVER ERROR when user put fails", async () => {
      mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      stubUserDataClient.put.mockRejectedValue(new Error("error"));
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
          { user: generateUser({ id: "123" }) }
        );

        const updatedLegalStructureUserData = modifyCurrentBusiness(
          newLegalStructureUserData,
          (business) => ({
            ...business,
            profileData: {
              ...business.profileData,
              legalStructureId: "limited-liability-company",
            },
          })
        );

        stubUserDataClient.get.mockResolvedValue(updatedLegalStructureUserData);
        stubUserDataClient.put.mockResolvedValue(updatedLegalStructureUserData);

        await request(app)
          .post(`/users`)
          .send(newLegalStructureUserData)
          .set("Authorization", "Bearer user-123-token");

        const formationDataPut = getCurrentBusiness(
          getLastCalledWith(stubUserDataClient.put)[0]
        ).formationData;
        const legalStructurePut = getCurrentBusiness(getLastCalledWith(stubUserDataClient.put)[0]).profileData
          .legalStructureId;

        expect(legalStructurePut).toEqual("limited-liability-company");
        expect(formationDataPut).toEqual(completedFormationData);
      });

      it("allows changing the legal structure (and clears formationData while preserving address) if formation is not completed", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));

        const existingUserData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({ legalStructureId: "limited-liability-company" }),
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
          { user: generateUser({ id: "123" }) }
        );

        stubUserDataClient.get.mockResolvedValue(existingUserData);

        const newUserData = modifyCurrentBusiness(existingUserData, (business) => ({
          ...business,
          profileData: {
            ...business.profileData,
            legalStructureId: "c-corporation",
          },
        }));

        stubUserDataClient.put.mockResolvedValue(newUserData);

        const response = await request(app)
          .post(`/users`)
          .send(newUserData)
          .set("Authorization", "Bearer user-123-token");

        expect(getCurrentBusiness(response.body).profileData.legalStructureId).toEqual("c-corporation");
        const formationDataPut = getCurrentBusiness(
          getLastCalledWith(stubUserDataClient.put)[0]
        ).formationData;
        const legalStructurePut = getCurrentBusiness(getLastCalledWith(stubUserDataClient.put)[0]).profileData
          .legalStructureId;
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

    describe("when user changes Tax ID", () => {
      it("encrypts and masks the tax id before getting put into the user data client", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));
        stubEncryptionDecryptionClient.encryptValue.mockResolvedValue("my cool encrypted value");

        const oldUserData = generateUserData({
          user: generateUser({ id: "123" }),
        });

        const updatedUserData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              ...getCurrentBusiness(oldUserData).profileData,
              taxId: "123456789123",
              encryptedTaxId: undefined,
            }),
          }),
          { user: oldUserData.user }
        );

        stubUserDataClient.get.mockResolvedValue(oldUserData);
        stubUserDataClient.put.mockResolvedValue(updatedUserData);

        await request(app).post(`/users`).send(updatedUserData).set("Authorization", "Bearer user-123-token");

        const profileDataPut = getCurrentBusiness(getLastCalledWith(stubUserDataClient.put)[0]).profileData;
        expect(profileDataPut).toEqual({
          ...getCurrentBusiness(updatedUserData).profileData,
          taxId: "*******89123",
          encryptedTaxId: "my cool encrypted value",
        });
      });

      it("doesn't encrypt tax id if the same masked value as before is being posted", async () => {
        mockJwt.decode.mockReturnValue(cognitoPayload({ id: "123" }));

        const oldUserData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              taxId: "*******89123",
            }),
          }),
          { user: generateUser({ id: "123" }) }
        );

        const updatedUserData = modifyCurrentBusiness(oldUserData, (business) => ({
          ...business,
          profileData: {
            ...business.profileData,
            taxId: "*******89123",
          },
        }));

        stubUserDataClient.get.mockResolvedValue(oldUserData);
        stubUserDataClient.put.mockResolvedValue(updatedUserData);

        await request(app).post(`/users`).send(updatedUserData).set("Authorization", "Bearer user-123-token");

        expect(stubEncryptionDecryptionClient.encryptValue).toHaveBeenCalledTimes(0);
      });
    });
  });
});
