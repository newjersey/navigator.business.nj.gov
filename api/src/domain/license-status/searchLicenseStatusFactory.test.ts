import { LicenseStatusClient, LicenseStatusResult, SearchLicenseStatus } from "../types";
import { searchLicenseStatusFactory } from "./searchLicenseStatusFactory";
import { generateLicenseEntity, generateNameAndAddress } from "../factories";

describe("searchLicenseStatus", () => {
  let stubLicenseStatusClient: jest.Mocked<LicenseStatusClient>;
  let searchLicenseStatus: SearchLicenseStatus;

  beforeEach(() => {
    stubLicenseStatusClient = {
      search: jest.fn(),
    };

    searchLicenseStatus = searchLicenseStatusFactory(stubLicenseStatusClient);
  });

  it("searches for license status on name, zipcode, and license type", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateNameAndAddress({
      name: "Crystal",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress, "Home improvement")).rejects.toEqual("NO_MATCH");
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345", "Home improvement");
  });

  it("removes leading/trailing space and business designators from search name", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateNameAndAddress({
      name: " Crystal, LLC   ",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress, "Home improvement")).rejects.toEqual("NO_MATCH");
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

    const nameAndAddress = generateNameAndAddress({
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

    const nameAndAddress = generateNameAndAddress({
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

    const nameAndAddress = generateNameAndAddress({
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

    const nameAndAddress = generateNameAndAddress({
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

  describe("detailed address matching logic", () => {
    const entityWithAddress = (address: string) =>
      generateLicenseEntity({
        checkoffStatus: "Completed",
        licenseStatus: "Active",
        addressLine1: address,
      });

    const queryWithAddress = async (address: string): Promise<LicenseStatusResult> =>
      await searchLicenseStatus(
        generateNameAndAddress({
          addressLine1: address,
        }),
        "Home improvement"
      );

    it("matches on address ignoring spaces and non-alphanumeric characters", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress(" 123    Main St.  ! ")]);

      expect((await queryWithAddress("123 Main St")).status).toEqual("ACTIVE");
    });

    it("matches on address ignoring casing", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress(" 123 MAIN ST ")]);

      expect((await queryWithAddress("123 Main st")).status).toEqual("ACTIVE");
    });

    it("matches on address*", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress("123 MAIN ST, UNIT C")]);

      expect((await queryWithAddress("123 main st")).status).toEqual("ACTIVE");
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

    const nameAndAddress = generateNameAndAddress({
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

    const nameAndAddress = generateNameAndAddress({
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

    const nameAndAddress = generateNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress, "")).rejects.toEqual("NO_MATCH");
  });

  it("rejects when search fails", async () => {
    stubLicenseStatusClient.search.mockRejectedValue("some api error");

    const nameAndAddress = generateNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress, "")).rejects.toEqual("some api error");
  });
});
