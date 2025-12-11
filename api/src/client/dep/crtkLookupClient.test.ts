import { CRTKLookupClient } from "@client/dep/crtkLookupClient";
import type { CRTKSearch, CRTKStatusLookup } from "@domain/types";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";
import type { CRTKEntry } from "@shared/crtk";

const generateCRTKEntry = (overrides: Partial<CRTKEntry> = {}): CRTKEntry => ({
  businessName: "Test Business",
  streetAddress: "123 Main Street",
  city: "Springfield",
  state: "IL",
  zipCode: "12345",
  ein: "12-3456789",
  facilityId: "FAC-001",
  sicCode: "1234",
  naicsCode: "123456",
  naicsDescription: "Test Industry",
  businessActivity: "Manufacturing",
  facilityType: "Primary",
  facilityStatus: "Active",
  eligibility: "Eligible",
  userStatus: "Active",
  receivedDate: "2023-01-01",
  ...overrides,
});

describe("CRTKLookupClient", () => {
  let client: CRTKStatusLookup;
  let searchClient: jest.Mocked<CRTKSearch>;
  let logger: LogWriterType;
  let mockDate: Date;

  beforeEach(() => {
    jest.resetAllMocks();

    mockDate = new Date("2024-01-15T12:00:00.000Z");
    jest.spyOn(global, "Date").mockImplementation(() => mockDate);

    logger = DummyLogWriter;
    searchClient = {
      searchByEIN: jest.fn(),
      searchByAddress: jest.fn(),
      searchByBusinessName: jest.fn(),
    };
    client = CRTKLookupClient(searchClient, logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("searchByEIN", () => {
    it("returns CRTK data when searching by EIN and entry is found", async () => {
      const crtkEntry = generateCRTKEntry({
        businessName: "EIN Business",
        streetAddress: "456 EIN Street",
        city: "EIN City",
        zipCode: "54321",
        ein: "98-7654321",
      });

      searchClient.searchByEIN.mockResolvedValue([crtkEntry]);

      const response = await client.getStatus(
        "Some Business",
        "123 Main Street",
        "Springfield",
        "12345",
        "98-7654321",
      );

      expect(searchClient.searchByEIN).toHaveBeenCalledWith("98-7654321");
      expect(searchClient.searchByAddress).not.toHaveBeenCalled();
      expect(searchClient.searchByBusinessName).not.toHaveBeenCalled();
      expect(response).toEqual({
        lastUpdatedISO: mockDate.toISOString(),
        CRTKSearchResult: "FOUND",
        CRTKBusinessDetails: {
          businessName: "EIN Business",
          addressLine1: "456 EIN Street",
          city: "EIN City",
          addressZipCode: "54321",
        },
        CRTKEntry: crtkEntry,
      });
    });

    it("returns NOT_FOUND when searching by EIN throws NOT_FOUND error", async () => {
      searchClient.searchByEIN.mockRejectedValue(new Error("NOT_FOUND"));

      const response = await client.getStatus(
        "Some Business",
        "123 Main Street",
        "Springfield",
        "12345",
        "99-9999999",
      );

      expect(response).toEqual({
        CRTKSearchResult: "NOT_FOUND",
        CRTKBusinessDetails: {
          businessName: "Some Business",
          addressLine1: "123 Main Street",
          city: "Springfield",
          addressZipCode: "12345",
        },
        CRTKEntry: {},
        lastUpdatedISO: mockDate.toISOString(),
      });
    });

    it("throws error when searchByEIN throws non-NOT_FOUND error", async () => {
      searchClient.searchByEIN.mockRejectedValue(new Error("SERVER_ERROR"));

      await expect(
        client.getStatus("Some Business", "123 Main Street", "Springfield", "12345", "12-3456789"),
      ).rejects.toThrow("SERVER_ERROR");
    });
  });

  describe("searchByAddress and BusinessName", () => {
    it("returns CRTK data when both address and business name match", async () => {
      const matchingEntry = generateCRTKEntry({
        businessName: "Matching Business",
        streetAddress: "123 Main Street",
        city: "Springfield",
        zipCode: "12345",
      });

      searchClient.searchByAddress.mockResolvedValue([matchingEntry]);
      searchClient.searchByBusinessName.mockResolvedValue([matchingEntry]);

      const response = await client.getStatus(
        "Matching Business",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(searchClient.searchByAddress).toHaveBeenCalledWith("123 Main Street", "12345");
      expect(searchClient.searchByBusinessName).toHaveBeenCalledWith("Matching Business");
      expect(response).toEqual({
        lastUpdatedISO: mockDate.toISOString(),
        CRTKSearchResult: "FOUND",
        CRTKBusinessDetails: {
          businessName: "Matching Business",
          addressLine1: "123 Main Street",
          city: "Springfield",
          addressZipCode: "12345",
        },
        CRTKEntry: matchingEntry,
      });
    });

    it("matches entries case-insensitively for business name and address", async () => {
      const matchingEntry = generateCRTKEntry({
        businessName: "MATCHING BUSINESS",
        streetAddress: "123 MAIN STREET",
        city: "Springfield",
        zipCode: "12345",
      });

      searchClient.searchByAddress.mockResolvedValue([matchingEntry]);
      searchClient.searchByBusinessName.mockResolvedValue([
        generateCRTKEntry({
          businessName: "matching business",
          streetAddress: "123 main street",
        }),
      ]);

      const response = await client.getStatus(
        "Matching Business",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(response.CRTKSearchResult).toBe("FOUND");
      expect(response.CRTKEntry).toEqual(matchingEntry);
    });

    it("returns address results when business name does not match but address does", async () => {
      const addressEntry = generateCRTKEntry({
        businessName: "Different Business",
        streetAddress: "123 Main Street",
        zipCode: "12345",
      });

      const businessNameEntry = generateCRTKEntry({
        businessName: "Another Business",
        streetAddress: "456 Other Street",
        zipCode: "54321",
      });

      searchClient.searchByAddress.mockResolvedValue([addressEntry]);
      searchClient.searchByBusinessName.mockResolvedValue([businessNameEntry]);

      const response = await client.getStatus(
        "Some Business",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(response.CRTKSearchResult).toBe("FOUND");
      expect(response.CRTKEntry).toEqual(addressEntry);
    });

    it("returns business name results when address is empty but business name has results", async () => {
      const businessNameEntry = generateCRTKEntry({
        businessName: "Business Name Only",
        streetAddress: "789 Name Street",
      });

      searchClient.searchByAddress.mockResolvedValue([]);
      searchClient.searchByBusinessName.mockResolvedValue([businessNameEntry]);

      const response = await client.getStatus(
        "Business Name Only",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(response.CRTKSearchResult).toBe("FOUND");
      expect(response.CRTKEntry).toEqual(businessNameEntry);
    });

    it("returns NOT_FOUND when no results from either search", async () => {
      searchClient.searchByAddress.mockResolvedValue([]);
      searchClient.searchByBusinessName.mockResolvedValue([]);

      const response = await client.getStatus(
        "Nonexistent Business",
        "999 Nowhere Street",
        "Springfield",
        "99999",
      );

      expect(response).toEqual({
        CRTKSearchResult: "NOT_FOUND",
        CRTKBusinessDetails: {
          businessName: "Nonexistent Business",
          addressLine1: "999 Nowhere Street",
          city: "Springfield",
          addressZipCode: "99999",
        },
        lastUpdatedISO: mockDate.toISOString(),
        CRTKEntry: {},
      });
    });

    it("returns NOT_FOUND when searchByAddress throws NOT_FOUND error", async () => {
      searchClient.searchByAddress.mockRejectedValue(new Error("NOT_FOUND"));
      searchClient.searchByBusinessName.mockResolvedValue([]);

      const response = await client.getStatus(
        "Some Business",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(response).toEqual({
        CRTKSearchResult: "NOT_FOUND",
        CRTKBusinessDetails: {
          businessName: "Some Business",
          addressLine1: "123 Main Street",
          city: "Springfield",
          addressZipCode: "12345",
        },
        CRTKEntry: {},
        lastUpdatedISO: mockDate.toISOString(),
      });
    });

    it("throws error when searchByAddress throws non-NOT_FOUND error", async () => {
      searchClient.searchByAddress.mockRejectedValue(new Error("DATABASE_ERROR"));

      await expect(
        client.getStatus("Some Business", "123 Main Street", "Springfield", "12345"),
      ).rejects.toThrow("DATABASE_ERROR");
    });

    it("throws error when searchByBusinessName throws non-NOT_FOUND error", async () => {
      searchClient.searchByAddress.mockResolvedValue([]);
      searchClient.searchByBusinessName.mockRejectedValue(new Error("NETWORK_ERROR"));

      await expect(
        client.getStatus("Some Business", "123 Main Street", "Springfield", "12345"),
      ).rejects.toThrow("NETWORK_ERROR");
    });
  });

  describe("partial CRTK entry data", () => {
    it("uses provided business details when CRTK entry has missing fields", async () => {
      const partialEntry = generateCRTKEntry({
        businessName: undefined,
        streetAddress: undefined,
        city: undefined,
        zipCode: undefined,
      });

      searchClient.searchByAddress.mockResolvedValue([partialEntry]);
      searchClient.searchByBusinessName.mockResolvedValue([partialEntry]);

      const response = await client.getStatus(
        "Fallback Business",
        "Fallback Address",
        "Fallback City",
        "00000",
      );

      expect(response.CRTKBusinessDetails).toEqual({
        businessName: "Fallback Business",
        addressLine1: "Fallback Address",
        city: "Fallback City",
        addressZipCode: "00000",
      });
    });

    it("prefers CRTK entry data over provided business details", async () => {
      const completeEntry = generateCRTKEntry({
        businessName: "CRTK Business",
        streetAddress: "CRTK Address",
        city: "CRTK City",
        zipCode: "11111",
      });

      searchClient.searchByAddress.mockResolvedValue([completeEntry]);
      searchClient.searchByBusinessName.mockResolvedValue([completeEntry]);

      const response = await client.getStatus(
        "Input Business",
        "Input Address",
        "Input City",
        "22222",
      );

      expect(response.CRTKBusinessDetails).toEqual({
        businessName: "CRTK Business",
        addressLine1: "CRTK Address",
        city: "CRTK City",
        addressZipCode: "11111",
      });
    });
  });

  describe("multiple search results", () => {
    it("returns the first matching entry when multiple matches exist", async () => {
      const firstEntry = generateCRTKEntry({
        businessName: "First Business",
        streetAddress: "123 Main Street",
        facilityId: "FAC-001",
      });

      const secondEntry = generateCRTKEntry({
        businessName: "First Business",
        streetAddress: "123 Main Street",
        facilityId: "FAC-002",
      });

      searchClient.searchByAddress.mockResolvedValue([firstEntry, secondEntry]);
      searchClient.searchByBusinessName.mockResolvedValue([firstEntry, secondEntry]);

      const response = await client.getStatus(
        "First Business",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(response.CRTKSearchResult).toBe("FOUND");
      expect(response.CRTKEntry.facilityId).toBe("FAC-001");
    });

    it("prioritizes exact match over multiple address results", async () => {
      const exactMatch = generateCRTKEntry({
        businessName: "Exact Business",
        streetAddress: "123 Main Street",
        facilityId: "EXACT",
      });

      const addressOnlyMatch1 = generateCRTKEntry({
        businessName: "Other Business 1",
        streetAddress: "123 Main Street",
        facilityId: "ADDR-1",
      });

      const addressOnlyMatch2 = generateCRTKEntry({
        businessName: "Other Business 2",
        streetAddress: "123 Main Street",
        facilityId: "ADDR-2",
      });

      searchClient.searchByAddress.mockResolvedValue([
        addressOnlyMatch1,
        exactMatch,
        addressOnlyMatch2,
      ]);
      searchClient.searchByBusinessName.mockResolvedValue([exactMatch]);

      const response = await client.getStatus(
        "Exact Business",
        "123 Main Street",
        "Springfield",
        "12345",
      );

      expect(response.CRTKEntry.facilityId).toBe("EXACT");
    });
  });
});
