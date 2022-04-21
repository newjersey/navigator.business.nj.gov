import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import { UserData } from "@shared/userData";
import {
  generateLicenseData,
  generateLicenseStatusItem,
  generateLicenseStatusResult,
  generateNameAndAddress,
  generateProfileData,
  generateUserData,
} from "../../../test/factories";
import { UpdateLicenseStatus, UserDataClient } from "../types";
import { updateLicenseStatusFactory } from "./updateLicenseStatusFactory";

describe("updateLicenseStatus", () => {
  let updateLicenseStatus: UpdateLicenseStatus;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubSearchLicenseStatus: jest.Mock;
  let userData: UserData;
  const nameAndAddress = generateNameAndAddress({});

  beforeEach(async () => {
    jest.resetAllMocks();
    stubSearchLicenseStatus = jest.fn();
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    updateLicenseStatus = updateLicenseStatusFactory(stubUserDataClient, stubSearchLicenseStatus);

    userData = generateUserData({
      profileData: generateProfileData({
        industryId: "home-contractor",
      }),
      licenseData: generateLicenseData({
        lastCheckedStatus: getCurrentDate().subtract(1, "hour").subtract(1, "minute").toISOString(),
      }),
    });
    stubUserDataClient.get.mockResolvedValue(userData);
    stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
      return Promise.resolve(userData);
    });
  });

  it("searches for license status with criteria and license type", async () => {
    stubSearchLicenseStatus.mockResolvedValue(generateLicenseStatusResult({}));

    await updateLicenseStatus("some-id", nameAndAddress);
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
      checklistItems: checklistItems,
    });

    const resultUserData = await updateLicenseStatus("some-id", nameAndAddress);

    expect(resultUserData.licenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultUserData.licenseData?.completedSearch).toEqual(true);
    expect(
      parseDate(resultUserData.licenseData?.lastCheckedStatus as string).isSame(getCurrentDate(), "minute")
    ).toEqual(true);
    expect(resultUserData.licenseData?.status).toEqual("ACTIVE");
    expect(resultUserData.licenseData?.items).toEqual(checklistItems);

    expect(stubUserDataClient.put).toHaveBeenCalledWith(resultUserData);
  });

  it("updates the license task status to NOT_STARTED & user license data when NO MATCH", async () => {
    stubSearchLicenseStatus.mockRejectedValue("NO_MATCH");
    const resultUserData = await updateLicenseStatus("some-id", nameAndAddress);

    expect(resultUserData.licenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(resultUserData.licenseData?.completedSearch).toEqual(false);
    expect(
      parseDate(resultUserData.licenseData?.lastCheckedStatus as string).isSame(getCurrentDate(), "minute")
    ).toEqual(true);
    expect(resultUserData.licenseData?.status).toEqual("UNKNOWN");
    expect(resultUserData.licenseData?.items).toEqual([]);

    expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["pharmacy-license"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["license-accounting"]).toEqual("NOT_STARTED");
    expect(resultUserData.taskProgress["license-massage-therapy"]).toEqual("NOT_STARTED");

    expect(stubUserDataClient.put).toHaveBeenCalledWith(resultUserData);
  });

  it("rejects and still updates user license data when generic error", async () => {
    stubSearchLicenseStatus.mockRejectedValue("some-error");
    await expect(updateLicenseStatus("some-id", nameAndAddress)).rejects.toEqual("some-error");
    expect(stubUserDataClient.put).toHaveBeenCalled();
  });

  it("updates the license task status to IN_PROGRESS when license is pending", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "PENDING",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus("some-id", nameAndAddress);

    expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["pharmacy-license"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["license-accounting"]).toEqual("IN_PROGRESS");
    expect(resultUserData.taskProgress["license-massage-therapy"]).toEqual("IN_PROGRESS");
  });

  it("updates the license task status to COMPLETED when license is active", async () => {
    stubSearchLicenseStatus.mockResolvedValue({
      status: "ACTIVE",
      checklistItems: [],
    });

    const resultUserData = await updateLicenseStatus("some-id", nameAndAddress);

    expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["pharmacy-license"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["license-accounting"]).toEqual("COMPLETED");
    expect(resultUserData.taskProgress["license-massage-therapy"]).toEqual("COMPLETED");
  });
});
