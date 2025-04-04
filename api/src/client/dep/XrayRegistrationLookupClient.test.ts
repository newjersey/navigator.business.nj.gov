import { XrayRegistrationLookupClient } from "@client/dep/xrayRegistrationLookupClient";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { XrayRegistrationSearch, XrayRegistrationStatusLookup } from "@shared/xray";

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
        manufacturer: "GENDEX CORP.",
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
        manufacturer: "GENDEX CORP.",
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
        manufacturer: "GENDEX CORP.",
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
        manufacturer: "GENDEX CORP.",
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
        manufacturer: "GENDEX CORP.",

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
        manufacturer: "GENDEX CORP.",

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
        manufacturer: "GENDEX CORP.",

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
        manufacturer: "GENDEX CORP.",

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
          manufacturer: "GENDEX CORP.",
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

  it("throws an error ")
});
