import { CRTKStatusLookup, UpdateCRTK } from "@domain/types";
import { updateCRTKStatusFactory } from "@domain/user/updateCrtkStatusFactory";
import { CRTKBusinessDetails } from "@shared/crtk";
import { getCurrentDate } from "@shared/dateHelpers";
import { generateUserData } from "@shared/test";
import dayjs from "dayjs";

describe("updateCRTKStatusFactory", () => {
  let crtkLookupClient: jest.Mocked<CRTKStatusLookup>;
  let updateCRTKStatus: UpdateCRTK;

  beforeEach(() => {
    jest.resetAllMocks();
    crtkLookupClient = {
      getStatus: jest.fn(),
    };
    updateCRTKStatus = updateCRTKStatusFactory(crtkLookupClient);
  });

  it("returns updated userData with COMPLETED task progress when CRTK is found", async () => {
    const crtkResponse = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "FOUND" as const,
      CRTKBusinessDetails: {
        businessName: "Test Facility LLC",
        addressLine1: "456 Industrial Park",
        city: "Newark",
        addressZipCode: "07102",
      },
      CRTKEntry: {
        businessName: "Test Facility LLC",
        streetAddress: "456 Industrial Park",
        city: "Newark",
        state: "NJ",
        zipCode: "07102",
        ein: "12-3456789",
        facilityId: "FAC-12345",
        sicCode: "2834",
        naicsCode: "325412",
        naicsDescription: "Pharmaceutical Preparation Manufacturing",
        businessActivity: "Manufacturing",
        facilityType: "REGULATED",
        facilityStatus: "ACTIVE",
        eligibility: "CRTK/RPPR",
        userStatus: "USER",
        receivedDate: "01/15/2024",
      },
    };

    crtkLookupClient.getStatus.mockResolvedValue(crtkResponse);

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Test Facility LLC",
      addressLine1: "456 Industrial Park",
      city: "Newark",
      addressZipCode: "07102",
      ein: "12-3456789",
    };

    const updatedUserData = await updateCRTKStatus(userData, businessDetails);
    const crtkData = updatedUserData.businesses[updatedUserData.currentBusinessId].crtkData;

    expect(crtkData?.CRTKBusinessDetails).toEqual(crtkResponse.CRTKBusinessDetails);
    expect(crtkData?.CRTKSearchResult).toEqual("FOUND");
    expect(crtkData?.CRTKEntry).toEqual(crtkResponse.CRTKEntry);
    expect(dayjs(crtkData?.lastUpdatedISO).minute()).toBe(getCurrentDate().minute());

    expect(updatedUserData.businesses[updatedUserData.currentBusinessId].taskProgress.crtk).toBe(
      "COMPLETED",
    );
  });

  it("sets task progress to TO_DO when CRTK is not found", async () => {
    const crtkResponse = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "NOT_FOUND" as const,
      CRTKBusinessDetails: {
        businessName: "Nonexistent Business",
        addressLine1: "999 Nowhere Street",
        city: "Springfield",
        addressZipCode: "99999",
      },
      CRTKEntry: {},
    };

    crtkLookupClient.getStatus.mockResolvedValue(crtkResponse);

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Nonexistent Business",
      addressLine1: "999 Nowhere Street",
      city: "Springfield",
      addressZipCode: "99999",
    };

    const updatedUserData = await updateCRTKStatus(userData, businessDetails);
    const crtkData = updatedUserData.businesses[updatedUserData.currentBusinessId].crtkData;

    expect(crtkData?.CRTKSearchResult).toEqual("NOT_FOUND");
    expect(crtkData?.CRTKEntry).toEqual({});
    expect(updatedUserData.businesses[updatedUserData.currentBusinessId].taskProgress.crtk).toBe(
      "TO_DO",
    );
  });

  it("updates userData with CRTK data when searching by EIN", async () => {
    const crtkResponse = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "FOUND" as const,
      CRTKBusinessDetails: {
        businessName: "EIN Search Business",
        addressLine1: "789 EIN Avenue",
        city: "Jersey City",
        addressZipCode: "07302",
      },
      CRTKEntry: {
        businessName: "EIN Search Business",
        streetAddress: "789 EIN Avenue",
        city: "Jersey City",
        state: "NJ",
        zipCode: "07302",
        ein: "98-7654321",
        facilityId: "FAC-98765",
        facilityStatus: "ACTIVE",
      },
    };

    crtkLookupClient.getStatus.mockResolvedValue(crtkResponse);

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Some Business",
      addressLine1: "123 Main Street",
      city: "Newark",
      addressZipCode: "07102",
      ein: "98-7654321",
    };

    const updatedUserData = await updateCRTKStatus(userData, businessDetails);
    const crtkData = updatedUserData.businesses[updatedUserData.currentBusinessId].crtkData;

    expect(crtkLookupClient.getStatus).toHaveBeenCalledWith(
      "Some Business",
      "123 Main Street",
      "Newark",
      "07102",
      "98-7654321",
    );
    expect(crtkData?.CRTKSearchResult).toEqual("FOUND");
    expect(crtkData?.CRTKEntry.ein).toEqual("98-7654321");
  });

  it("preserves existing userData fields that are not updated", async () => {
    const crtkResponse = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "FOUND" as const,
      CRTKBusinessDetails: {
        businessName: "Test Business",
        addressLine1: "123 Test Street",
        city: "Test City",
        addressZipCode: "12345",
      },
      CRTKEntry: {
        facilityId: "FAC-12345",
      },
    };

    crtkLookupClient.getStatus.mockResolvedValue(crtkResponse);

    const userData = generateUserData({});
    const originalBusinessCount = Object.keys(userData.businesses).length;
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Test Business",
      addressLine1: "123 Test Street",
      city: "Test City",
      addressZipCode: "12345",
    };

    const updatedUserData = await updateCRTKStatus(userData, businessDetails);

    expect(Object.keys(updatedUserData.businesses).length).toBe(originalBusinessCount);
    expect(updatedUserData.currentBusinessId).toBe(userData.currentBusinessId);
    expect(updatedUserData.user).toEqual(userData.user);
  });

  it("throws an error when lookup throws an error", async () => {
    crtkLookupClient.getStatus.mockRejectedValue(new Error("NETWORK_ERROR"));

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Test Business",
      addressLine1: "123 Test Street",
      city: "Test City",
      addressZipCode: "12345",
    };

    await expect(updateCRTKStatus(userData, businessDetails)).rejects.toThrow("NETWORK_ERROR");
  });

  it("throws an error when lookup throws a specific error", async () => {
    crtkLookupClient.getStatus.mockRejectedValue(new Error("DATABASE_ERROR"));

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Test Business",
      addressLine1: "123 Test Street",
      city: "Test City",
      addressZipCode: "12345",
    };

    await expect(updateCRTKStatus(userData, businessDetails)).rejects.toThrow("DATABASE_ERROR");
  });

  it("correctly passes all business details parameters to crtkLookupClient", async () => {
    const crtkResponse = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "FOUND" as const,
      CRTKBusinessDetails: {
        businessName: "Parameter Test Business",
        addressLine1: "100 Parameter Street",
        city: "Parameter City",
        addressZipCode: "55555",
      },
      CRTKEntry: {},
    };

    crtkLookupClient.getStatus.mockResolvedValue(crtkResponse);

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "Parameter Test Business",
      addressLine1: "100 Parameter Street",
      city: "Parameter City",
      addressZipCode: "55555",
      ein: "11-2233445",
    };

    await updateCRTKStatus(userData, businessDetails);

    expect(crtkLookupClient.getStatus).toHaveBeenCalledWith(
      "Parameter Test Business",
      "100 Parameter Street",
      "Parameter City",
      "55555",
      "11-2233445",
    );
  });

  it("handles undefined EIN parameter", async () => {
    const crtkResponse = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "NOT_FOUND" as const,
      CRTKBusinessDetails: {
        businessName: "No EIN Business",
        addressLine1: "200 No EIN Road",
        city: "No EIN City",
        addressZipCode: "66666",
      },
      CRTKEntry: {},
    };

    crtkLookupClient.getStatus.mockResolvedValue(crtkResponse);

    const userData = generateUserData({});
    const businessDetails: CRTKBusinessDetails = {
      businessName: "No EIN Business",
      addressLine1: "200 No EIN Road",
      city: "No EIN City",
      addressZipCode: "66666",
    };

    await updateCRTKStatus(userData, businessDetails);

    expect(crtkLookupClient.getStatus).toHaveBeenCalledWith(
      "No EIN Business",
      "200 No EIN Road",
      "No EIN City",
      "66666",
      undefined,
    );
  });
});
