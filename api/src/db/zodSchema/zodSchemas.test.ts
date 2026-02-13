import {
  generatev187Business,
  generatev187BusinessUser,
  generatev187CigaretteLicenseData,
  generatev187EnvironmentQuestionnaireData,
  generatev187FormationMember,
  generatev187LicenseDetails,
  generatev187Municipality,
  generatev187Preferences,
  generatev187TaxClearanceCertificateData,
  generatev187TaxFilingData,
  generatev187UserData,
} from "@db/migrations/v187_add_crtk_data";
import {
  parseUserData,
  v187FormationMemberSchema,
  v187MunicipalitySchema,
  v187PreferencesSchema,
  v187QuestionnaireDataSchema,
  v187TaxClearanceCertificateDataSchema,
  v187TaxFilingDataSchema,
  v187UserDataSchema,
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

describe("Zod Schema validation", () => {
  let safeParseSpy: jest.SpyInstance;

  beforeEach(() => {
    safeParseSpy = jest.spyOn(v187UserDataSchema, "safeParse");
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
      const validUserData = generatev187UserData({});

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
      const validData = generatev187EnvironmentQuestionnaireData({});

      const result = v187QuestionnaireDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("QuestionnaireDataSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v187QuestionnaireDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("MuncipialitySchema should pass for valid data", () => {
      const validData = generatev187Municipality({});

      const result = v187MunicipalitySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("MuncipialitySchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v187MunicipalitySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxFilingSchema should pass for valid data", () => {
      const validData = generatev187TaxFilingData({});

      const result = v187TaxFilingDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("TaxFilingSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v187TaxFilingDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxClearanceSchema should pass for valid data", () => {
      const validData = generatev187TaxClearanceCertificateData({});

      const result = v187TaxClearanceCertificateDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should pass for valid data", () => {
      const validData = generatev187Preferences({});

      const result = v187PreferencesSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v187PreferencesSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("FormationMemberSchema should pass for valid data", () => {
      const validData = generatev187FormationMember({});

      const result = v187FormationMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("FormationMemberSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v187FormationMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v187UserDataSchema should pass for valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev187UserData({});

      const result = v187UserDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("v187UserDataSchema should pass for  license valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev187UserData({
        businesses: {
          "123": generatev187Business({
            id: "123",
            licenseData: {
              lastUpdatedISO: "",
              licenses: {
                ["Pharmacy-Pharmacy"]: generatev187LicenseDetails({}),
              },
            },
          }),
        },
      });
      expect(() => {
        v187UserDataSchema.parse(validData);
      }).not.toThrow();
      const result = v187UserDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("UserDataSchema should not pass for invalid data", () => {
      safeParseSpy.mockRestore();
      const invalidData = {};

      const result = v187UserDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v187UserDataSchema should pass with all fields populated", () => {
      safeParseSpy.mockRestore();

      const comprehensiveLicenseData = {
        lastUpdatedISO: "2024-01-01T00:00:00.000Z",
        licenses: {
          "Pharmacy-Pharmacy": generatev187LicenseDetails({}),
          "Accountancy-Firm Registration": generatev187LicenseDetails({
            licenseStatus: "EXPIRED",
            expirationDateISO: "2023-12-31T00:00:00.000Z",
          }),
          "Health Club Services": generatev187LicenseDetails({
            licenseStatus: "PENDING",
          }),
        },
      };

      const comprehensiveEnvironmentData = {
        questionnaireData: generatev187EnvironmentQuestionnaireData({
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

      const comprehensiveBusiness = generatev187Business({
        id: "business-123",
        licenseData: comprehensiveLicenseData,
        environmentData: comprehensiveEnvironmentData,
        xrayRegistrationData: comprehensiveXrayData,
        taxClearanceCertificateData: generatev187TaxClearanceCertificateData({
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
        cigaretteLicenseData: generatev187CigaretteLicenseData({
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

      const secondBusiness = generatev187Business({
        id: "business-456",
        licenseData: {
          lastUpdatedISO: "2024-02-01T00:00:00.000Z",
          licenses: {
            Telemarketers: generatev187LicenseDetails({
              licenseStatus: "ACTIVE",
            }),
          },
        },
      });

      const comprehensiveUserData = generatev187UserData({
        user: generatev187BusinessUser({
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

      const result = v187UserDataSchema.safeParse(comprehensiveUserData);

      expect(result.success).toBe(true);
    });

    it("v187UserDataSchema should pass with only required fields (no optional data)", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev187UserData({
        user: generatev187BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev187Business({
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

      const result = v187UserDataSchema.safeParse(minimalUserData);

      expect(result.success).toBe(true);
    });

    it("v187UserDataSchema should pass when interstate transport is not in the object", () => {
      safeParseSpy.mockRestore();

      const userDataWithoutInterstateTransport = generatev187UserData({
        user: generatev187BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev187Business({
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
      const result = v187UserDataSchema.safeParse(userDataWithoutInterstateTransport);

      expect(result.success).toBe(true);
    });

    it("v187UserDataSchema should pass when address country is not in the object", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev187UserData({
        user: generatev187BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev187Business({
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
      const result = v187UserDataSchema.safeParse(userDataWithoutAddressCountry);
      expect(result.success).toBe(true);
    });

    it("max character tests", () => {
      safeParseSpy.mockRestore();

      const userDataWithMaxOverLimits = generatev187UserData({
        user: generatev187BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev187Business({
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

      const result = v187UserDataSchema.safeParse(userDataOverMaxLimits);

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

      const userDataWithBase64Encoding = generatev187UserData({
        user: generatev187BusinessUser({
          name: Buffer.from("hello world this is a test", "utf8").toString("base64"),
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev187Business({
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
      const schemaWithBase64Check = actual.withNoBase64Check(actual.v187UserDataSchema);
      const result = schemaWithBase64Check.safeParse(userDataWithBase64Encoding);

      expect(result.success).toBe(false);
    });
  });

  describe("withNoBase64Check tests", () => {
    let withNoBase64Check: <T>(schema: T) => T;
    let actualV187UserDataSchema: typeof v187UserDataSchema;

    beforeEach(() => {
      jest.restoreAllMocks();
      const actual = jest.requireActual("@db/zodSchema/zodSchemas");
      withNoBase64Check = actual.withNoBase64Check;
      actualV187UserDataSchema = actual.v187UserDataSchema;
    });

    describe("valid data without base64 encoding", () => {
      it("should pass validation for normal user data", () => {
        const validUserData = generatev187UserData({
          user: generatev187BusinessUser({
            name: "John Doe",
            email: "john@example.com",
            phoneNumber: "555-123-4567",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for user data with all optional fields populated", () => {
        const validUserData = generatev187UserData({
          user: generatev187BusinessUser({
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phoneNumber: "555-987-6543",
            myNJUserKey: "mynj-key-123",
            intercomHash: "intercom-hash-abc",
          }),
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              licenseData: {
                lastUpdatedISO: "2024-01-01T00:00:00.000Z",
                licenses: {
                  "Pharmacy-Pharmacy": generatev187LicenseDetails({}),
                },
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for short strings", () => {
        const validUserData = generatev187UserData({
          user: generatev187BusinessUser({
            name: "Bob",
            email: "b@x.com",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for strings with special characters", () => {
        const validUserData = generatev187UserData({
          user: generatev187BusinessUser({
            name: "O'Brien-Smith Jr.",
            email: "obrien+test@example.com",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });
    });

    describe("base64 encoded data in various fields", () => {
      it("should fail validation for base64 in user name", () => {
        const base64Name = Buffer.from("this is a secret encoded name", "utf8").toString("base64");
        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: base64Name,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const errorIssue = result.success ? undefined : result.error.issues[0];
        expect(errorIssue?.path).toEqual(["user", "name"]);
        expect(errorIssue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 in business name", () => {
        const base64BusinessName = Buffer.from("secret encoded business name", "utf8").toString(
          "base64",
        );
        const userData = generatev187UserData({
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              profileData: {
                ...generatev187Business({}).profileData,
                businessName: base64BusinessName,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
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
        const base64Address = Buffer.from("encoded address data", "utf8").toString("base64");
        const business = generatev187Business({
          id: "business-123",
        });

        const userData = generatev187UserData({
          businesses: {
            "business-123": {
              ...business,
              formationData: {
                ...business.formationData,
                formationFormData: {
                  ...business.formationData.formationFormData,
                  addressLine1: base64Address,
                },
              },
            },
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
        const issue = result.success
          ? undefined
          : result.error.issues.find(
              (issue) =>
                issue.path.includes("formationData") &&
                issue.path.includes("formationFormData") &&
                issue.path.includes("addressLine1"),
            );
        expect(issue).toBeDefined();
        expect(issue?.message).toContain("base64 encoded data");
      });

      it("should fail validation for base64 in nested cigarette license data", () => {
        const base64TradeName = Buffer.from("secret encoded trade name value", "utf8").toString(
          "base64",
        );
        const userData = generatev187UserData({
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              cigaretteLicenseData: generatev187CigaretteLicenseData({
                tradeName: base64TradeName,
              }),
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
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
        const base64BusinessName = Buffer.from(
          "secret encoded certificate business",
          "utf8",
        ).toString("base64");
        const userData = generatev187UserData({
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              taxClearanceCertificateData: generatev187TaxClearanceCertificateData({
                businessName: base64BusinessName,
              }),
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
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
        const base64WithDoublePadding = Buffer.from("hello world test", "utf8").toString("base64");
        expect(base64WithDoublePadding).toContain("==");

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: base64WithDoublePadding,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should fail validation for base64 with single padding (=)", () => {
        const base64WithSinglePadding = Buffer.from("hello world tests", "utf8").toString("base64");
        expect(base64WithSinglePadding).toContain("=");
        expect(base64WithSinglePadding).not.toContain("==");

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: base64WithSinglePadding,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should fail validation for long base64 encoded strings", () => {
        const longText = "This is a very long string that will be encoded in base64. ".repeat(10);
        const base64LongString = Buffer.from(longText, "utf8").toString("base64");

        const userData = generatev187UserData({
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              profileData: {
                ...generatev187Business({}).profileData,
                notes: base64LongString,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should detect multiple base64 fields in the same object", () => {
        const base64Name = Buffer.from("secret encoded name field", "utf8").toString("base64");
        const base64BusinessName = Buffer.from("secret encoded business name", "utf8").toString(
          "base64",
        );

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: base64Name,
          }),
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              profileData: {
                ...generatev187Business({}).profileData,
                businessName: base64BusinessName,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
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
        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: "Exactly 20 Chars!!",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle strings with whitespace that wraps base64", () => {
        const base64String = Buffer.from("hello world this is a test", "utf8").toString("base64");
        const whitespaceWrapped = `  ${base64String}  `;

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: whitespaceWrapped,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should pass for strings that look like base64 but have wrong length", () => {
        const notBase64 = "abcdefghijklmnopqrstu";

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: notBase64,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle undefined optional fields", () => {
        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: undefined,
            myNJUserKey: undefined,
            intercomHash: undefined,
            phoneNumber: undefined,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle empty strings", () => {
        const userData = generatev187UserData({
          businesses: {
            "business-123": generatev187Business({
              id: "business-123",
              profileData: {
                ...generatev187Business({}).profileData,
                notes: "",
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
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

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(invalidUserData);

        expect(result.success).toBe(false);
      });

      it("should fail for base64 in array of strings (formation additional provisions)", () => {
        const base64Provision = Buffer.from("secret encoded provision text", "utf8").toString(
          "base64",
        );
        const business = generatev187Business({
          id: "business-123",
        });

        const userData = generatev187UserData({
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

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
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

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: base64UrlSafe,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle base64 with various character combinations", () => {
        const textWithSpecialChars =
          "Test@123!Special~Characters with more content to make it longer than the minimum length required for base64 detection which is 128 characters";
        const base64WithSpecialChars = Buffer.from(textWithSpecialChars, "utf8").toString("base64");

        const userData = generatev187UserData({
          user: generatev187BusinessUser({
            name: base64WithSpecialChars,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV187UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });
    });
  });
});
