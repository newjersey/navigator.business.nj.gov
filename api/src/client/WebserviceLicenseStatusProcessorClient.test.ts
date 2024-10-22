import {
  determineLicenseStatus,
  WebserviceLicenseStatusProcessorClient,
} from "@client/WebserviceLicenseStatusProcessorClient";
import { LicenseStatusClient, NO_ADDRESS_MATCH_ERROR, SearchLicenseStatus } from "@domain/types";
import { parseDateWithFormat } from "@shared/dateHelpers";
import { LicenseStatusResults } from "@shared/domain-logic/licenseStatusHelpers";
import { LicenseEntity } from "@shared/license";
import { generateLicenseSearchNameAndAddress } from "@shared/test";
import { generateLicenseEntity } from "@test/factories";

const entityWithAddress = (address: string): LicenseEntity => {
  return generateLicenseEntity({
    checkoffStatus: "Completed",
    licenseStatus: "Active",
    professionName: "Pharmacy",
    licenseType: "Pharmacy",
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

  it("searches for license status on name and zipcode and receives NO_ADDRESS_MATCH_ERROR", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateLicenseSearchNameAndAddress({
      name: "Crystal",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress)).rejects.toEqual(new Error(NO_ADDRESS_MATCH_ERROR));
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345");
  });

  it("removes leading/trailing space, business designators, and sets to lowercase from search name and receives NO_ADDRESS_MATCH_ERROR", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([]);
    const nameAndAddress = generateLicenseSearchNameAndAddress({
      name: " Crystal, LLC   ",
      zipCode: "12345",
    });
    await expect(searchLicenseStatus(nameAndAddress)).rejects.toEqual(new Error(NO_ADDRESS_MATCH_ERROR));
    expect(stubLicenseStatusClient.search).toHaveBeenCalledWith("crystal", "12345");
  });

  it("returns a single application containing all relevant checklist items", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "45678",
        professionName: "Pharmacy",
        checklistItem: "Item 1",
        licenseType: "Pharmacy",
        licenseStatus: "Pending",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Completed",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
        licenseStatus: "Pending",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);

    expect(result["Pharmacy-Pharmacy"]?.licenseStatus).toEqual("PENDING");
    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual(
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

  it("returns multiple applications containing respective checklist items", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "45678",
        professionName: "Pharmacy",
        checklistItem: "Item 1",
        licenseType: "Pharmacy",
        licenseStatus: "Pending",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Completed",
        professionName: "HVACR",
        licenseType: "HVACR CE Sponsor",
        licenseStatus: "Active",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);

    expect(result["Pharmacy-Pharmacy"]?.licenseStatus).toEqual("PENDING");
    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
      ])
    );
    expect(result["HVACR-HVACR CE Sponsor"]?.licenseStatus).toEqual("ACTIVE");
    expect(result["HVACR-HVACR CE Sponsor"]?.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 2",
          status: "ACTIVE",
        },
      ])
    );
  });

  it("filter checklist items that do not have status 'Unchecked' or 'Complete'", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        professionName: "Pharmacy",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        licenseType: "Pharmacy",
        licenseStatus: "Active",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        checklistItem: "Item 2",
        checkoffStatus: "Unchecked",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
        licenseStatus: "Active",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        checklistItem: "Item 3",
        checkoffStatus: "Not Applicable",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
        licenseStatus: "Active",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        checklistItem: "Item 4",
        checkoffStatus: undefined,
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
        licenseStatus: "Active",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);

    expect(result["Pharmacy-Pharmacy"]?.checklistItems.length).toEqual(2);
    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual(
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

  it("checklist items with checkoff status 'Unchecked' should be added to application object with status 'PENDING'", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        checklistItem: "Item 1",
        checkoffStatus: "Unchecked",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
        licenseStatus: "Active",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);

    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "PENDING",
        },
      ])
    );
  });

  it("checklist items with checkoff status 'Completed' should be added to application object with status 'ACTIVE'", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
        licenseStatus: "Active",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);

    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual(
      expect.arrayContaining([
        {
          title: "Item 1",
          status: "ACTIVE",
        },
      ])
    );
  });

  it("saves expirationDate as expirationDateISO if it exists", async () => {
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
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);
    expect(result["Pharmacy-Pharmacy"]?.expirationDateISO).toEqual(
      parseDateWithFormat("20210505", "YYYYMMDD").toISOString()
    );
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
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);
    expect(result["Pharmacy-Pharmacy"]?.expirationDateISO).toBeUndefined();
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
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);
    expect(result["Pharmacy-Pharmacy"]?.expirationDateISO).toBeUndefined();
  });

  const queryWithAddress = async (address: string): Promise<LicenseStatusResults> => {
    return await searchLicenseStatus(
      generateLicenseSearchNameAndAddress({
        addressLine1: address,
      })
    );
  };

  describe("detailed address matching logic", () => {
    it("matches on address ignoring spaces and non-alphanumeric characters", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress(" 123    Main St.  ! ")]);

      const result = await queryWithAddress("123 Main St");
      expect(result["Pharmacy-Pharmacy"]?.licenseStatus).toEqual("ACTIVE");
    });

    it("matches on address ignoring casing", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress(" 123 MAIN ST ")]);

      const result = await queryWithAddress("123 main st");
      expect(result["Pharmacy-Pharmacy"]?.licenseStatus).toEqual("ACTIVE");
    });

    it("matches on address*", async () => {
      stubLicenseStatusClient.search.mockResolvedValue([entityWithAddress("123 MAIN ST, UNIT C")]);

      const result = await queryWithAddress("123 main st");
      expect(result["Pharmacy-Pharmacy"]?.licenseStatus).toEqual("ACTIVE");
    });
  });

  it("maps Completed to ACTIVE and Unchecked to PENDING", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 1",
        checkoffStatus: "Completed",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Unchecked",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);
    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual(
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
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
      generateLicenseEntity({
        addressLine1: "1234 Main St",
        applicationNumber: "12345",
        checklistItem: "Item 2",
        checkoffStatus: "Not Applicable",
        professionName: "Pharmacy",
        licenseType: "Pharmacy",
      }),
    ]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({
      addressLine1: "1234 Main St",
    });

    const result = await searchLicenseStatus(nameAndAddress);
    expect(result["Pharmacy-Pharmacy"]?.checklistItems).toEqual([
      {
        title: "Item 1",
        status: "ACTIVE",
      },
    ]);
  });

  it("rejects with NO_ADDRESS_MATCH_ERROR when no result matches the address", async () => {
    stubLicenseStatusClient.search.mockResolvedValue([generateLicenseEntity({}), generateLicenseEntity({})]);

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress)).rejects.toEqual(new Error(NO_ADDRESS_MATCH_ERROR));
  });

  it("rejects when search fails", async () => {
    stubLicenseStatusClient.search.mockRejectedValue("some api error");

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    await expect(searchLicenseStatus(nameAndAddress)).rejects.toEqual("some api error");
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
});
