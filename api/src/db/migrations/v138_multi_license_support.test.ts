import {
  generatev137Business,
  generatev137LicenseData,
  generatev137LicenseSearchNameAndAddress,
  generatev137LicenseStatusItem,
  generatev137ProfileData,
  v137TaskProgress,
} from "@db/migrations/v137_add_employment_placement_personal_types";
import {
  migrate_v137Business_to_v138Business,
  v138LicenseName,
} from "@db/migrations/v138_multi_license_support";

describe("v138_multi_license_support", () => {
  const initialTaskProgress: Record<string, v137TaskProgress> = {
    "non-license-task-progress": "COMPLETED",
    "apply-for-shop-license": "COMPLETED",
    "appraiser-license": "COMPLETED",
    "architect-license": "COMPLETED",
    "health-club-registration": "COMPLETED",
    "home-health-aide-license": "COMPLETED",
    "hvac-license": "COMPLETED",
    "landscape-architect-license": "COMPLETED",
    "license-massage-therapy": "COMPLETED",
    "moving-company-license": "COMPLETED",
    "pharmacy-license": "COMPLETED",
    "public-accountant-license": "COMPLETED",
    "register-accounting-firm": "COMPLETED",
    "register-consumer-affairs": "COMPLETED",
    "ticket-broker-reseller-registration": "COMPLETED",
    "telemarketing-license": "COMPLETED",
  };

  const initialLicenseData = generatev137LicenseData({
    nameAndAddress: generatev137LicenseSearchNameAndAddress({
      name: "business name",
      addressLine1: "123 main st",
      addressLine2: "apt 1",
      zipCode: "12345",
    }),
    completedSearch: true,
    items: [
      generatev137LicenseStatusItem({
        title: "checklist title 1",
        status: "ACTIVE",
      }),
    ],
    status: "PENDING",
    lastUpdatedISO: "some-last-updated-date",
    expirationISO: "some-expiration-date",
  });

  it("returns business when there is no license data", () => {
    const initialBusiness = generatev137Business({
      taskProgress: initialTaskProgress,
      licenseData: undefined,
      profileData: generatev137ProfileData({ industryId: "health-care-services-firm-renewal" }),
    });

    const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

    expect(updatedBusiness).toEqual(initialBusiness);
  });

  it.each([
    {
      industryId: "health-care-services-firm-renewal",
      licenseName: "Health Care Services",
      taskId: "home-health-aide-license",
    },
    {
      industryId: "cosmetology",
      licenseName: "Cosmetology and Hairstyling-Shop",
      taskId: "apply-for-shop-license",
    },
    {
      industryId: "pharmacy",
      licenseName: "Pharmacy-Pharmacy",
      taskId: "pharmacy-license",
    },
    {
      industryId: "certified-public-accountant",
      licenseName: "Accountancy-Firm Registration",
      taskId: "register-accounting-firm",
    },
    {
      industryId: "massage-therapy",
      licenseName: "Massage and Bodywork Therapy-Massage and Bodywork Employer",
      taskId: "license-massage-therapy",
    },
    {
      industryId: "telemarketing",
      licenseName: "Telemarketers",
      taskId: "telemarketing-license",
    },
    {
      industryId: "health-club",
      licenseName: "Health Club Services",
      taskId: "health-club-registration",
    },
    {
      industryId: "retail",
      licenseName: "Ticket Brokers",
      taskId: "ticket-broker-reseller-registration",
    },
  ])("correctly updates the license data by saving license details", (args) => {
    const initialBusiness = generatev137Business({
      taskProgress: initialTaskProgress,
      licenseData: initialLicenseData,
      profileData: generatev137ProfileData({ industryId: args.industryId }),
    });

    const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

    expect(updatedBusiness.taskProgress).toEqual({
      "non-license-task-progress": "COMPLETED",
      [args.taskId]: "COMPLETED",
    });

    expect(updatedBusiness.licenseData?.lastUpdatedISO).toEqual(initialBusiness.licenseData?.lastUpdatedISO);

    const updatedLicenseDetails =
      updatedBusiness.licenseData?.licenses?.[args.licenseName as v138LicenseName];
    expect(updatedLicenseDetails?.nameAndAddress).toEqual(initialBusiness.licenseData?.nameAndAddress);
    expect(updatedLicenseDetails?.licenseStatus).toBe(initialBusiness.licenseData?.status);
    expect(updatedLicenseDetails?.expirationDateISO).toBe(initialBusiness.licenseData?.expirationISO);
    expect(updatedLicenseDetails?.lastUpdatedISO).toBe(initialBusiness.licenseData?.lastUpdatedISO);
    expect(updatedLicenseDetails?.checklistItems).toEqual(initialBusiness.licenseData?.items);
    expect(updatedLicenseDetails?.hasError).toBeFalsy();
  });

  it.each([
    {
      industryId: "moving-company",
      taskId: "moving-company-license",
    },
    {
      industryId: "architecture",
      taskId: "architect-license",
    },
    {
      industryId: "hvac-contractor",
      taskId: "hvac-license",
    },
    {
      industryId: "landscape-architecture",
      taskId: "landscape-architect-license",
    },
  ])(
    "correctly updates the license data by removing license detail for tasks where license search is removed",
    (args) => {
      const initialBusiness = generatev137Business({
        taskProgress: initialTaskProgress,
        licenseData: initialLicenseData,
        profileData: generatev137ProfileData({ industryId: args.industryId }),
      });

      const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

      expect(updatedBusiness.taskProgress).toEqual({
        "non-license-task-progress": "COMPLETED",
        [args.taskId]: "NOT_STARTED",
      });

      expect(updatedBusiness.licenseData).toBeUndefined();
    }
  );

  it("correctly updates the license data and changes register-consumer-affairs taskprogress key to register-home-contractor", () => {
    const industryId = "home-contractor";
    const licenseName = "Home Improvement Contractors-Home Improvement Contractor";
    const taskId = "register-home-contractor";

    const initialBusiness = generatev137Business({
      taskProgress: initialTaskProgress,
      licenseData: initialLicenseData,
      profileData: generatev137ProfileData({ industryId: industryId }),
    });

    const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

    expect(updatedBusiness.taskProgress).toEqual({
      "non-license-task-progress": "COMPLETED",
      [taskId]: "COMPLETED",
    });

    expect(updatedBusiness.licenseData?.lastUpdatedISO).toEqual(initialBusiness.licenseData?.lastUpdatedISO);

    const updatedLicenseDetails = updatedBusiness.licenseData?.licenses?.[licenseName as v138LicenseName];
    expect(updatedLicenseDetails?.nameAndAddress).toEqual(initialBusiness.licenseData?.nameAndAddress);
    expect(updatedLicenseDetails?.licenseStatus).toBe(initialBusiness.licenseData?.status);
    expect(updatedLicenseDetails?.expirationDateISO).toBe(initialBusiness.licenseData?.expirationISO);
    expect(updatedLicenseDetails?.lastUpdatedISO).toBe(initialBusiness.licenseData?.lastUpdatedISO);
    expect(updatedLicenseDetails?.checklistItems).toEqual(initialBusiness.licenseData?.items);
    expect(updatedLicenseDetails?.hasError).toBeFalsy();
  });

  it("correctly updates register-consumer-affairs taskprogress key to register-home-contractor when license data is undefined", () => {
    const industryId = "home-contractor";
    const taskId = "register-home-contractor";

    const initialBusiness = generatev137Business({
      taskProgress: initialTaskProgress,
      licenseData: undefined,
      profileData: generatev137ProfileData({ industryId: industryId }),
    });

    const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

    expect(updatedBusiness.taskProgress).toEqual({
      "non-license-task-progress": "COMPLETED",
      [taskId]: "COMPLETED",
    });

    expect(updatedBusiness.licenseData).toBeUndefined();
  });

  it("correctly updates the license data and changes appraiser-license taskprogress key to appraiser-company-register", () => {
    const industryId = "real-estate-appraisals";
    const licenseName = "Real Estate Appraisers-Appraisal Management Company";
    const taskId = "appraiser-company-register";

    const initialBusiness = generatev137Business({
      taskProgress: initialTaskProgress,
      licenseData: initialLicenseData,
      profileData: generatev137ProfileData({ industryId: industryId }),
    });

    const updatedBusiness = migrate_v137Business_to_v138Business(initialBusiness);

    expect(updatedBusiness.taskProgress).toEqual({
      "non-license-task-progress": "COMPLETED",
      [taskId]: "COMPLETED",
    });

    expect(updatedBusiness.licenseData?.lastUpdatedISO).toEqual(initialBusiness.licenseData?.lastUpdatedISO);

    const updatedLicenseDetails = updatedBusiness.licenseData?.licenses?.[licenseName as v138LicenseName];
    expect(updatedLicenseDetails?.nameAndAddress).toEqual(initialBusiness.licenseData?.nameAndAddress);
    expect(updatedLicenseDetails?.licenseStatus).toBe(initialBusiness.licenseData?.status);
    expect(updatedLicenseDetails?.expirationDateISO).toBe(initialBusiness.licenseData?.expirationISO);
    expect(updatedLicenseDetails?.lastUpdatedISO).toBe(initialBusiness.licenseData?.lastUpdatedISO);
    expect(updatedLicenseDetails?.checklistItems).toEqual(initialBusiness.licenseData?.items);
    expect(updatedLicenseDetails?.hasError).toBe(false);
  });
});
