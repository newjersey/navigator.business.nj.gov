import { LicenseStatusClient, SearchLicenseStatus } from "../types";
import { searchLicenseStatusFactory } from "./searchLicenseStatusFactory";
import { generateLicenseEntity, generateLicenseSearchCriteria } from "../factories";

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
    const searchCriteria = generateLicenseSearchCriteria({
      name: "Crystal",
      licenseType: "Home improvement",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(searchCriteria)).rejects.toEqual("NO MATCH");
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("Crystal", "12345", "Home improvement");
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

    const searchCriteria = generateLicenseSearchCriteria({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(searchCriteria);
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

    const searchCriteria = generateLicenseSearchCriteria({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(searchCriteria);
    expect(result.checklistItems).toEqual([
      {
        title: "Item 2",
        status: "ACTIVE",
      },
    ]);
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

    const searchCriteria = generateLicenseSearchCriteria({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(searchCriteria);
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

    const searchCriteria = generateLicenseSearchCriteria({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(searchCriteria);
    expect(result.checklistItems).toEqual([
      {
        title: "Item 1",
        status: "ACTIVE",
      },
    ]);
  });

  it("rejects when no result matches the address", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([generateLicenseEntity({}), generateLicenseEntity({})]);

    const searchCriteria = generateLicenseSearchCriteria({});
    await expect(searchLicenseStatus(searchCriteria)).rejects.toEqual("NO MATCH");
  });
});
