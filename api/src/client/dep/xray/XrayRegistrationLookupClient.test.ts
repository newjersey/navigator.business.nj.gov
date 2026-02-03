import { XrayRegistrationLookupClient } from "@client/dep/xray/XrayRegistrationLookupClient";
import type { XrayRegistrationSearch, XrayRegistrationStatusLookup } from "@domain/types";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";
import { getCurrentDate } from "@shared/dateHelpers";
import { generateXrayRegistrationEntry } from "@test/factories";

describe("xrayRegistrationLookupClient", () => {
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
    const expirationDate = getCurrentDate().add(2, "month").format("MM/DD/YYYY");
    const businessOneEntry = generateXrayRegistrationEntry({
      name: "machine-1",
      modelNumber: "modelNumber-1",
      serialNumber: "serialNumber-1",
      businessName: "Business One",
      streetAddress: "123 Main Street",
      zipCode: "12345",
      registrationNumber: "123456",
      status: "Active",
    });

    const businessTwoEntry = generateXrayRegistrationEntry({
      name: "someMachine-2",
      modelNumber: "modelNumber-2",
      serialNumber: "serialNumber-2",
      businessName: "Business Two",
      streetAddress: "123 Main Street",
      zipCode: "12345",
      registrationNumber: "654321",
    });

    searchClient.searchByAddress.mockResolvedValue([
      businessOneEntry,
      businessOneEntry,
      businessOneEntry,
      businessTwoEntry,
      businessTwoEntry,
    ]);

    searchClient.searchByBusinessName.mockResolvedValue([businessOneEntry, businessOneEntry]);

    const response = await client.getStatus("Business One", "123 Main Street", "12345");
    expect(response).toEqual({
      machines: [
        {
          registrationNumber: businessOneEntry.registrationNumber,
          roomId: businessOneEntry.roomId,
          registrationCategory: businessOneEntry.registrationCategory,
          name: businessOneEntry.name,
          modelNumber: businessOneEntry.modelNumber,
          serialNumber: businessOneEntry.serialNumber,
          annualFee: businessOneEntry.annualFee,
        },
      ],
      status: "ACTIVE",
      expirationDate,
      deactivationDate: businessOneEntry.deactivationDate,
    });
  });

  it("returns empty registration data when the searchClient throws a NOT_FOUND error", async () => {
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
    searchClient.searchByAddress.mockRejectedValue(new Error("NOT_FOUND"));
    const response = await client.getStatus("Some Business", "123 Wrong Address", "00000");
    expect(response).toEqual({
      machines: [],
      status: undefined,
      expirationDate: undefined,
      deactivationDate: undefined,
    });
  });

  it("throws an STATUS_MISMATCH error when there are entries with different status", async () => {
    const entryOne = generateXrayRegistrationEntry({
      registrationNumber: "registration-1",
      status: "ACTIVE",
    });

    const entryTwo = generateXrayRegistrationEntry({
      registrationNumber: "registration-2",
      status: "EXPIRED",
    });

    searchClient.searchByAddress.mockResolvedValue([entryOne, entryTwo]);

    searchClient.searchByBusinessName.mockResolvedValue([entryTwo, entryOne]);

    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "STATUS_MISMATCH",
    );
  });

  it("throws an EXPIRATION_DATE_MISMATCH error when entries have different expiration date", async () => {
    const entryOne = generateXrayRegistrationEntry({
      registrationNumber: "registration-1",
      expirationDate: "2023-01-01",
    });

    const entryTwo = generateXrayRegistrationEntry({
      registrationNumber: "registration-2",
      expirationDate: "2023-01-05",
    });

    searchClient.searchByAddress.mockResolvedValue([entryOne, entryTwo]);

    searchClient.searchByBusinessName.mockResolvedValue([entryOne, entryTwo]);

    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "EXPIRATION_DATE_MISMATCH",
    );
  });

  it("throws an DEACTIVATION_DATE_MISMATCH error when entries have different deactivation dates", async () => {
    const entryOne = generateXrayRegistrationEntry({
      registrationNumber: "registration-1",
      deactivationDate: "2023-01-01",
    });

    const entryTwo = generateXrayRegistrationEntry({
      registrationNumber: "registration-2",
      deactivationDate: "2023-01-05",
    });

    searchClient.searchByAddress.mockResolvedValue([entryOne, entryTwo]);

    searchClient.searchByBusinessName.mockResolvedValue([entryOne, entryTwo]);

    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "DEACTIVATION_DATE_MISMATCH",
    );
  });

  it("throws an errow when searchClient throws an error", async () => {
    searchClient.searchByAddress.mockRejectedValue(new Error("SOME ERROR"));
    await expect(client.getStatus("Some Business", "123 Main Street", "12345")).rejects.toThrow(
      "SOME ERROR",
    );
  });

  it("modifies the status to expired when expiration date is in the past and original status is active", async () => {
    const expirationDate = getCurrentDate().subtract(2, "month").format("MM/DD/YYYY");
    const businessOneEntry = generateXrayRegistrationEntry({
      name: "machine-1",
      modelNumber: "modelNumber-1",
      serialNumber: "serialNumber-1",
      businessName: "Business One",
      streetAddress: "123 Main Street",
      zipCode: "12345",
      registrationNumber: "123456",
      status: "Active",
      expirationDate,
    });

    const businessTwoEntry = generateXrayRegistrationEntry({
      name: "someMachine-2",
      modelNumber: "modelNumber-2",
      serialNumber: "serialNumber-2",
      businessName: "Business Two",
      streetAddress: "123 Main Street",
      zipCode: "12345",
      registrationNumber: "654321",
    });

    searchClient.searchByAddress.mockResolvedValue([
      businessOneEntry,
      businessOneEntry,
      businessOneEntry,
      businessTwoEntry,
      businessTwoEntry,
    ]);

    searchClient.searchByBusinessName.mockResolvedValue([businessOneEntry, businessOneEntry]);

    const response = await client.getStatus("Business One", "123 Main Street", "12345");
    expect(response).toEqual({
      machines: [
        {
          registrationNumber: businessOneEntry.registrationNumber,
          roomId: businessOneEntry.roomId,
          registrationCategory: businessOneEntry.registrationCategory,
          name: businessOneEntry.name,
          modelNumber: businessOneEntry.modelNumber,
          serialNumber: businessOneEntry.serialNumber,
          annualFee: businessOneEntry.annualFee,
        },
      ],
      status: "EXPIRED",
      expirationDate,
      deactivationDate: businessOneEntry.deactivationDate,
    });
  });
});
