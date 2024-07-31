import {
  determineLicenseStatus,
  WebserviceLicenseStatusProcessorClient,
} from "@client/WebserviceLicenseStatusProcessorClient";
import { LicenseStatusClient, NO_MATCH_ERROR, SearchLicenseStatus } from "@domain/types";
import { parseDateWithFormat } from "@shared/dateHelpers";
import { LicenseEntity, LicenseStatusResult } from "@shared/license";
import { generateLicenseSearchNameAndAddress } from "@shared/test";
import { generateLicenseEntity } from "@test/factories";

const entityWithAddress = (address: string): LicenseEntity => {
  return generateLicenseEntity({
    checkoffStatus: "Completed",
    licenseStatus: "Active",
    addressLine1: address,
  });
};

describe("WebserviceLicenseStatusProcessorClient", () => {
  let stubLicenseStatusClient: jest.Mocked<LicenseStatusClient>;
  let searchLicenseStatus: SearchLicenseStatus;

  beforeEach(() => {
    stubLicenseStatusClient = {
      search: jest.fn(),
      health: jest.fn(),
    };

    searchLicenseStatus = WebserviceLicenseStatusProcessorClient(stubLicenseStatusClient);
  });

  it("searches for license status on name, zipcode, and license type", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateLicenseSearchNameAndAddress({
      name: "Crystal",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress, "Home improvement")).rejects.toEqual(
      new Error(NO_MATCH_ERROR)
    );
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345", "Home improvement");
  });

  it("removes leading/trailing space and business designators from search name", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateLicenseSearchNameAndAddress({
      name: " Crystal, LLC   ",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress, "Home improvement")).rejects.toEqual(
      new Error(NO_MATCH_ERROR)
    );
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345", "Home improvement");
  });

  it("returns the status license items from most recent application with matching address", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "SOME OLDER APPLICATION NUMBER",
        checklistItem: "OLDER APPLICATION",
        issueDate: "20080404 000000.000",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "Pending",
        issueDate: "20210404 000000.000",
      }),
      generateLicenseEntity({
        addressLine1: "SOMETHING ELSE",
        applicationNumber: "45678",
      }),
      generateLicenseEntity({
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Completed",
        issueDate: "20210404 000000.000",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.status).toEqual("PENDING");
    expect(result.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
        {
          title: "Item 2",
          status: "ACTIVE",
        },
      ])
    );
  });

  it("returns an expired license if that's the most recent application", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "SOME OLDER ACTIVE APPLICATION NUMBER",
        checklistItem: "OLDER ACTIVE APPLICATION",
        issueDate: "20080404 000000.000",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "Expired",
        issueDate: "20210404 000000.000",
      }),
      generateLicenseEntity({
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Completed",
        issueDate: "20210404 000000.000",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.status).toEqual("EXPIRED");
    expect(result.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
        {
          title: "Item 2",
          status: "ACTIVE",
        },
      ])
    );
  });

  it("uses dateThisStatus as the date of an entity if issueDate is undefined", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "SOME OLDER APPLICATION NUMBER WITH AN ISSUE DATE",
        checklistItem: "ACTIVE OLDER APPLICATION WITH AN ISSUE DATE",
        issueDate: "20180327 000000.000",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "Expired",
        issueDate: undefined,
        dateThisStatus: "20210405 000000.000",
        expirationDate: undefined,
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.status).toEqual("EXPIRED");
    expect(result.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
      ])
    );
  });

  it("saves expirationDate as expirationISO if it exists", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "ACTIVE",
        issueDate: undefined,
        dateThisStatus: undefined,
        expirationDate: "20210505 000000.000",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.expirationISO).toEqual(parseDateWithFormat("20210505", "YYYYMMDD").toISOString());
  });

  it("does not save the expirationDate if invalid", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "ACTIVE",
        issueDate: undefined,
        dateThisStatus: undefined,
        expirationDate: "20210",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.expirationISO).toBeUndefined();
  });

  it("does not save the expirationDate if undefined", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "ACTIVE",
        issueDate: undefined,
        dateThisStatus: undefined,
        expirationDate: undefined,
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.expirationISO).toBeUndefined();
  });

  it("uses expirationDate as the date of an entity if issueDate and dateThisStatus are undefined", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "SOME OLDER APPLICATION NUMBER WITH AN ISSUE DATE",
        checklistItem: "ACTIVE OLDER APPLICATION WITH AN ISSUE DATE",
        issueDate: "20210327 000000.000",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "Expired",
        issueDate: undefined,
        dateThisStatus: undefined,
        expirationDate: "20210505 000000.000",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.status).toEqual("EXPIRED");
    expect(result.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
      ])
    );
  });

  const queryWithAddress = async (address: string): Promise<LicenseStatusResult> => {
    return await searchLicenseStatus(
      generateLicenseSearchNameAndAddress({
        addressLine1: address,
      }),
      "Home improvement"
    );
  };

  describe("detailed address matching logic", () => {
    it("matches on address ignoring spaces and non-alphanumeric characters", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress(" 123    Main St.  ! ")]);

      const result = await queryWithAddress("123 Main St");
      expect(result.status).toEqual("ACTIVE");
    });

    it("matches on address ignoring casing", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress(" 123 MAIN ST ")]);

      const result = await queryWithAddress("123 main st");
      expect(result.status).toEqual("ACTIVE");
    });

    it("matches on address*", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress("123 MAIN ST, UNIT C")]);

      const result = await queryWithAddress("123 main st");
      expect(result.status).toEqual("ACTIVE");
    });
  });

  it("maps Completed to ACTIVE and Unchecked to PENDING", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Unchecked",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
        {
          title: "Item 2",
          status: "PENDING",
        },
      ])
    );
  });

  it("filters out Not Applicable items", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Not Applicable",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.checklistItems).toEqual([
      {
        title: "Item 1",
        status: "ACTIVE",
      },
    ]);
  });

  it("rejects with NO_MATCH when no result matches the address", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([generateLicenseEntity({}), generateLicenseEntity({})]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress, "")).rejects.toEqual(new Error(NO_MATCH_ERROR));
  });

  it("rejects when search fails", async () => {
    stubLicenseStatusClient.search.mockRejectedValue("some api error");

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress, "")).rejects.toEqual("some api error");
  });
});

describe("determineLicenseStatus", () => {
  it("returns BARRED when status is barred", () => {
    expect(determineLicenseStatus("Barred")).toBe("BARRED");
  });

  it("returns OUT_OF_BUSINESS when status is out of business", () => {
    expect(determineLicenseStatus("Out of Business")).toBe("OUT_OF_BUSINESS");
  });

  it("returns REINSTATEMENT_PENDING when status is Reinstatement Pending", () => {
    expect(determineLicenseStatus("Reinstatement Pending")).toBe("REINSTATEMENT_PENDING");
  });

  it("returns CLOSED when status is closed", () => {
    expect(determineLicenseStatus("Closed")).toBe("CLOSED");
  });

  it("returns DELETED when status is deleted", () => {
    expect(determineLicenseStatus("Deleted")).toBe("DELETED");
  });

  it("returns DENIED when status is denied", () => {
    expect(determineLicenseStatus("Denied")).toBe("DENIED");
  });

  it("returns VOLUNTARY_SURRENDER when status is Voluntary Surrender", () => {
    expect(determineLicenseStatus("Voluntary Surrender")).toBe("VOLUNTARY_SURRENDER");
  });

  it("returns WITHDRAWN when status is Withdrawn", () => {
    expect(determineLicenseStatus("Withdrawn")).toBe("WITHDRAWN");
  });

  it("returns UNKNOWN when status is not valid", () => {
    expect(determineLicenseStatus("fake status")).toBe("UNKNOWN");
  });
});
