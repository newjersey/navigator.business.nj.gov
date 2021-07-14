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
    await expect(searchLicenseStatus(nameAndAddress, "Home improvement")).rejects.toEqual("NO MATCH");
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345", "Home improvement");
  });

  it("removes leading/trailing space and business designators from search name", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateNameAndAddress({
      name: " Crystal, LLC   ",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress, "Home improvement")).rejects.toEqual("NO MATCH");
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345", "Home improvement");
  });

  it("returns the status license items with matching address line 1", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "Pending",
      }),
      generateLicenseEntity({
        addressLine1: "SOMETHING ELSE",
        applicationNumber: "45678",
      }),
      generateLicenseEntity({
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Completed",
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

  it("returns the license items with matching address line 1 that is not Expired", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseStatus: "Expired",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "45678",
        checklistItem: "Item 2",
        checkoffStatus: "Completed",
        licenseStatus: "Active",
      }),
    ]);

    const nameAndAddress = generateNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress, "Home improvement");
    expect(result.checklistItems).toEqual([
      {
        title: "Item 2",
        status: "ACTIVE",
      },
    ]);
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

  it("rejects when no result matches the address", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([generateLicenseEntity({}), generateLicenseEntity({})]);

    const nameAndAddress = generateNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress, "")).rejects.toEqual("NO MATCH");
  });
});
