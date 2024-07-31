import { NO_MAIN_APPS_ERROR, NO_MATCH_ERROR, UpdateLicenseStatus } from "@domain/types";
import { updateLicenseStatusFactory } from "@domain/user/updateLicenseStatusFactory";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import {
  generateBusiness,
  generateLicenseData,
  generateLicenseSearchNameAndAddress,
  generateLicenseStatusItem,
  generateLicenseStatusResult,
  generateProfileData,
  generateUserDataForBusiness,
  modifyCurrentBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";

describe("updateLicenseStatus", () => {
  let updateLicenseStatus: UpdateLicenseStatus;

  let stubSearchLicenseStatusFactory: jest.Mock;
  let stubSearchLicenseStatus: jest.Mock;
  let userData: UserData;
  const nameAndAddress = generateLicenseSearchNameAndAddress({});

  beforeEach(async () => {
    jest.resetAllMocks();
    stubSearchLicenseStatus = jest.fn();
    stubSearchLicenseStatusFactory = jest.fn();
    updateLicenseStatus = updateLicenseStatusFactory(stubSearchLicenseStatusFactory);
    stubSearchLicenseStatusFactory.mockImplementation(() => stubSearchLicenseStatus);
    userData = generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          industryId: "home-contractor",
        }),
        licenseData: generateLicenseData({
          lastUpdatedISO: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
        }),
      })
    );
  });

  it("searches for license status with criteria and license type", async () => {
    stubSearchLicenseStatus.mockResolvedValue(generateLicenseStatusResult({}));
    await updateLicenseStatus(userData, nameAndAddress);
    expect(stubSearchLicenseStatus).toHaveBeenCalledWith(
      {
        name: nameAndAddress.name,
        addressLine1: nameAndAddress.addressLine1,
        addressLine2: nameAndAddress.addressLine2,
        zipCode: nameAndAddress.zipCode,
      },
      "Home Improvement Contractors"
    );
  });

  it("updates the user license data based on the search results", async () => {
    const checklistItems = [generateLicenseStatusItem({})];
    stubSearchLicenseStatus.mockResolvedValue({
      status: "ACTIVE",
      expirationISO: "2020-01-01T00:00:00.000Z",
      checklistItems: checklistItems,
    });

    userData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      licenseData: generateLicenseData({
        expirationISO: getCurrentDate().add(1, "year").subtract(1, "minute").toISOString(),
      }),
    }));

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.licenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultCurrentBusiness.licenseData?.completedSearch).toEqual(true);
    expect(resultCurrentBusiness.licenseData?.expirationISO).toEqual("2020-01-01T00:00:00.000Z");
    expect(
      parseDate(resultCurrentBusiness.licenseData?.lastUpdatedISO as string).isSame(
        getCurrentDate(),
        "minute"
      )
    ).toEqual(true);
    expect(resultCurrentBusiness.licenseData?.status).toEqual("ACTIVE");
    expect(resultCurrentBusiness.licenseData?.items).toEqual(checklistItems);
  });

  it.each([NO_MATCH_ERROR, NO_MAIN_APPS_ERROR])(
    "updates the license task status to NOT_STARTED & user license data when %s error",
    async (error: string) => {
      stubSearchLicenseStatus.mockRejectedValue(new Error(error));
      const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
      const resultCurrentBusiness = getCurrentBusiness(resultUserData);

      expect(resultCurrentBusiness.licenseData?.nameAndAddress).toEqual(nameAndAddress);
      expect(resultCurrentBusiness.licenseData?.completedSearch).toEqual(false);
      expect(
        parseDate(resultCurrentBusiness.licenseData?.lastUpdatedISO as string).isSame(
          getCurrentDate(),
          "minute"
        )
      ).toEqual(true);
      expect(resultCurrentBusiness.licenseData?.status).toEqual("UNKNOWN");
      expect(resultCurrentBusiness.licenseData?.items).toEqual([]);

      expect(resultCurrentBusiness.taskProgress["apply-for-shop-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["register-consumer-affairs"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["pharmacy-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["register-accounting-firm"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["license-massage-therapy"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["moving-company-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["architect-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["hvac-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["appraiser-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["public-accountant-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["landscape-architect-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["health-club-registration"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["telemarketing-license"]).toEqual("NOT_STARTED");
      expect(resultCurrentBusiness.taskProgress["ticket-broker-reseller-registration"]).toEqual(
        "NOT_STARTED"
      );
    }
  );

  it("rejects and still updates user license data when generic error", async () => {
    stubSearchLicenseStatus.mockRejectedValue(new Error("some-error"));
    await expect(updateLicenseStatus(userData, nameAndAddress)).rejects.toEqual(new Error("some-error"));
  });

  it("updates the license task status to IN_PROGRESS when license is pending", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "PENDING",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress["apply-for-shop-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["register-consumer-affairs"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["pharmacy-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["register-accounting-firm"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["license-massage-therapy"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["moving-company-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["architect-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["hvac-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["appraiser-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["public-accountant-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["landscape-architect-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["health-club-registration"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["telemarketing-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusiness.taskProgress["ticket-broker-reseller-registration"]).toEqual("IN_PROGRESS");
  });

  it("updates the license task status to COMPLETED when license is active", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "ACTIVE",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress["apply-for-shop-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["register-consumer-affairs"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["pharmacy-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["register-accounting-firm"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["license-massage-therapy"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["moving-company-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["architect-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["hvac-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["appraiser-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["public-accountant-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["landscape-architect-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["health-club-registration"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["telemarketing-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusiness.taskProgress["ticket-broker-reseller-registration"]).toEqual("COMPLETED");
  });
});
