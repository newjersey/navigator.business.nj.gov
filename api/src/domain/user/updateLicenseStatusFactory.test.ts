import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import {
  generateLicenseData,
  generateLicenseStatusItem,
  generateLicenseStatusResult,
  generateNameAndAddress,
  generateProfileData,
  generateUserData,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { UpdateLicenseStatus } from "../types";
import { updateLicenseStatusFactory } from "./updateLicenseStatusFactory";

describe("updateLicenseStatus", () => {
  let updateLicenseStatus: UpdateLicenseStatus;

  let stubSearchLicenseStatus: jest.Mock;
  let userData: UserData;
  const nameAndAddress = generateNameAndAddress({});

  beforeEach(async () => {
    jest.resetAllMocks();
    stubSearchLicenseStatus = jest.fn();
    updateLicenseStatus = updateLicenseStatusFactory(stubSearchLicenseStatus);

    userData = generateUserData({
      profileData: generateProfileData({
        industryId: "home-contractor",
      }),
      licenseData: generateLicenseData({
        lastUpdatedISO: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
      }),
    });
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

    userData = {
      ...userData,
      licenseData: generateLicenseData({
        expirationISO: getCurrentDate().add(1, "year").subtract(1, "minute").toISOString(),
      }),
    };

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);

    expect(resultUserData.licenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultUserData.licenseData?.completedSearch).toEqual(true);
    expect(resultUserData.licenseData?.expirationISO).toEqual("2020-01-01T00:00:00.000Z");
    expect(
      parseDate(resultUserData.licenseData?.lastUpdatedISO as string).isSame(getCurrentDate(), "minute")
    ).toEqual(true);
    expect(resultUserData.licenseData?.status).toEqual("ACTIVE");
    expect(resultUserData.licenseData?.items).toEqual(checklistItems);
  });

  it("updates the license task status to NOT_STARTED & user license data when NO MATCH", async () => {
    stubSearchLicenseStatus.mockRejectedValue("NO_MATCH");
    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);

    expect(resultUserData.licenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultUserData.licenseData?.completedSearch).toEqual(false);
    expect(
      parseDate(resultUserData.licenseData?.lastUpdatedISO as string).isSame(getCurrentDate(), "minute")
    ).toEqual(true);
    expect(resultUserData.licenseData?.status).toEqual("UNKNOWN");
    expect(resultUserData.licenseData?.items).toEqual([]);

    expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["pharmacy-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["license-accounting"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["license-massage-therapy"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["moving-company-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["architect-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["hvac-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["appraiser-license"]).toEqual("NOT_STARTED");
  });

  it("rejects and still updates user license data when generic error", async () => {
    stubSearchLicenseStatus.mockRejectedValue("some-error");
    await expect(updateLicenseStatus(userData, nameAndAddress)).rejects.toEqual("some-error");
  });

  it("updates the license task status to IN_PROGRESS when license is pending", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "PENDING",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);

    expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["pharmacy-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["license-accounting"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["license-massage-therapy"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["moving-company-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["architect-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["hvac-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["appraiser-license"]).toEqual("IN_PROGRESS");
  });

  it("updates the license task status to COMPLETED when license is active", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "ACTIVE",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);

    expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["pharmacy-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["license-accounting"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["license-massage-therapy"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["moving-company-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["architect-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["hvac-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["appraiser-license"]).toEqual("COMPLETED");
  });
});
