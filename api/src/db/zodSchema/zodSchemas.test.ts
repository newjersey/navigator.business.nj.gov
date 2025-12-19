import {
  generatev183Business,
  generatev183BusinessUser,
  generatev183CigaretteLicenseData,
  generatev183EnvironmentQuestionnaireData,
  generatev183FormationMember,
  generatev183LicenseDetails,
  generatev183Municipality,
  generatev183Preferences,
  generatev183TaxClearanceCertificateData,
  generatev183TaxFilingData,
  generatev183UserData,
} from "@db/migrations/v183_zod_changes";
import {
  parseUserData,
  v183FormationMemberSchema,
  v183MunicipalitySchema,
  v183PreferencesSchema,
  v183QuestionnaireDataSchema,
  v183TaxClearanceCertificateDataSchema,
  v183TaxFilingDataSchema,
  v183UserDataSchema,
} from "@db/zodSchema/zodSchemas";
import { generateUserData } from "@shared/test";
import { LogWriterType } from "@libs/logWriter";

describe("Zod Schema validation", () => {
  let safeParseSpy: jest.SpyInstance;

  beforeEach(() => {
    safeParseSpy = jest.spyOn(v183UserDataSchema, "safeParse");
  });

  afterEach(() => {
    safeParseSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("parseUserData tests", () => {
    const mockLogger: jest.Mocked<LogWriterType> = {
      LogInfo: jest.fn(),
      LogError: jest.fn(),
      GetId: jest.fn(),
    };

    const baseUserData = generateUserData({});

    it("logs success when parsing succeeds", () => {
      safeParseSpy.mockReturnValue({
        success: true,
        data: baseUserData,
      });

      parseUserData(mockLogger, baseUserData);

      expect(mockLogger.LogInfo).toHaveBeenCalledWith(
        `Parsing successful, for UserId: ${baseUserData.user.id}`,
      );

      expect(mockLogger.LogError).not.toHaveBeenCalled();
    });

    it("logs errors when parsing fails", () => {
      safeParseSpy.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ["user", "email"], message: "Invalid email" },
            { path: ["profile", "age"], message: "Required" },
          ],
        },
      });

      parseUserData(mockLogger, baseUserData);

      expect(mockLogger.LogError).toHaveBeenCalledWith(
        `Parsing failed, for UserId: ${baseUserData.user.id}, here are the issues:`,
      );

      expect(mockLogger.LogError).toHaveBeenNthCalledWith(
        2,
        `UserId: ${baseUserData.user.id} - Path: [user.email] | Message: Invalid email`,
      );
      expect(mockLogger.LogError).toHaveBeenNthCalledWith(
        3,
        `UserId: ${baseUserData.user.id} - Path: [profile.age] | Message: Required`,
      );

      expect(mockLogger.LogInfo).not.toHaveBeenCalled();
    });
  });

  describe("schema tests", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it("QuestionnaireDataSchema should pass for valid data", () => {
      const validData = generatev183EnvironmentQuestionnaireData({});

      const result = v183QuestionnaireDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("QuestionnaireDataSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v183QuestionnaireDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("MuncipialitySchema should pass for valid data", () => {
      const validData = generatev183Municipality({});

      const result = v183MunicipalitySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("MuncipialitySchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v183MunicipalitySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxFilingSchema should pass for valid data", () => {
      const validData = generatev183TaxFilingData({});

      const result = v183TaxFilingDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("TaxFilingSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v183TaxFilingDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxClearanceSchema should pass for valid data", () => {
      const validData = generatev183TaxClearanceCertificateData({});

      const result = v183TaxClearanceCertificateDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should pass for valid data", () => {
      const validData = generatev183Preferences({});

      const result = v183PreferencesSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v183PreferencesSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("FormationMemberSchema should pass for valid data", () => {
      const validData = generatev183FormationMember({});

      const result = v183FormationMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("FormationMemberSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v183FormationMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v183UserDataSchema should pass for valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev183UserData({});

      const result = v183UserDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("v183UserDataSchema should pass for  license valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev183UserData({
        businesses: {
          "123": generatev183Business({
            id: "123",
            licenseData: {
              lastUpdatedISO: "",
              licenses: {
                ["Pharmacy-Pharmacy"]: generatev183LicenseDetails({}),
              },
            },
          }),
        },
      });
      expect(() => {
        v183UserDataSchema.parse(validData);
      }).not.toThrow();
      const result = v183UserDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("UserDataSchema should not pass for invalid data", () => {
      safeParseSpy.mockRestore();
      const invalidData = {};

      const result = v183UserDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v183UserDataSchema should pass with all fields populated", () => {
      safeParseSpy.mockRestore();

      const comprehensiveLicenseData = {
        lastUpdatedISO: "2024-01-01T00:00:00.000Z",
        licenses: {
          "Pharmacy-Pharmacy": generatev183LicenseDetails({}),
          "Accountancy-Firm Registration": generatev183LicenseDetails({
            licenseStatus: "EXPIRED",
            expirationDateISO: "2023-12-31T00:00:00.000Z",
          }),
          "Health Club Services": generatev183LicenseDetails({
            licenseStatus: "PENDING",
          }),
        },
      };

      const comprehensiveEnvironmentData = {
        questionnaireData: generatev183EnvironmentQuestionnaireData({
          airOverrides: {
            emitPollutants: true,
            emitEmissions: true,
          },
          landOverrides: {
            takeOverExistingBiz: true,
          },
          wasteOverrides: {
            transportWaste: true,
          },
        }),
        submitted: true,
        emailSent: true,
      };

      const comprehensiveXrayData = {
        facilityDetails: {
          businessName: "Test Medical Facility",
          addressLine1: "123 Main St",
          addressLine2: "Suite 100",
          addressZipCode: "07001",
        },
        machines: [
          {
            name: "X-Ray Machine 1",
            registrationNumber: "XR-12345",
            roomId: "Room-A",
            registrationCategory: "Medical",
            manufacturer: "GE Healthcare",
            modelNumber: "Model-X100",
            serialNumber: "SN-98765",
            annualFee: 500,
          },
          {
            name: "X-Ray Machine 2",
            registrationNumber: "XR-67890",
            roomId: "Room-B",
            registrationCategory: "Dental",
            manufacturer: "Siemens",
            modelNumber: "Model-D200",
            serialNumber: "SN-11223",
            annualFee: 350,
          },
        ],
        status: "ACTIVE" as const,
        expirationDate: "2025-12-31",
        deactivationDate: undefined,
        lastUpdatedISO: "2024-01-01T00:00:00.000Z",
      };

      const comprehensiveBusiness = generatev183Business({
        id: "business-123",
        licenseData: comprehensiveLicenseData,
        environmentData: comprehensiveEnvironmentData,
        xrayRegistrationData: comprehensiveXrayData,
        taxClearanceCertificateData: generatev183TaxClearanceCertificateData({
          requestingAgencyId: "agency-001",
          businessName: "Comprehensive Test Business",
          addressLine1: "456 Business Ave",
          addressLine2: "Floor 5",
          addressCity: "Newark",
          addressState: {
            shortCode: "NJ",
            name: "New Jersey",
          },
          addressZipCode: "07102",
          taxId: "12-3456789",
          taxPin: "1234",
          hasPreviouslyReceivedCertificate: true,
          lastUpdatedISO: "2024-01-01T00:00:00.000Z",
        }),
        cigaretteLicenseData: generatev183CigaretteLicenseData({
          businessName: "Tobacco Shop LLC",
          responsibleOwnerName: "John Doe",
          signature: true,
          lastUpdatedISO: "2024-01-01T00:00:00.000Z",
        }),
        taskProgress: {
          "task-1": "COMPLETED",
          "task-2": "TO_DO",
          "task-3": "COMPLETED",
        },
        taskItemChecklist: {
          "checklist-item-1": true,
          "checklist-item-2": false,
          "checklist-item-3": true,
        },
      });

      const secondBusiness = generatev183Business({
        id: "business-456",
        licenseData: {
          lastUpdatedISO: "2024-02-01T00:00:00.000Z",
          licenses: {
            Telemarketers: generatev183LicenseDetails({
              licenseStatus: "ACTIVE",
            }),
          },
        },
      });

      const comprehensiveUserData = generatev183UserData({
        user: generatev183BusinessUser({
          name: "Jane Smith",
          email: "jane.smith@example.com",
          id: "user-789",
          receiveNewsletter: true,
          userTesting: true,
          receiveUpdatesAndReminders: true,
          externalStatus: {
            newsletter: {
              success: true,
              status: "SUCCESS",
            },
            userTesting: {
              success: true,
              status: "SUCCESS",
            },
          },
          myNJUserKey: "mynj-key-123",
          intercomHash: "intercom-hash-abc",
          abExperience: "ExperienceB",
          accountCreationSource: "direct",
          contactSharingWithAccountCreationPartner: true,
          phoneNumber: "555-123-4567",
        }),
        businesses: {
          "business-123": comprehensiveBusiness,
          "business-456": secondBusiness,
        },
        currentBusinessId: "business-123",
        version: 182,
        versionWhenCreated: 182,
        lastUpdatedISO: "2024-01-15T10:30:00.000Z",
        dateCreatedISO: "2023-06-01T08:00:00.000Z",
      });

      const result = v183UserDataSchema.safeParse(comprehensiveUserData);

      expect(result.success).toBe(true);
    });

    it("v183UserDataSchema should pass with only required fields (no optional data)", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev183UserData({
        user: generatev183BusinessUser({
          name: undefined, // name is optional
          myNJUserKey: undefined, // optional
          intercomHash: undefined, // optional
          phoneNumber: undefined, // optional
        }),
        businesses: {
          "business-minimal": generatev183Business({
            id: "business-minimal",
            licenseData: undefined, // optional
            environmentData: undefined, // optional
            xrayRegistrationData: undefined, // optional
            taxClearanceCertificateData: undefined, // optional
            cigaretteLicenseData: undefined, // optional
            taskProgress: {},
            taskItemChecklist: {},
          }),
        },
        currentBusinessId: "business-minimal",
      });

      const result = v183UserDataSchema.safeParse(minimalUserData);

      expect(result.success).toBe(true);
    });
  });
});
