import {
  NO_ADDRESS_MATCH_ERROR,
  NO_MAIN_APPS_ERROR,
  NO_MATCH_ERROR,
  UpdateLicenseStatus,
} from "@domain/types";
import { updateLicenseStatusFactory } from "@domain/user/updateLicenseStatusFactory";
import * as getCurrentDateModule from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import {
  generateBusiness,
  generateLicenseData,
  generateLicenseSearchNameAndAddress,
  generateLicenseStatusItem,
  generateProfileData,
  generateUserDataForBusiness,
  modifyCurrentBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";

jest.mock("@shared/dateHelpers", () => {
  return {
    ...jest.requireActual("@shared/dateHelpers"),
    getCurrentDateISOString: jest.fn(),
  };
});

const currentDateMock = (getCurrentDateModule as jest.Mocked<typeof getCurrentDateModule>)
  .getCurrentDateISOString;

describe("updateLicenseStatus", () => {
  let updateLicenseStatus: UpdateLicenseStatus;

  let stubWebserviceLicenseStatusSearch: jest.Mock;
  let stubRGBLicenseStatusSearch: jest.Mock;
  let userData: UserData;
  const nameAndAddress = generateLicenseSearchNameAndAddress({});
  const expectedCurrentDate = getCurrentDateModule.getCurrentDate().toISOString();

  beforeEach(async () => {
    jest.resetAllMocks();

    currentDateMock.mockReturnValue(expectedCurrentDate);

    stubWebserviceLicenseStatusSearch = jest.fn();
    stubRGBLicenseStatusSearch = jest.fn();

    updateLicenseStatus = updateLicenseStatusFactory(
      stubWebserviceLicenseStatusSearch,
      stubRGBLicenseStatusSearch
    );

    userData = generateUserDataForBusiness(
      generateBusiness({
        taskProgress: { "generic-task": "COMPLETED" },
        profileData: generateProfileData({
          industryId: "home-contractor",
        }),
        licenseData: generateLicenseData({
          lastUpdatedISO: getCurrentDateModule
            .getCurrentDate()
            .subtract(1, "hour")
            .subtract(1, "minute")
            .toISOString(),
        }),
      })
    );
  });

  describe("license data", () => {
    it("searches for any license information with user supplied business name and address", async () => {
      stubWebserviceLicenseStatusSearch.mockResolvedValue(generateLicenseData({}));
      stubRGBLicenseStatusSearch.mockResolvedValue(generateLicenseData({}));
      await updateLicenseStatus(userData, nameAndAddress);
      expect(stubWebserviceLicenseStatusSearch).toHaveBeenCalledWith({
        name: nameAndAddress.name,
        addressLine1: nameAndAddress.addressLine1,
        addressLine2: nameAndAddress.addressLine2,
        zipCode: nameAndAddress.zipCode,
      });
      expect(stubRGBLicenseStatusSearch).toHaveBeenCalledWith({
        name: nameAndAddress.name,
        addressLine1: nameAndAddress.addressLine1,
        addressLine2: nameAndAddress.addressLine2,
        zipCode: nameAndAddress.zipCode,
      });
    });

    it("updates the user license data based on the search results", async () => {
      const webserviceChecklistItems = [generateLicenseStatusItem({})];
      const rgbChecklistItems = [generateLicenseStatusItem({})];

      const licenseType1 = {
        "professionName-licenseType-1": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: webserviceChecklistItems,
        },
      };

      const licenseType2 = {
        "Health Care Services": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: rgbChecklistItems,
        },
      };
      stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
      stubRGBLicenseStatusSearch.mockResolvedValue(licenseType2);

      userData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
      const resultCurrentBusiness = getCurrentBusiness(resultUserData);

      const resultLicenseData = resultCurrentBusiness.licenseData;
      const licenseType1Expected = {
        "professionName-licenseType-1": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: webserviceChecklistItems,
          nameAndAddress,
          lastUpdatedISO: expectedCurrentDate,
        },
      };
      const licenseType2Expected = {
        "Health Care Services": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: rgbChecklistItems,
          nameAndAddress,
          lastUpdatedISO: expectedCurrentDate,
        },
      };

      expect(resultLicenseData).toEqual({
        lastUpdatedISO: expectedCurrentDate,
        licenses: {
          ...licenseType1Expected,
          ...licenseType2Expected,
        },
      });
    });

    it("overwrites licenseData with RGB data when RGB is valid source", async () => {
      const webserviceChecklistItems = [generateLicenseStatusItem({})];
      const rgbChecklistItems = [generateLicenseStatusItem({})];

      const licenseType1 = {
        "Health Care Services": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: webserviceChecklistItems,
        },
      };

      const licenseType2 = {
        "Health Care Services": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: rgbChecklistItems,
        },
      };
      stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
      stubRGBLicenseStatusSearch.mockResolvedValue(licenseType2);

      userData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
      const resultCurrentBusiness = getCurrentBusiness(resultUserData);

      const resultLicenseData = resultCurrentBusiness.licenseData;
      const licenseTypeExpected = {
        "Health Care Services": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: rgbChecklistItems,
          nameAndAddress,
          lastUpdatedISO: expectedCurrentDate,
        },
      };

      expect(resultLicenseData).toEqual({
        lastUpdatedISO: expectedCurrentDate,
        licenses: {
          ...licenseTypeExpected,
        },
      });
    });

    it("does not overwrite licenseData with RGB data when RGB is not valid source", async () => {
      const webserviceChecklistItems = [generateLicenseStatusItem({})];
      const rgbChecklistItems = [generateLicenseStatusItem({})];

      const licenseType1 = {
        "Some Totally Random License Type": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: webserviceChecklistItems,
        },
      };

      const licenseType2 = {
        "Some Totally Random License Type": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: rgbChecklistItems,
        },
      };
      stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
      stubRGBLicenseStatusSearch.mockResolvedValue(licenseType2);

      userData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
      const resultCurrentBusiness = getCurrentBusiness(resultUserData);

      const resultLicenseData = resultCurrentBusiness.licenseData;
      const licenseTypeExpected = {
        "Some Totally Random License Type": {
          licenseStatus: "ACTIVE",
          expirationDateISO: "2020-01-01T00:00:00.000Z",
          checklistItems: webserviceChecklistItems,
          nameAndAddress,
          lastUpdatedISO: expectedCurrentDate,
        },
      };

      expect(resultLicenseData).toEqual({
        lastUpdatedISO: expectedCurrentDate,
        licenses: {
          ...licenseTypeExpected,
        },
      });
    });
  });

  describe("error handling", () => {
    it("throws error when both webservice and rgb api call fails", async () => {
      stubWebserviceLicenseStatusSearch.mockRejectedValue("fail");
      stubRGBLicenseStatusSearch.mockRejectedValue("fail");

      userData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      await expect(updateLicenseStatus(userData, nameAndAddress)).rejects.toThrow(
        JSON.stringify({
          webserviceErrorMessage: "fail",
          rgbErrorMessage: "fail",
        })
      );
    });

    it("updates license data of current task to have error license data when webservice receives NO_MATCH_ERROR and rgb also fails", async () => {
      stubWebserviceLicenseStatusSearch.mockRejectedValue(NO_MATCH_ERROR);
      stubRGBLicenseStatusSearch.mockRejectedValue("fail");

      userData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userData, nameAndAddress, "pharmacy-license");
      const resultCurrentBusiness = getCurrentBusiness(resultUserData);

      const resultLicenseData = resultCurrentBusiness.licenseData;
      const licenseType1Expected = {
        "Pharmacy-Pharmacy": {
          licenseStatus: "UNKNOWN",
          expirationDateISO: undefined,
          hasError: true,

          checklistItems: [],
          nameAndAddress,
          lastUpdatedISO: expectedCurrentDate,
        },
      };

      expect(resultLicenseData).toEqual({
        lastUpdatedISO: expectedCurrentDate,
        licenses: {
          ...licenseType1Expected,
        },
      });
    });

    it.each([NO_MATCH_ERROR, NO_MAIN_APPS_ERROR, NO_ADDRESS_MATCH_ERROR])(
      "updates license data of current task to have error license data when rgb receives %s and webservice also fails",
      async (error) => {
        stubWebserviceLicenseStatusSearch.mockRejectedValue("fails");
        stubRGBLicenseStatusSearch.mockRejectedValue(error);

        userData = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          licenseData: generateLicenseData({}),
        }));

        const resultUserData = await updateLicenseStatus(
          userData,
          nameAndAddress,
          "home-health-aide-license"
        );
        const resultCurrentBusiness = getCurrentBusiness(resultUserData);

        const resultLicenseData = resultCurrentBusiness.licenseData;
        const licenseType1Expected = {
          "Health Care Services": {
            licenseStatus: "UNKNOWN",
            expirationDateISO: undefined,
            hasError: true,

            checklistItems: [],
            nameAndAddress,
            lastUpdatedISO: expectedCurrentDate,
          },
        };

        expect(resultLicenseData).toEqual({
          lastUpdatedISO: expectedCurrentDate,
          licenses: {
            ...licenseType1Expected,
          },
        });
      }
    );
  });

  describe("task progress", () => {});

  it("defaults the license task status to NOT_STARTED", async () => {
    const webserviceChecklistItems = [generateLicenseStatusItem({})];
    const licenseType1 = {
      "Pharmacy-Pharmacy": {
        licenseStatus: "Gibberish",
        expirationDateISO: "2020-01-01T00:00:00.000Z",
        checklistItems: webserviceChecklistItems,
      },
    };

    stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
    stubRGBLicenseStatusSearch.mockResolvedValue({});

    const initialTaskProgress = getCurrentBusiness(userData).taskProgress;

    userData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress).toEqual({
      ...initialTaskProgress,
      "pharmacy-license": "NOT_STARTED",
    });
  });

  it("updates the license task status to IN_PROGRESS when license is pending", async () => {
    const webserviceChecklistItems = [generateLicenseStatusItem({})];
    const licenseType1 = {
      "Pharmacy-Pharmacy": {
        licenseStatus: "PENDING",
        expirationDateISO: "2020-01-01T00:00:00.000Z",
        checklistItems: webserviceChecklistItems,
      },
    };

    stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
    stubRGBLicenseStatusSearch.mockResolvedValue({});

    const initialTaskProgress = getCurrentBusiness(userData).taskProgress;

    userData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress).toEqual({
      ...initialTaskProgress,
      "pharmacy-license": "IN_PROGRESS",
    });
  });

  it("updates the license task status to COMPLETED when license is active", async () => {
    const webserviceChecklistItems = [generateLicenseStatusItem({})];
    const licenseType1 = {
      "Pharmacy-Pharmacy": {
        licenseStatus: "ACTIVE",
        expirationDateISO: "2020-01-01T00:00:00.000Z",
        checklistItems: webserviceChecklistItems,
      },
    };

    stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
    stubRGBLicenseStatusSearch.mockResolvedValue({});

    const initialTaskProgress = getCurrentBusiness(userData).taskProgress;

    userData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress).toEqual({
      ...initialTaskProgress,
      "pharmacy-license": "COMPLETED",
    });
  });

  it("updates multiple license task status", async () => {
    const webserviceChecklistItems = [generateLicenseStatusItem({})];
    const rgbChecklistItems = [generateLicenseStatusItem({})];

    const licenseType1 = {
      "Pharmacy-Pharmacy": {
        licenseStatus: "ACTIVE",
        expirationDateISO: "2020-01-01T00:00:00.000Z",
        checklistItems: webserviceChecklistItems,
      },
    };

    const licenseType2 = {
      "Health Care Services": {
        licenseStatus: "PENDING",
        expirationDateISO: "2020-01-01T00:00:00.000Z",
        checklistItems: rgbChecklistItems,
      },
    };

    stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
    stubRGBLicenseStatusSearch.mockResolvedValue(licenseType2);

    const initialTaskProgress = getCurrentBusiness(userData).taskProgress;

    userData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress).toEqual({
      ...initialTaskProgress,
      "pharmacy-license": "COMPLETED",
      "home-health-aide-license": "IN_PROGRESS",
    });
  });

  it("resets task progress for license search task that is not in license search result", async () => {
    const webserviceChecklistItems = [generateLicenseStatusItem({})];
    const licenseType1 = {
      "Pharmacy-Pharmacy": {
        licenseStatus: "ACTIVE",
        expirationDateISO: "2020-01-01T00:00:00.000Z",
        checklistItems: webserviceChecklistItems,
      },
    };

    stubWebserviceLicenseStatusSearch.mockResolvedValue(licenseType1);
    stubRGBLicenseStatusSearch.mockResolvedValue({});

    const initialTaskProgress = getCurrentBusiness(userData).taskProgress;

    userData = modifyCurrentBusiness(userData, (business) => ({
      ...business,
      taskProgress: {
        ...business.taskProgress,
        "health-club-registration": "IN_PROGRESS",
      },
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userData, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress).toEqual({
      ...initialTaskProgress,
      "pharmacy-license": "COMPLETED",
    });
  });
});
