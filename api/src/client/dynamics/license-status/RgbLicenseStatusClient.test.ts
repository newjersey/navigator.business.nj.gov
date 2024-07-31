import { RgbLicenseStatusClient } from "@client/dynamics/license-status/RgbLicenseStatusClient";

import {
  BusinessAddressesClient,
  BusinessIdsAndNamesClient,
  ChecklistItemsForAllApplicationsClient,
  DUPLICATE_LICENSE_TYPE_ERROR,
  LicenseApplicationIdsForAllBusinessIdsClient,
} from "@client/dynamics/license-status/rgbLicenseStatusTypes";
import { AccessTokenClient } from "@client/dynamics/types";
import {
  NO_ADDRESS_MATCH_ERROR,
  NO_MAIN_APPS_ERROR,
  NO_MATCH_ERROR,
  SearchLicenseStatus,
} from "@domain/types";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { generateLicenseSearchAddress, generateLicenseSearchNameAndAddress } from "@shared/test";
import {
  generateLicenseApplicationIdResponseValue,
  generateLicenseStatusChecklistResult,
} from "@test/factories";

describe("RgbLicenseStatusClient", () => {
  let client: SearchLicenseStatus;

  let stubAccessTokenClient: jest.Mocked<AccessTokenClient>;
  let stubBusinessIdsAndNamesClient: jest.Mocked<BusinessIdsAndNamesClient>;
  let stubBusinessAddressesClient: jest.Mocked<BusinessAddressesClient>;
  let stubLicenseApplicationIdsClient: jest.Mocked<LicenseApplicationIdsForAllBusinessIdsClient>;
  let stubChecklistItemsClient: jest.Mocked<ChecklistItemsForAllApplicationsClient>;

  beforeEach(async () => {
    jest.resetAllMocks();

    stubAccessTokenClient = {
      getAccessToken: jest.fn(),
    };
    stubBusinessIdsAndNamesClient = {
      getMatchedBusinessIdsAndNames: jest.fn(),
    };
    stubBusinessAddressesClient = {
      getBusinessAddressesForAllBusinessIds: jest.fn(),
    };
    stubLicenseApplicationIdsClient = {
      getLicenseApplicationIdsForAllBusinessIds: jest.fn(),
    };
    stubChecklistItemsClient = {
      getChecklistItemsForAllApplications: jest.fn(),
    };

    client = RgbLicenseStatusClient({
      dynamicsAccessTokenClient: stubAccessTokenClient,
      rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
      rgbBusinessAddressesClient: stubBusinessAddressesClient,
      rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
      rgbChecklistItemsClient: stubChecklistItemsClient,
    });
  });

  const nameAndAddress = generateLicenseSearchNameAndAddress({
    addressLine1: "123 Main St",
    zipCode: "12345",
  });

  it("succussfully returns LicenseStatusResults", async () => {
    const address = generateLicenseSearchAddress({
      addressLine1: nameAndAddress.addressLine1,
      zipCode: nameAndAddress.zipCode,
    });

    const businessIdAndName = [
      {
        businessId: "businessId1",
        name: "Business1",
      },
      {
        businessId: "businessId2",
        name: "Business2",
      },
    ];
    const businessIdAndLicenseSearchNameAndAddresses = [
      {
        ...businessIdAndName[0],
        addresses: [address],
      },
      {
        ...businessIdAndName[2],
        addresses: [generateLicenseSearchAddress({})],
      },
    ];

    const professionNameAndLicenseType1 = "some profession name1";
    const professionNameAndLicenseType2 = "some profession name2";
    const expirationdate = getCurrentDateISOString();

    const licenseApplicationIdResponse = [
      generateLicenseApplicationIdResponseValue({
        professionNameAndLicenseType: professionNameAndLicenseType1,
        licenseStatus: "ACTIVE",
        expirationDateISO: expirationdate,
      }),
      generateLicenseApplicationIdResponseValue({
        professionNameAndLicenseType: professionNameAndLicenseType2,
        licenseStatus: "ACTIVE",
        expirationDateISO: expirationdate,
      }),
    ];
    const licenseStatusChecklistResult = [
      generateLicenseStatusChecklistResult({
        professionNameAndLicenseType: professionNameAndLicenseType1,
        licenseStatus: "ACTIVE",
        expirationDateISO: expirationdate,
      }),
      generateLicenseStatusChecklistResult({
        professionNameAndLicenseType: professionNameAndLicenseType2,
        licenseStatus: "ACTIVE",
        expirationDateISO: expirationdate,
      }),
    ];

    stubAccessTokenClient.getAccessToken.mockResolvedValue("some-token");
    stubBusinessIdsAndNamesClient.getMatchedBusinessIdsAndNames.mockResolvedValue(businessIdAndName);
    stubBusinessAddressesClient.getBusinessAddressesForAllBusinessIds.mockResolvedValue(
      businessIdAndLicenseSearchNameAndAddresses
    );
    stubLicenseApplicationIdsClient.getLicenseApplicationIdsForAllBusinessIds.mockResolvedValue(
      licenseApplicationIdResponse
    );
    stubChecklistItemsClient.getChecklistItemsForAllApplications.mockResolvedValue(
      licenseStatusChecklistResult
    );

    client = RgbLicenseStatusClient({
      dynamicsAccessTokenClient: stubAccessTokenClient,
      rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
      rgbBusinessAddressesClient: stubBusinessAddressesClient,
      rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
      rgbChecklistItemsClient: stubChecklistItemsClient,
    });
    await expect(client(nameAndAddress)).resolves.toEqual({
      [licenseStatusChecklistResult[0].professionNameAndLicenseType]: {
        licenseStatus: licenseStatusChecklistResult[0].licenseStatus,
        expirationDateISO: licenseStatusChecklistResult[0].expirationDateISO,
        checklistItems: licenseStatusChecklistResult[0].checklistItems,
      },
      [licenseStatusChecklistResult[1].professionNameAndLicenseType]: {
        licenseStatus: licenseStatusChecklistResult[1].licenseStatus,
        expirationDateISO: licenseStatusChecklistResult[1].expirationDateISO,
        checklistItems: licenseStatusChecklistResult[1].checklistItems,
      },
    });
  });

  describe("throws error when sub client throws an error", () => {
    it("throws error when getAccessToken throws a status error", async () => {
      stubAccessTokenClient.getAccessToken.mockRejectedValue(500);
      await expect(client(nameAndAddress)).rejects.toEqual(500);
    });

    it("throws error when getMatchedBusinessIdsAndNames throws a status error", async () => {
      stubBusinessIdsAndNamesClient.getMatchedBusinessIdsAndNames.mockRejectedValue(500);
      await expect(client(nameAndAddress)).rejects.toEqual(500);
    });

    it("throws error when getMatchedBusinessIdsAndNames throws NO_MATCH_ERROR error", async () => {
      stubBusinessIdsAndNamesClient.getMatchedBusinessIdsAndNames.mockRejectedValue(
        new Error(NO_MATCH_ERROR)
      );

      await expect(client(nameAndAddress)).rejects.toThrow(NO_MATCH_ERROR);
    });

    it("throws error when getBusinessAddressesForAllBusinessIds throws a status error", async () => {
      stubBusinessAddressesClient.getBusinessAddressesForAllBusinessIds.mockRejectedValue(500);
      await expect(client(nameAndAddress)).rejects.toEqual(500);
    });

    it("throws error when searchBusinessAddressesForMatches throws NO_ADDRESS_MATCH_ERROR error", async () => {
      const businessIdAndLicenseSearchNameAndAddresses = [
        {
          businessId: "businessId1",
          name: "Business1",
          addresses: [generateLicenseSearchAddress({})],
        },
        {
          businessId: "businessId2",
          name: "Business2",
          addresses: [generateLicenseSearchAddress({})],
        },
      ];

      stubBusinessAddressesClient = {
        getBusinessAddressesForAllBusinessIds: jest
          .fn()
          .mockResolvedValue(businessIdAndLicenseSearchNameAndAddresses),
      };

      client = RgbLicenseStatusClient({
        dynamicsAccessTokenClient: stubAccessTokenClient,
        rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
        rgbBusinessAddressesClient: stubBusinessAddressesClient,
        rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
        rgbChecklistItemsClient: stubChecklistItemsClient,
      });
      await expect(client(nameAndAddress)).rejects.toThrow(NO_ADDRESS_MATCH_ERROR);
    });

    it("throws error when getLicenseApplicationIdsForAllBusinessIds throws a status error", async () => {
      const address = generateLicenseSearchAddress({
        addressLine1: nameAndAddress.addressLine1,
        zipCode: nameAndAddress.zipCode,
      });
      const businessIdAndLicenseSearchNameAndAddresses = [
        {
          businessId: "businessId1",
          name: "Business1",
          addresses: [address],
        },
        {
          businessId: "businessId2",
          name: "Business2",
          addresses: [generateLicenseSearchAddress({})],
        },
      ];

      stubBusinessAddressesClient = {
        getBusinessAddressesForAllBusinessIds: jest
          .fn()
          .mockResolvedValue(businessIdAndLicenseSearchNameAndAddresses),
      };
      stubLicenseApplicationIdsClient.getLicenseApplicationIdsForAllBusinessIds.mockRejectedValue(500);

      client = RgbLicenseStatusClient({
        dynamicsAccessTokenClient: stubAccessTokenClient,
        rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
        rgbBusinessAddressesClient: stubBusinessAddressesClient,
        rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
        rgbChecklistItemsClient: stubChecklistItemsClient,
      });
      await expect(client(nameAndAddress)).rejects.toEqual(500);
    });

    it("throws error when getLicenseApplicationIdsForAllBusinessIds throws NO_MAIN_APPS_ERROR error", async () => {
      const address = generateLicenseSearchAddress({
        addressLine1: nameAndAddress.addressLine1,
        zipCode: nameAndAddress.zipCode,
      });
      const businessIdAndLicenseSearchNameAndAddresses = [
        {
          businessId: "businessId1",
          name: "Business1",
          addresses: [address],
        },
        {
          businessId: "businessId2",
          name: "Business2",
          addresses: [generateLicenseSearchAddress({})],
        },
      ];

      stubBusinessAddressesClient = {
        getBusinessAddressesForAllBusinessIds: jest
          .fn()
          .mockResolvedValue(businessIdAndLicenseSearchNameAndAddresses),
      };
      stubLicenseApplicationIdsClient.getLicenseApplicationIdsForAllBusinessIds.mockRejectedValue(
        new Error(NO_MAIN_APPS_ERROR)
      );

      client = RgbLicenseStatusClient({
        dynamicsAccessTokenClient: stubAccessTokenClient,
        rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
        rgbBusinessAddressesClient: stubBusinessAddressesClient,
        rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
        rgbChecklistItemsClient: stubChecklistItemsClient,
      });

      await expect(client(nameAndAddress)).rejects.toThrow(NO_MAIN_APPS_ERROR);
    });

    it("throws error when getChecklistItemsForAllApplications throws a status error", async () => {
      const address = generateLicenseSearchAddress({
        addressLine1: nameAndAddress.addressLine1,
        zipCode: nameAndAddress.zipCode,
      });
      const businessIdAndLicenseSearchNameAndAddresses = [
        {
          businessId: "businessId1",
          name: "Business1",
          addresses: [address],
        },
        {
          businessId: "businessId2",
          name: "Business2",
          addresses: [generateLicenseSearchAddress({})],
        },
      ];

      stubBusinessAddressesClient = {
        getBusinessAddressesForAllBusinessIds: jest
          .fn()
          .mockResolvedValue(businessIdAndLicenseSearchNameAndAddresses),
      };
      stubChecklistItemsClient.getChecklistItemsForAllApplications.mockRejectedValue(500);

      client = RgbLicenseStatusClient({
        dynamicsAccessTokenClient: stubAccessTokenClient,
        rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
        rgbBusinessAddressesClient: stubBusinessAddressesClient,
        rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
        rgbChecklistItemsClient: stubChecklistItemsClient,
      });
      await expect(client(nameAndAddress)).rejects.toEqual(500);
    });

    it("throws error when formatDynamicsApplications throws DUPLICATE_LICENSE_TYPE_ERROR error", async () => {
      const address = generateLicenseSearchAddress({
        addressLine1: nameAndAddress.addressLine1,
        zipCode: nameAndAddress.zipCode,
      });

      const businessIdAndLicenseSearchNameAndAddresses = [
        {
          businessId: "businessId1",
          name: "Business1",
          addresses: [address],
        },
        {
          businessId: "businessId2",
          name: "Business2",
          addresses: [generateLicenseSearchAddress({})],
        },
      ];

      const professionNameAndLicenseType1 = "some profession name1";
      const expirationdate = getCurrentDateISOString();

      const licenseStatusChecklistResult = [
        generateLicenseStatusChecklistResult({
          professionNameAndLicenseType: professionNameAndLicenseType1,
          licenseStatus: "ACTIVE",
          expirationDateISO: expirationdate,
        }),
        generateLicenseStatusChecklistResult({
          professionNameAndLicenseType: professionNameAndLicenseType1,
          licenseStatus: "ACTIVE",
          expirationDateISO: expirationdate,
        }),
      ];

      stubBusinessAddressesClient.getBusinessAddressesForAllBusinessIds.mockResolvedValue(
        businessIdAndLicenseSearchNameAndAddresses
      );
      stubChecklistItemsClient.getChecklistItemsForAllApplications.mockResolvedValue(
        licenseStatusChecklistResult
      );

      client = RgbLicenseStatusClient({
        dynamicsAccessTokenClient: stubAccessTokenClient,
        rgbBusinessIdsAndNamesClient: stubBusinessIdsAndNamesClient,
        rgbBusinessAddressesClient: stubBusinessAddressesClient,
        rgbLicenseApplicationIdsClient: stubLicenseApplicationIdsClient,
        rgbChecklistItemsClient: stubChecklistItemsClient,
      });

      await expect(client(nameAndAddress)).rejects.toThrow(DUPLICATE_LICENSE_TYPE_ERROR);
    });
  });
});
