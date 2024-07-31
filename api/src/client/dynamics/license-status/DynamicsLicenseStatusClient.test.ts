import { DynamicsLicenseStatusClient } from "@client/dynamics/license-status/DynamicsLicenseStatusClient";
import {
  BusinessAddressClient,
  BusinessIdClient,
  ChecklistItemsClient,
  LicenseApplicationIdClient,
} from "@client/dynamics/license-status/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { NO_MAIN_APPS_ERROR, NO_MATCH_ERROR, SearchLicenseStatus } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";

describe("DynamicsLicenseStatusClient", () => {
  let client: SearchLicenseStatus;
  let logger: LogWriterType;

  let stubAccessTokenClient: jest.Mocked<AccessTokenClient>;
  let stubBusinessIdClient: jest.Mocked<BusinessIdClient>;
  let stubBusinessAddressClient: jest.Mocked<BusinessAddressClient>;
  let stubChecklistItemsClient: jest.Mocked<ChecklistItemsClient>;
  let stubLicenseApplicationIdClient: jest.Mocked<LicenseApplicationIdClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    stubAccessTokenClient = {
      getAccessToken: jest.fn(),
    };

    stubBusinessIdClient = {
      getMatchedBusinessIds: jest.fn(),
    };
    stubBusinessAddressClient = {
      getBusinessIdsAndLicenseSearchAddresses: jest.fn(),
    };
    stubChecklistItemsClient = {
      getChecklistItems: jest.fn(),
    };
    stubLicenseApplicationIdClient = {
      getLicenseApplicationId: jest.fn(),
    };

    client = DynamicsLicenseStatusClient(logger, {
      accessTokenClient: stubAccessTokenClient,
      businessIdClient: stubBusinessIdClient,
      businessAddressClient: stubBusinessAddressClient,
      licenseApplicationIdClient: stubLicenseApplicationIdClient,
      checklistItemsClient: stubChecklistItemsClient,
    });
  });

  it("returns a license status result", async () => {
    stubBusinessAddressClient.getBusinessIdsAndLicenseSearchAddresses.mockResolvedValue([
      {
        businessId: "mockBusinessId",
        addresses: [{ addressLine1: "123 Main St", addressLine2: "Apt 101", zipCode: "12345" }],
      },
    ]);
    stubLicenseApplicationIdClient.getLicenseApplicationId.mockResolvedValue({
      expirationDate: "2023-12-3",
      applicationId: "app-id-123",
      licenseStatus: "ACTIVE",
    });
    stubChecklistItemsClient.getChecklistItems.mockResolvedValue([
      {
        title: "Business Forms - Cert of Inc, Formation, Trade Names",
        status: "PENDING",
      },
      {
        title: "Registration Fee",
        status: "ACTIVE",
      },
    ]);

    const nameAndAddress = {
      name: "Public Movers Test Business",
      addressLine1: "123 Main St",
      addressLine2: "Apt 101",
      zipCode: "12345",
    };

    const result = await client(nameAndAddress, "Public Movers and Warehousemen");

    expect(result).toEqual({
      status: "ACTIVE",
      expirationISO: "2023-12-3",
      checklistItems: [
        {
          title: "Business Forms - Cert of Inc, Formation, Trade Names",
          status: "PENDING",
        },
        {
          title: "Registration Fee",
          status: "ACTIVE",
        },
      ],
    });
  });

  it("throws a NO_MATCH error when a sub client client throws a NO_MATCH error", async () => {
    stubBusinessIdClient.getMatchedBusinessIds.mockRejectedValue(new Error(NO_MATCH_ERROR));
    const nameAndAddress = {
      name: "Public Movers Test Business",
      addressLine1: "123 Main St",
      addressLine2: "Apt 101",
      zipCode: "12345",
    };
    await expect(client(nameAndAddress, "Public Movers and Warehousemen")).rejects.toThrow(NO_MATCH_ERROR);
  });

  it.each([{ errorCode: NO_MAIN_APPS_ERROR }])(
    "throws a $errorCode error when a sub client client throws a $errorCode error",
    async ({ errorCode }) => {
      stubBusinessAddressClient.getBusinessIdsAndLicenseSearchAddresses.mockResolvedValue([
        {
          businessId: "mockBusinessId",
          addresses: [{ addressLine1: "123 Main St", addressLine2: "Apt 101", zipCode: "12345" }],
        },
      ]);
      stubLicenseApplicationIdClient.getLicenseApplicationId.mockRejectedValue(new Error(errorCode));
      const nameAndAddress = {
        name: "Public Movers Test Business",
        addressLine1: "123 Main St",
        addressLine2: "Apt 101",
        zipCode: "12345",
      };
      await expect(client(nameAndAddress, "Public Movers and Warehousemen")).rejects.toThrow(errorCode);
    }
  );

  it("throws a 400 error when a sub client client throws a 400", async () => {
    stubBusinessAddressClient.getBusinessIdsAndLicenseSearchAddresses.mockResolvedValue([
      {
        businessId: "mockBusinessId",
        addresses: [{ addressLine1: "123 Main St", addressLine2: "Apt 101", zipCode: "12345" }],
      },
    ]);
    stubLicenseApplicationIdClient.getLicenseApplicationId.mockRejectedValue(new Error("400"));
    const nameAndAddress = {
      name: "Public Movers Test Business",
      addressLine1: "123 Main St",
      addressLine2: "Apt 101",
      zipCode: "12345",
    };
    await expect(client(nameAndAddress, "Public Movers and Warehousemen")).rejects.toThrow("400");
  });
});
