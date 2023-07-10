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
    const currentBusiness = userData.businesses[userData.currentBusinessID]
    const updatedBusiness = {...currentBusiness, licenseData:  generateLicenseData({
        expirationISO: getCurrentDate().add(1, "year").subtract(1, "minute").toISOString(),
      })}
    const updatedBusinesses = {...userData.businesses, [userData.currentBusinessID]: updatedBusiness}

    userData = {
      ...userData,
     businesses: updatedBusinesses
    };

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusinessLicenseData = resultUserData.businesses[resultUserData.currentBusinessID].licenseData

    expect(resultCurrentBusinessLicenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultCurrentBusinessLicenseData?.completedSearch).toEqual(true);
    expect(resultCurrentBusinessLicenseData?.expirationISO).toEqual("2020-01-01T00:00:00.000Z");
    expect(
      parseDate(resultCurrentBusinessLicenseData?.lastUpdatedISO as string).isSame(getCurrentDate(), "minute")
    ).toEqual(true);
    expect(resultCurrentBusinessLicenseData?.status).toEqual("ACTIVE");
    expect(resultCurrentBusinessLicenseData?.items).toEqual(checklistItems);
  });

  it("updates the license task status to NOT_STARTED & user license data when NO MATCH", async () => {
    stubSearchLicenseStatus.mockRejectedValue("NO_MATCH");
    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusinessLicenseData = resultUserData.businesses[resultUserData.currentBusinessID].licenseData
    const resultCurrentBusinessTaskProgress = resultUserData.businesses[resultUserData.currentBusinessID].taskProgress

    expect(resultCurrentBusinessLicenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultCurrentBusinessLicenseData?.completedSearch).toEqual(false);
    expect(
      parseDate(resultCurrentBusinessLicenseData?.lastUpdatedISO as string).isSame(getCurrentDate(), "minute")
    ).toEqual(true);
    expect(resultCurrentBusinessLicenseData?.status).toEqual("UNKNOWN");
    expect(resultCurrentBusinessLicenseData?.items).toEqual([]);

    expect(resultCurrentBusinessTaskProgress["apply-for-shop-license"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["register-consumer-affairs"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["pharmacy-license"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["license-accounting"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["license-massage-therapy"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["moving-company-license"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["architect-license"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["hvac-license"]).toEqual("NOT_STARTED");
    expect(resultCurrentBusinessTaskProgress["appraiser-license"]).toEqual("NOT_STARTED");
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
    const resultCurrentBusinessTaskProgress = resultUserData.businesses[resultUserData.currentBusinessID].taskProgress

    expect(resultCurrentBusinessTaskProgress["apply-for-shop-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["register-consumer-affairs"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["pharmacy-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["license-accounting"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["license-massage-therapy"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["moving-company-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["architect-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["hvac-license"]).toEqual("IN_PROGRESS");
    expect(resultCurrentBusinessTaskProgress["appraiser-license"]).toEqual("IN_PROGRESS");
  });

  it("updates the license task status to COMPLETED when license is active", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "ACTIVE",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusinessTaskProgress = resultUserData.businesses[resultUserData.currentBusinessID].taskProgress

    expect(resultCurrentBusinessTaskProgress["apply-for-shop-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["register-consumer-affairs"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["pharmacy-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["license-accounting"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["license-massage-therapy"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["moving-company-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["architect-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["hvac-license"]).toEqual("COMPLETED");
    expect(resultCurrentBusinessTaskProgress["appraiser-license"]).toEqual("COMPLETED");
  });
});
