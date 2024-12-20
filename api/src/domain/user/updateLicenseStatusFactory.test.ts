import {
  NO_ADDRESS_MATCH_ERROR,
  NO_MAIN_APPS_ERROR,
  NO_MATCH_ERROR,
  UpdateLicenseStatus,
} from "@domain/types";
import { updateLicenseStatusFactory } from "@domain/user/updateLicenseStatusFactory";
import * as getCurrentDateModule from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import {
  generateBusiness,
  generateLicenseData,
  generateLicenseSearchNameAndAddress,
  generateLicenseStatusItem,
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
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
  let userDataForBusiness: UserData;
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

    const userData = generateUserData({});
    const business = generateBusiness(userData, {
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
    });

    userDataForBusiness = generateUserDataForBusiness(business);
  });

  describe("license data", () => {
    it("searches for any license information with user supplied business name and address", async () => {
      stubWebserviceLicenseStatusSearch.mockResolvedValue(generateLicenseData({}));
      stubRGBLicenseStatusSearch.mockResolvedValue(generateLicenseData({}));
      await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

      userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

      userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

      userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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
      stubWebserviceLicenseStatusSearch.mockRejectedValue(new Error("fail"));
      stubRGBLicenseStatusSearch.mockRejectedValue(new Error("fail"));

      userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      await expect(updateLicenseStatus(userDataForBusiness, nameAndAddress)).rejects.toThrow(
        JSON.stringify({
          webserviceErrorMessage: new Error("fail"),
          rgbErrorMessage: new Error("fail"),
        })
      );
    });

    it("returns empty license object when data of current task to have error license data when webservice receives NO_MATCH_ERROR and rgb also fails", async () => {
      stubWebserviceLicenseStatusSearch.mockRejectedValue(new Error(NO_MATCH_ERROR));
      stubRGBLicenseStatusSearch.mockRejectedValue(new Error("fail"));

      userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
        ...business,
        licenseData: generateLicenseData({}),
      }));

      const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
      const resultCurrentBusiness = getCurrentBusiness(resultUserData);

      const resultLicenseData = resultCurrentBusiness.licenseData;
      const licenseType1Expected = {};

      expect(resultLicenseData).toEqual({
        lastUpdatedISO: expectedCurrentDate,
        licenses: {
          ...licenseType1Expected,
        },
      });
    });

    it.each([NO_MATCH_ERROR, NO_MAIN_APPS_ERROR, NO_ADDRESS_MATCH_ERROR])(
      "returns empty license task of current task to have error license data when rgb receives %s and webservice also fails",
      async (error) => {
        stubWebserviceLicenseStatusSearch.mockRejectedValue(new Error("fails"));
        stubRGBLicenseStatusSearch.mockRejectedValue(new Error(error));

        userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
          ...business,
          licenseData: generateLicenseData({}),
        }));

        const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
        const resultCurrentBusiness = getCurrentBusiness(resultUserData);

        const resultLicenseData = resultCurrentBusiness.licenseData;
        const licenseType1Expected = {};

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

    const initialTaskProgress = getCurrentBusiness(userDataForBusiness).taskProgress;

    userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

    const initialTaskProgress = getCurrentBusiness(userDataForBusiness).taskProgress;

    userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

    const initialTaskProgress = getCurrentBusiness(userDataForBusiness).taskProgress;

    userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

    const initialTaskProgress = getCurrentBusiness(userDataForBusiness).taskProgress;

    userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
      ...business,
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
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

    const initialTaskProgress = getCurrentBusiness(userDataForBusiness).taskProgress;

    userDataForBusiness = modifyCurrentBusiness(userDataForBusiness, (business) => ({
      ...business,
      taskProgress: {
        ...business.taskProgress,
        "health-club-registration": "IN_PROGRESS",
      },
      licenseData: generateLicenseData({}),
    }));

    const resultUserData = await updateLicenseStatus(userDataForBusiness, nameAndAddress);
    const resultCurrentBusiness = getCurrentBusiness(resultUserData);

    expect(resultCurrentBusiness.taskProgress).toEqual({
      ...initialTaskProgress,
      "pharmacy-license": "COMPLETED",
    });
  });
});
