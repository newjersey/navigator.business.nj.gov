import { XrayRegistrationLookupClient } from "@client/dep/XrayRegistrationLookupClient";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { XrayRegistrationSearch, XrayRegistrationStatusLookup } from "@shared/xray";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("xrayRegistrationLookClient", () => {
  let client: XrayRegistrationStatusLookup;
  let searchClient: jest.Mocked<XrayRegistrationSearch>;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    searchClient = {
      searchByAddress: jest.fn(),
      searchByBusinessName: jest.fn(),
    };
    client = XrayRegistrationLookupClient(searchClient, logger);
  });

  it("returns a xray registration response", async () => {
    searchClient.searchByAddress.mockResolvedValue([
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Main Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: "Some Business LLC",
      },
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Main Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: "Some Business LLC",
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Main Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: "Some Business LLC",
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 First Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: "Some Business LLC",
      },
    ]);
    searchClient.searchByBusinessName.mockResolvedValue([
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Main Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: "Some Business LLC",
      },
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Main Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: "Some Business LLC",
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Second Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: "Some Business 2 LLC",
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: "123 Second Street",
        city: "PARAMUS",
        state: "NJ",
        zipCode: "12345",
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: "Some Business 2 LLC",
      },
    ]);

    const response = await client.getStatus("Some Business", "123 Main Street", "12345");
    expect(response).toEqual({
      machines: [
        {
          registrationNumber: "330061",
          roomId: "01",
          registrationCategory: "DENTIST",

          name: "GENDEX CORP.",
          modelNumber: "46-404600G",
          serialNumber: "770-1676141DP",
          annualFee: 92,
        },
      ],
      status: "ACTIVE",
      expirationDate: "08/31/2025",
      deactivationDate: undefined,
    });
  });

  it("throws an STATUS_MISMATCH error when there are entries with different status", async () => {
    searchClient.searchByAddress.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        status: "ACTIVE",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        status: "EXPIRED",
      }),
    ]);

    searchClient.searchByBusinessName.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        status: "EXPIRED",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        status: "ACTIVE",
      }),
    ]);

    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "STATUS_MISMATCH"
    );
  });

  it("throws an EXPIRATION_DATE_MISMATCH error", async () => {
    searchClient.searchByAddress.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        expirationDate: "2023-01-01",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        expirationDate: "2023-01-05",
      }),
    ]);

    searchClient.searchByBusinessName.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        expirationDate: "2023-01-05",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        expirationDate: "2023-01-01",
      }),
    ]);

    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "EXPIRATION_DATE_MISMATCH"
    );
  });

  it("throws an DEACTIVATION_DATE_MISMATCH error", async () => {
    searchClient.searchByAddress.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        deactivationDate: "2023-01-01",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        deactivationDate: "2023-01-05",
      }),
    ]);

    searchClient.searchByBusinessName.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        deactivationDate: "2023-01-05",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        deactivationDate: "2023-01-01",
      }),
    ]);

    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "DEACTIVATION_DATE_MISMATCH"
    );
  });

  it("throws an error when the searchClient throws an error", async () => {
    searchClient.searchByBusinessName.mockResolvedValue([
      generateXrayRegistrationEntry({
        registrationNumber: "registration-2",
        deactivationDate: "2023-01-05",
      }),
      generateXrayRegistrationEntry({
        registrationNumber: "registration-1",
        deactivationDate: "2023-01-01",
      }),
    ]);
    searchClient.searchByAddress.mockRejectedValue(new Error("NO_ENTRIES_FOUND"));
    await expect(client.getStatus("Some Business", "123 Wrong Address", "00000")).rejects.toThrow(
      "NO_ENTRIES_FOUND"
    );
  });
});
