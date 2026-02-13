import {
  generatev188Business,
  generatev188BusinessUser,
  generatev188CigaretteLicenseData,
  generatev188EnvironmentQuestionnaireData,
  generatev188FormationMember,
  generatev188LicenseDetails,
  generatev188Municipality,
  generatev188Preferences,
  generatev188TaxClearanceCertificateData,
  generatev188TaxFilingData,
  generatev188UserData,
} from "@db/migrations/v188_zod_cleanup_address_status_boolean";
import {
  parseUserData,
  v188FormationMemberSchema,
  v188MunicipalitySchema,
  v188PreferencesSchema,
  v188QuestionnaireDataSchema,
  v188TaxClearanceCertificateDataSchema,
  v188TaxFilingDataSchema,
  v188UserDataSchema,
} from "@db/zodSchema/zodSchemas";
import { LogWriterType } from "@libs/logWriter";
import {
  AGENT_EMAIL_MAX_CHAR,
  AGENT_NAME_MAX_CHAR,
  AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR,
  AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR,
  AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR,
  BUSINESS_ADDRESS_CITY_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
  BUSINESS_ADDRESS_PROVINCE_MAX_CHAR,
  CONTACT_FIRST_NAME_MAX_CHAR,
  CONTACT_LAST_NAME_MAX_CHAR,
  SIGNER_NAME_MAX_CHAR,
} from "@shared/formationData";
import { UserData } from "@businessnjgovnavigator/shared";

jest.mock("@db/zodSchema/zodSchemas", () => {
  const actual = jest.requireActual("@db/zodSchema/zodSchemas");
  return {
    ...actual,
    withNoBase64Check: jest.fn((schema) => schema),
  };
});

// Helper to generate a long base64 string that will be detected by isBase64Encoded
// The function requires strings to be at least 1000 chars (with padding) or 950 chars (without padding)
// paddingType: 'double' for ==, 'single' for =, 'none' for no padding
const generateLongBase64String = (paddingType: "double" | "single" | "none" = "double"): string => {
  const targetLength = paddingType === "none" ? 951 : 1001;

  // Create a base text
  let baseText =
    "This is test data that will be repeated many times to create a very long string. ".repeat(30);

  // Adjust the length to get the desired padding:
  // Base64 padding depends on input length % 3:
  // - length % 3 == 1: adds ==
  // - length % 3 == 2: adds =
  // - length % 3 == 0: no padding

  let targetMod = 0;
  if (paddingType === "double") targetMod = 1;
  else if (paddingType === "single") targetMod = 2;
  else targetMod = 0;

  // Keep adding characters until we get the right modulo
  while (baseText.length % 3 !== targetMod) {
    baseText += "x";
  }

  // Make sure it's long enough
  while (Buffer.from(baseText, "utf8").toString("base64").length < targetLength) {
    const additionalChars = "y".repeat(300);
    baseText += additionalChars;
    // Re-adjust for padding
    while (baseText.length % 3 !== targetMod) {
      baseText += "x";
    }
  }

  return Buffer.from(baseText, "utf8").toString("base64");
};

describe("Zod Schema validation", () => {
  let safeParseSpy: jest.SpyInstance;

  beforeEach(() => {
    safeParseSpy = jest.spyOn(v188UserDataSchema, "safeParse");
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

    beforeEach(() => {
      mockLogger.LogInfo.mockClear();
      mockLogger.LogError.mockClear();
      mockLogger.GetId.mockClear();
    });

    it("logs success when parsing succeeds", () => {
      const validUserData = generatev188UserData({});

      parseUserData(mockLogger, validUserData as unknown as UserData);

      expect(mockLogger.LogInfo).toHaveBeenCalledWith(
        `ZOD Parsing successful, for UserId: ${validUserData.user.id}`,
      );

      expect(mockLogger.LogError).not.toHaveBeenCalled();
    });

    it("logs errors when parsing fails", () => {
      const invalidUserData = {
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      };

      parseUserData(mockLogger, invalidUserData as unknown as UserData);

      expect(mockLogger.LogError).toHaveBeenCalled();
      expect(mockLogger.LogError.mock.calls[0][0]).toContain(
        `ZOD processing error - UserId: ${invalidUserData.user.id}`,
      );
      expect(mockLogger.LogInfo).not.toHaveBeenCalled();
    });
  });

  describe("schema tests", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it("QuestionnaireDataSchema should pass for valid data", () => {
      const validData = generatev188EnvironmentQuestionnaireData({});

      const result = v188QuestionnaireDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("QuestionnaireDataSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v188QuestionnaireDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("MuncipialitySchema should pass for valid data", () => {
      const validData = generatev188Municipality({});

      const result = v188MunicipalitySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("MuncipialitySchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v188MunicipalitySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxFilingSchema should pass for valid data", () => {
      const validData = generatev188TaxFilingData({});

      const result = v188TaxFilingDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("TaxFilingSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v188TaxFilingDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxClearanceSchema should pass for valid data", () => {
      const validData = generatev188TaxClearanceCertificateData({});

      const result = v188TaxClearanceCertificateDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should pass for valid data", () => {
      const validData = generatev188Preferences({});

      const result = v188PreferencesSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v188PreferencesSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("FormationMemberSchema should pass for valid data", () => {
      const validData = generatev188FormationMember({});

      const result = v188FormationMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("FormationMemberSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v188FormationMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v188UserDataSchema should pass for valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev188UserData({});

      const result = v188UserDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("v188UserDataSchema should pass for  license valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev188UserData({
        businesses: {
          "123": generatev188Business({
            id: "123",
            licenseData: {
              lastUpdatedISO: "",
              licenses: {
                ["Pharmacy-Pharmacy"]: generatev188LicenseDetails({}),
              },
            },
          }),
        },
      });
      expect(() => {
        v188UserDataSchema.parse(validData);
      }).not.toThrow();
      const result = v188UserDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("UserDataSchema should not pass for invalid data", () => {
      safeParseSpy.mockRestore();
      const invalidData = {};

      const result = v188UserDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v188UserDataSchema should pass with all fields populated", () => {
      safeParseSpy.mockRestore();

      const comprehensiveLicenseData = {
        lastUpdatedISO: "2024-01-01T00:00:00.000Z",
        licenses: {
          "Pharmacy-Pharmacy": generatev188LicenseDetails({}),
          "Accountancy-Firm Registration": generatev188LicenseDetails({
            licenseStatus: "EXPIRED",
            expirationDateISO: "2023-12-31T00:00:00.000Z",
          }),
          "Health Club Services": generatev188LicenseDetails({
            licenseStatus: "PENDING",
          }),
        },
      };

      const comprehensiveEnvironmentData = {
        questionnaireData: generatev188EnvironmentQuestionnaireData({
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

      const comprehensiveBusiness = generatev188Business({
        id: "business-123",
        licenseData: comprehensiveLicenseData,
        environmentData: comprehensiveEnvironmentData,
        xrayRegistrationData: comprehensiveXrayData,
        taxClearanceCertificateData: generatev188TaxClearanceCertificateData({
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
        cigaretteLicenseData: generatev188CigaretteLicenseData({
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

      const secondBusiness = generatev188Business({
        id: "business-456",
        licenseData: {
          lastUpdatedISO: "2024-02-01T00:00:00.000Z",
          licenses: {
            Telemarketers: generatev188LicenseDetails({
              licenseStatus: "ACTIVE",
            }),
          },
        },
      });

      const comprehensiveUserData = generatev188UserData({
        user: generatev188BusinessUser({
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

      const result = v188UserDataSchema.safeParse(comprehensiveUserData);

      expect(result.success).toBe(true);
    });

    it("v188UserDataSchema should pass with only required fields (no optional data)", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev188UserData({
        user: generatev188BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev188Business({
            id: "business-minimal",
            licenseData: undefined,
            environmentData: undefined,
            xrayRegistrationData: undefined,
            taxClearanceCertificateData: undefined,
            cigaretteLicenseData: undefined,
            taskProgress: {},
            taskItemChecklist: {},
          }),
        },
        currentBusinessId: "business-minimal",
      });

      const result = v188UserDataSchema.safeParse(minimalUserData);

      expect(result.success).toBe(true);
    });

    it("v188UserDataSchema should pass when interstate transport is not in the object", () => {
      safeParseSpy.mockRestore();

      const userDataWithoutInterstateTransport = generatev188UserData({
        user: generatev188BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev188Business({
            id: "business-minimal",
            licenseData: undefined,
            environmentData: undefined,
            xrayRegistrationData: undefined,
            taxClearanceCertificateData: undefined,
            cigaretteLicenseData: undefined,
            taskProgress: {},
            taskItemChecklist: {},
          }),
        },
        currentBusinessId: "business-minimal",
      });

      delete userDataWithoutInterstateTransport.businesses["business-minimal"].profileData
        .interstateTransport;
      expect(
        userDataWithoutInterstateTransport.businesses["business-minimal"].profileData,
      ).not.toHaveProperty("interstateTransport");
      const result = v188UserDataSchema.safeParse(userDataWithoutInterstateTransport);

      expect(result.success).toBe(true);
    });

    it("v188UserDataSchema should pass when address country is not in the object", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev188UserData({
        user: generatev188BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev188Business({
            id: "business-minimal",
            licenseData: undefined,
            environmentData: undefined,
            xrayRegistrationData: undefined,
            taxClearanceCertificateData: undefined,
            cigaretteLicenseData: undefined,
            taskProgress: {},
            taskItemChecklist: {},
          }),
        },
        currentBusinessId: "business-minimal",
      });

      const { ...formationFormDataWithoutAddressCountry } =
        minimalUserData.businesses["business-minimal"].formationData.formationFormData;
      delete formationFormDataWithoutAddressCountry.addressCountry;

      const userDataWithoutAddressCountry = {
        ...minimalUserData,
        businesses: {
          "business-minimal": {
            ...minimalUserData.businesses["business-minimal"],
            formationData: {
              ...minimalUserData.businesses["business-minimal"].formationData,
              formationFormData: formationFormDataWithoutAddressCountry,
            },
          },
        },
      };

      expect(
        userDataWithoutAddressCountry.businesses["business-minimal"].formationData
          .formationFormData,
      ).not.toHaveProperty("addressCountry");
      const result = v188UserDataSchema.safeParse(userDataWithoutAddressCountry);
      expect(result.success).toBe(true);
    });

    it("max character tests", () => {
      safeParseSpy.mockRestore();

      const userDataWithMaxOverLimits = generatev188UserData({
        user: generatev188BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev188Business({
            id: "business-minimal",
            licenseData: undefined,
            environmentData: undefined,
            xrayRegistrationData: undefined,
            taxClearanceCertificateData: undefined,
            cigaretteLicenseData: undefined,
            taskProgress: {},
            taskItemChecklist: {},
          }),
        },
        currentBusinessId: "business-minimal",
      });

      const { ...formationFormData } =
        userDataWithMaxOverLimits.businesses["business-minimal"].formationData.formationFormData;

      formationFormData.addressLine1 = "a".repeat(BUSINESS_ADDRESS_LINE_1_MAX_CHAR + 1);
      formationFormData.addressLine2 = "a".repeat(BUSINESS_ADDRESS_LINE_2_MAX_CHAR + 1);
      formationFormData.addressCity = "a".repeat(BUSINESS_ADDRESS_CITY_MAX_CHAR + 1);
      formationFormData.addressProvince = "a".repeat(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR + 1);
      formationFormData.agentEmail = "a".repeat(AGENT_EMAIL_MAX_CHAR + 1);
      formationFormData.agentName = "a".repeat(AGENT_NAME_MAX_CHAR + 1);
      formationFormData.agentOfficeAddressLine1 = "a".repeat(
        AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR + 1,
      );
      formationFormData.agentOfficeAddressLine2 = "a".repeat(
        AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR + 1,
      );
      formationFormData.agentOfficeAddressCity = "a".repeat(AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR + 1);
      formationFormData.contactFirstName = "a".repeat(CONTACT_LAST_NAME_MAX_CHAR + 1);
      formationFormData.contactLastName = "a".repeat(CONTACT_LAST_NAME_MAX_CHAR + 1);
      formationFormData.signers = [
        {
          name: "a".repeat(SIGNER_NAME_MAX_CHAR + 1),
          signature: true,
          title: "Authorized Representative",
        },
      ];

      const userDataOverMaxLimits = {
        ...userDataWithMaxOverLimits,
        businesses: {
          "business-minimal": {
            ...userDataWithMaxOverLimits.businesses["business-minimal"],
            formationData: {
              ...userDataWithMaxOverLimits.businesses["business-minimal"].formationData,
              formationFormData: formationFormData,
            },
          },
        },
      };

      const result = v188UserDataSchema.safeParse(userDataOverMaxLimits);

      expect(result?.error?.issues).toEqual(
        expect.arrayContaining([
          {
            code: "too_big",
            inclusive: true,
            maximum: BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
            message: `address line 1 cannot exceed ${BUSINESS_ADDRESS_LINE_1_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "addressLine1",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
            message: `address line 2 cannot exceed ${BUSINESS_ADDRESS_LINE_2_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "addressLine2",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: BUSINESS_ADDRESS_CITY_MAX_CHAR,
            message: `address city cannot exceed ${BUSINESS_ADDRESS_CITY_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "addressCity",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: BUSINESS_ADDRESS_PROVINCE_MAX_CHAR,
            message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "addressProvince",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR,
            message: `agent address line 1 cannot exceed ${AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "agentOfficeAddressLine1",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR,
            message: `agent address line 2 cannot exceed ${AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "agentOfficeAddressLine2",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR,
            message: `agent address city cannot exceed ${AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "agentOfficeAddressCity",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: AGENT_NAME_MAX_CHAR,
            message: `agent name cannot exceed ${AGENT_NAME_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "agentName",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: AGENT_EMAIL_MAX_CHAR,
            message: `agent email cannot exceed ${AGENT_EMAIL_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "agentEmail",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: CONTACT_FIRST_NAME_MAX_CHAR,
            message: `contact first name cannot exceed ${CONTACT_FIRST_NAME_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "contactFirstName",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: CONTACT_LAST_NAME_MAX_CHAR,
            message: `contact last name cannot exceed ${CONTACT_LAST_NAME_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "contactLastName",
            ],
          },
          {
            code: "too_big",
            inclusive: true,
            maximum: SIGNER_NAME_MAX_CHAR,
            message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
            origin: "string",
            path: [
              "businesses",
              "business-minimal",
              "formationData",
              "formationFormData",
              "signers",
              0,
              "name",
            ],
          },
        ]),
      );
    });

    it("base64 encoding tests", () => {
      safeParseSpy.mockRestore();

      const userDataWithBase64Encoding = generatev188UserData({
        user: generatev188BusinessUser({
          name: generateLongBase64String(),
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev188Business({
            id: "business-minimal",
            licenseData: undefined,
            environmentData: undefined,
            xrayRegistrationData: undefined,
            taxClearanceCertificateData: undefined,
            cigaretteLicenseData: undefined,
            taskProgress: {},
            taskItemChecklist: {},
          }),
        },
        currentBusinessId: "business-minimal",
      });

      const actual = jest.requireActual("@db/zodSchema/zodSchemas");
      const schemaWithBase64Check = actual.withNoBase64Check(actual.v188UserDataSchema);
      const result = schemaWithBase64Check.safeParse(userDataWithBase64Encoding);

      expect(result.success).toBe(false);
    });
  });

  describe("withNoBase64Check tests", () => {
    let withNoBase64Check: <T>(schema: T) => T;
    let actualv188UserDataSchema: typeof v188UserDataSchema;

    beforeEach(() => {
      jest.restoreAllMocks();
      const actual = jest.requireActual("@db/zodSchema/zodSchemas");
      withNoBase64Check = actual.withNoBase64Check;
      actualv188UserDataSchema = actual.v188UserDataSchema;
    });

    describe("valid data without base64 encoding", () => {
      it("should pass validation for normal user data", () => {
        const validUserData = generatev188UserData({
          user: generatev188BusinessUser({
            name: "John Doe",
            email: "john@example.com",
            phoneNumber: "555-123-4567",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for user data with all optional fields populated", () => {
        const validUserData = generatev188UserData({
          user: generatev188BusinessUser({
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phoneNumber: "555-987-6543",
            myNJUserKey: "mynj-key-123",
            intercomHash: "intercom-hash-abc",
          }),
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              licenseData: {
                lastUpdatedISO: "2024-01-01T00:00:00.000Z",
                licenses: {
                  "Pharmacy-Pharmacy": generatev188LicenseDetails({}),
                },
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for short strings", () => {
        const validUserData = generatev188UserData({
          user: generatev188BusinessUser({
            name: "Bob",
            email: "b@x.com",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for strings with special characters", () => {
        const validUserData = generatev188UserData({
          user: generatev188BusinessUser({
            name: "O'Brien-Smith Jr.",
            email: "obrien+test@example.com",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });
    });

    describe("base64 encoded data in various fields", () => {
      it("should fail validation for base64 in user name", () => {
        const base64Name = generateLongBase64String();
        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: base64Name,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const errorIssue = result.success ? undefined : result.error.issues[0];
        expect(errorIssue?.path).toEqual(["user", "name"]);
        expect(errorIssue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 in business name", () => {
        const base64BusinessName = generateLongBase64String();
        const userData = generatev188UserData({
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              profileData: {
                ...generatev188Business({}).profileData,
                businessName: base64BusinessName,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const issue = result.success
          ? undefined
          : result.error.issues.find(
              (issue) =>
                issue.path.includes("businesses") &&
                issue.path.includes("profileData") &&
                issue.path.includes("businessName"),
            );
        expect(issue).toBeDefined();
        expect(issue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 in formation form data address", () => {
        const base64Address = generateLongBase64String();
        const business = generatev188Business({
          id: "business-123",
        });

        const userData = generatev188UserData({
          businesses: {
            "business-123": {
              ...business,
              profileData: {
                ...business.profileData,
                notes: base64Address,
              },
            },
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const issue = result.success
          ? undefined
          : result.error.issues.find(
              (issue) => issue.path.includes("profileData") && issue.path.includes("notes"),
            );
        expect(issue).toBeDefined();
        expect(issue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 in nested cigarette license data", () => {
        const base64TradeName = generateLongBase64String();
        const userData = generatev188UserData({
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              cigaretteLicenseData: generatev188CigaretteLicenseData({
                tradeName: base64TradeName,
              }),
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const issue = result.success
          ? undefined
          : result.error.issues.find(
              (issue) =>
                issue.path.includes("cigaretteLicenseData") && issue.path.includes("tradeName"),
            );
        expect(issue).toBeDefined();
        expect(issue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 in tax clearance certificate data", () => {
        const base64BusinessName = generateLongBase64String();
        const userData = generatev188UserData({
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              taxClearanceCertificateData: generatev188TaxClearanceCertificateData({
                businessName: base64BusinessName,
              }),
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const issue = result.success
          ? undefined
          : result.error.issues.find(
              (issue) =>
                issue.path.includes("taxClearanceCertificateData") &&
                issue.path.includes("businessName"),
            );
        expect(issue).toBeDefined();
        expect(issue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 with padding (==)", () => {
        const base64WithDoublePadding = generateLongBase64String("double");
        expect(base64WithDoublePadding).toMatch(/==$/); // Ends with ==

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: base64WithDoublePadding,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should fail validation for base64 with single padding (=)", () => {
        const base64WithSinglePadding = generateLongBase64String("single");
        expect(base64WithSinglePadding).toMatch(/[^=]=$/); // Ends with single =
        expect(base64WithSinglePadding).not.toMatch(/==$/); // But not ==

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: base64WithSinglePadding,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should fail validation for long base64 encoded strings", () => {
        const base64LongString = generateLongBase64String();

        const userData = generatev188UserData({
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              profileData: {
                ...generatev188Business({}).profileData,
                notes: base64LongString,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should detect multiple base64 fields in the same object", () => {
        const base64Name = generateLongBase64String();
        const base64BusinessName = generateLongBase64String();

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: base64Name,
          }),
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              profileData: {
                ...generatev188Business({}).profileData,
                businessName: base64BusinessName,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const errorIssues = result.success ? [] : result.error.issues;
        expect(errorIssues.length).toBeGreaterThanOrEqual(2);
        expect(errorIssues.some((issue) => issue.path.includes("name"))).toBe(true);
        expect(errorIssues.some((issue) => issue.path.includes("businessName"))).toBe(true);
      });
    });

    describe("edge cases and boundary conditions", () => {
      it("should handle strings that are exactly 20 characters and not base64", () => {
        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: "Exactly 20 Chars!!",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle strings with whitespace that wraps base64", () => {
        const base64String = generateLongBase64String();
        const whitespaceWrapped = `  ${base64String}  `;

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: whitespaceWrapped,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should pass for strings that look like base64 but have wrong length", () => {
        const notBase64 = "abcdefghijklmnopqrstu";

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: notBase64,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle undefined optional fields", () => {
        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: undefined,
            myNJUserKey: undefined,
            intercomHash: undefined,
            phoneNumber: undefined,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle empty strings", () => {
        const userData = generatev188UserData({
          businesses: {
            "business-123": generatev188Business({
              id: "business-123",
              profileData: {
                ...generatev188Business({}).profileData,
                notes: "",
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should preserve original schema validation rules", () => {
        const invalidUserData = {
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        };

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(invalidUserData);

        expect(result.success).toBe(false);
      });

      it("should fail for base64 in array of strings (formation additional provisions)", () => {
        const base64Provision = generateLongBase64String();
        const business = generatev188Business({
          id: "business-123",
        });

        const userData = generatev188UserData({
          businesses: {
            "business-123": {
              ...business,
              formationData: {
                ...business.formationData,
                formationFormData: {
                  ...business.formationData.formationFormData,
                  additionalProvisions: [
                    "Normal provision text",
                    base64Provision,
                    "Another normal provision",
                  ],
                },
              },
            },
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const issue = result.success
          ? undefined
          : result.error.issues.find(
              (issue) => issue.path.includes("additionalProvisions") && issue.path.includes(1),
            );
        expect(issue).toBeDefined();
        expect(issue?.message).toContain("base64 encoded data");
      });
    });

    describe("different base64 formats", () => {
      it("should pass for URL-safe base64 with dashes and underscores (not detected as base64)", () => {
        const base64UrlSafe = "aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3QgZm9yIGJhc2U2NA";

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: base64UrlSafe,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle base64 with various character combinations", () => {
        const base64WithSpecialChars = generateLongBase64String();

        const userData = generatev188UserData({
          user: generatev188BusinessUser({
            name: base64WithSpecialChars,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualv188UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });
    });
  });
});
