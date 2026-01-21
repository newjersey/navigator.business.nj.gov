import {
  generatev185Business,
  generatev185BusinessUser,
  generatev185CigaretteLicenseData,
  generatev185EnvironmentQuestionnaireData,
  generatev185FormationMember,
  generatev185LicenseDetails,
  generatev185Municipality,
  generatev185Preferences,
  generatev185TaxClearanceCertificateData,
  generatev185TaxFilingData,
  generatev185UserData,
} from "@db/migrations/v185_zod_base64_encoding";
import {
  parseUserData,
  v185FormationMemberSchema,
  v185MunicipalitySchema,
  v185PreferencesSchema,
  v185QuestionnaireDataSchema,
  v185TaxClearanceCertificateDataSchema,
  v185TaxFilingDataSchema,
  v185UserDataSchema,
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
    safeParseSpy = jest.spyOn(v185UserDataSchema, "safeParse");
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
      const validUserData = generatev185UserData({});

      parseUserData(mockLogger, validUserData as unknown as UserData);

      expect(mockLogger.LogInfo).toHaveBeenCalledWith(
        `Parsing successful, for UserId: ${validUserData.user.id}`,
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
        `Parsing failed, for UserId: ${invalidUserData.user.id}`,
      );
      expect(mockLogger.LogInfo).not.toHaveBeenCalled();
    });
  });

  describe("schema tests", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it("QuestionnaireDataSchema should pass for valid data", () => {
      const validData = generatev185EnvironmentQuestionnaireData({});

      const result = v185QuestionnaireDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("QuestionnaireDataSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v185QuestionnaireDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("MuncipialitySchema should pass for valid data", () => {
      const validData = generatev185Municipality({});

      const result = v185MunicipalitySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("MuncipialitySchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v185MunicipalitySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxFilingSchema should pass for valid data", () => {
      const validData = generatev185TaxFilingData({});

      const result = v185TaxFilingDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("TaxFilingSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v185TaxFilingDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("TaxClearanceSchema should pass for valid data", () => {
      const validData = generatev185TaxClearanceCertificateData({});

      const result = v185TaxClearanceCertificateDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should pass for valid data", () => {
      const validData = generatev185Preferences({});

      const result = v185PreferencesSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("PreferencesSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v185PreferencesSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("FormationMemberSchema should pass for valid data", () => {
      const validData = generatev185FormationMember({});

      const result = v185FormationMemberSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("FormationMemberSchema should not pass for invalid data", () => {
      const invalidData = {};

      const result = v185FormationMemberSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v185UserDataSchema should pass for valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev185UserData({});

      const result = v185UserDataSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it("v185UserDataSchema should pass for  license valid data", () => {
      safeParseSpy.mockRestore();
      const validData = generatev185UserData({
        businesses: {
          "123": generatev185Business({
            id: "123",
            licenseData: {
              lastUpdatedISO: "",
              licenses: {
                ["Pharmacy-Pharmacy"]: generatev185LicenseDetails({}),
              },
            },
          }),
        },
      });
      expect(() => {
        v185UserDataSchema.parse(validData);
      }).not.toThrow();
      const result = v185UserDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("UserDataSchema should not pass for invalid data", () => {
      safeParseSpy.mockRestore();
      const invalidData = {};

      const result = v185UserDataSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("v185UserDataSchema should pass with all fields populated", () => {
      safeParseSpy.mockRestore();

      const comprehensiveLicenseData = {
        lastUpdatedISO: "2024-01-01T00:00:00.000Z",
        licenses: {
          "Pharmacy-Pharmacy": generatev185LicenseDetails({}),
          "Accountancy-Firm Registration": generatev185LicenseDetails({
            licenseStatus: "EXPIRED",
            expirationDateISO: "2023-12-31T00:00:00.000Z",
          }),
          "Health Club Services": generatev185LicenseDetails({
            licenseStatus: "PENDING",
          }),
        },
      };

      const comprehensiveEnvironmentData = {
        questionnaireData: generatev185EnvironmentQuestionnaireData({
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

      const comprehensiveBusiness = generatev185Business({
        id: "business-123",
        licenseData: comprehensiveLicenseData,
        environmentData: comprehensiveEnvironmentData,
        xrayRegistrationData: comprehensiveXrayData,
        taxClearanceCertificateData: generatev185TaxClearanceCertificateData({
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
        cigaretteLicenseData: generatev185CigaretteLicenseData({
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

      const secondBusiness = generatev185Business({
        id: "business-456",
        licenseData: {
          lastUpdatedISO: "2024-02-01T00:00:00.000Z",
          licenses: {
            Telemarketers: generatev185LicenseDetails({
              licenseStatus: "ACTIVE",
            }),
          },
        },
      });

      const comprehensiveUserData = generatev185UserData({
        user: generatev185BusinessUser({
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

      const result = v185UserDataSchema.safeParse(comprehensiveUserData);

      expect(result.success).toBe(true);
    });

    it("v185UserDataSchema should pass with only required fields (no optional data)", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev185UserData({
        user: generatev185BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev185Business({
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

      const result = v185UserDataSchema.safeParse(minimalUserData);

      expect(result.success).toBe(true);
    });

    it("v185UserDataSchema should pass when interstate transport is not in the object", () => {
      safeParseSpy.mockRestore();

      const userDataWithoutInterstateTransport = generatev185UserData({
        user: generatev185BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev185Business({
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
      const result = v185UserDataSchema.safeParse(userDataWithoutInterstateTransport);

      expect(result.success).toBe(true);
    });

    it("v185UserDataSchema should pass when address country is not in the object", () => {
      safeParseSpy.mockRestore();

      const minimalUserData = generatev185UserData({
        user: generatev185BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev185Business({
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
      const result = v185UserDataSchema.safeParse(userDataWithoutAddressCountry);
      expect(result.success).toBe(true);
    });

    it("max character tests", () => {
      safeParseSpy.mockRestore();

      const userDataWithMaxOverLimits = generatev185UserData({
        user: generatev185BusinessUser({
          name: undefined,
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev185Business({
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

      const result = v185UserDataSchema.safeParse(userDataOverMaxLimits);

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

      const userDataWithBase64Encoding = generatev185UserData({
        user: generatev185BusinessUser({
          name: Buffer.from("hello world this is a test", "utf8").toString("base64"),
          myNJUserKey: undefined,
          intercomHash: undefined,
          phoneNumber: undefined,
        }),
        businesses: {
          "business-minimal": generatev185Business({
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
      const schemaWithBase64Check = actual.withNoBase64Check(actual.v185UserDataSchema);
      const result = schemaWithBase64Check.safeParse(userDataWithBase64Encoding);

      expect(result.success).toBe(false);
    });
  });

  describe("withNoBase64Check tests", () => {
    let withNoBase64Check: <T>(schema: T) => T;
    let actualV185UserDataSchema: typeof v185UserDataSchema;

    beforeEach(() => {
      jest.restoreAllMocks();
      const actual = jest.requireActual("@db/zodSchema/zodSchemas");
      withNoBase64Check = actual.withNoBase64Check;
      actualV185UserDataSchema = actual.v185UserDataSchema;
    });

    describe("valid data without base64 encoding", () => {
      it("should pass validation for normal user data", () => {
        const validUserData = generatev185UserData({
          user: generatev185BusinessUser({
            name: "John Doe",
            email: "john@example.com",
            phoneNumber: "555-123-4567",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for user data with all optional fields populated", () => {
        const validUserData = generatev185UserData({
          user: generatev185BusinessUser({
            name: "Jane Smith",
            email: "jane.smith@example.com",
            phoneNumber: "555-987-6543",
            myNJUserKey: "mynj-key-123",
            intercomHash: "intercom-hash-abc",
          }),
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              licenseData: {
                lastUpdatedISO: "2024-01-01T00:00:00.000Z",
                licenses: {
                  "Pharmacy-Pharmacy": generatev185LicenseDetails({}),
                },
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for short strings", () => {
        const validUserData = generatev185UserData({
          user: generatev185BusinessUser({
            name: "Bob",
            email: "b@x.com",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });

      it("should pass validation for strings with special characters", () => {
        const validUserData = generatev185UserData({
          user: generatev185BusinessUser({
            name: "O'Brien-Smith Jr.",
            email: "obrien+test@example.com",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(validUserData);

        expect(result.success).toBe(true);
      });
    });

    describe("base64 encoded data in various fields", () => {
      it("should fail validation for base64 in user name", () => {
        const base64Name = Buffer.from("this is a secret encoded name", "utf8").toString("base64");
        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: base64Name,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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
        const userData = generatev185UserData({
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              profileData: {
                ...generatev185Business({}).profileData,
                businessName: base64BusinessName,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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
        const business = generatev185Business({
          id: "business-123",
        });

        const userData = generatev185UserData({
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

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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
        const userData = generatev185UserData({
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              cigaretteLicenseData: generatev185CigaretteLicenseData({
                tradeName: base64TradeName,
              }),
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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
        const userData = generatev185UserData({
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              taxClearanceCertificateData: generatev185TaxClearanceCertificateData({
                businessName: base64BusinessName,
              }),
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: base64WithDoublePadding,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should fail validation for base64 with single padding (=)", () => {
        const base64WithSinglePadding = Buffer.from("hello world tests", "utf8").toString("base64");
        expect(base64WithSinglePadding).toContain("=");
        expect(base64WithSinglePadding).not.toContain("==");

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: base64WithSinglePadding,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should fail validation for long base64 encoded strings", () => {
        const longText = "This is a very long string that will be encoded in base64. ".repeat(10);
        const base64LongString = Buffer.from(longText, "utf8").toString("base64");

        const userData = generatev185UserData({
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              profileData: {
                ...generatev185Business({}).profileData,
                notes: base64LongString,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should detect multiple base64 fields in the same object", () => {
        const base64Name = Buffer.from("secret encoded name field", "utf8").toString("base64");
        const base64BusinessName = Buffer.from("secret encoded business name", "utf8").toString(
          "base64",
        );

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: base64Name,
          }),
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              profileData: {
                ...generatev185Business({}).profileData,
                businessName: base64BusinessName,
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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
        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: "Exactly 20 Chars!!",
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle strings with whitespace that wraps base64", () => {
        const base64String = Buffer.from("hello world this is a test", "utf8").toString("base64");
        const whitespaceWrapped = `  ${base64String}  `;

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: whitespaceWrapped,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });

      it("should pass for strings that look like base64 but have wrong length", () => {
        const notBase64 = "abcdefghijklmnopqrstu";

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: notBase64,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle undefined optional fields", () => {
        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: undefined,
            myNJUserKey: undefined,
            intercomHash: undefined,
            phoneNumber: undefined,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle empty strings", () => {
        const userData = generatev185UserData({
          businesses: {
            "business-123": generatev185Business({
              id: "business-123",
              profileData: {
                ...generatev185Business({}).profileData,
                notes: "",
              },
            }),
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(invalidUserData);

        expect(result.success).toBe(false);
      });

      it("should fail for base64 in array of strings (formation additional provisions)", () => {
        const base64Provision = Buffer.from("secret encoded provision text", "utf8").toString(
          "base64",
        );
        const business = generatev185Business({
          id: "business-123",
        });

        const userData = generatev185UserData({
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

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
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

      it("should pass for base64 if on the exclusion lists", () => {
        const base64Provision = Buffer.from("secret encoded provision text", "utf8").toString(
          "base64",
        );
        const business = generatev185Business({
          id: "business-123",
        });

        const business2 = generatev185Business({
          id: "business-345",
        });

        const userData = generatev185UserData({
          user: generatev185BusinessUser({ intercomHash: base64Provision }),
          businesses: {
            "business-123": {
              ...business,
              cigaretteLicenseData: generatev185CigaretteLicenseData({
                encryptedTaxId: base64Provision,
              }),
              profileData: {
                ...business.profileData,
                encryptedTaxId: base64Provision,
                encryptedTaxPin: base64Provision,
                hashedTaxId: base64Provision,
                deptOfLaborEin: base64Provision,
                foreignBusinessTypeIds: ["transactionsInNJ", "employeeOrContractorInNJ"],
              },
              formationData: {
                ...business.formationData,
                formationFormData: {
                  ...business.formationData.formationFormData,
                  additionalProvisions: ["Normal provision text", "Another normal provision"],
                },
              },
            },
            "business-345": {
              ...business2,
              cigaretteLicenseData: generatev185CigaretteLicenseData({
                encryptedTaxId: base64Provision,
              }),
              profileData: {
                ...business.profileData,
                encryptedTaxId: base64Provision,
                encryptedTaxPin: base64Provision,
                hashedTaxId: base64Provision,
                deptOfLaborEin: base64Provision,
              },
              formationData: {
                ...business2.formationData,
                formationFormData: {
                  ...business2.formationData.formationFormData,
                  additionalProvisions: ["Normal provision text", "Another normal provision"],
                },
              },
            },
          },
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);
        expect(result.success).toEqual(true);
      });
    });

    describe("different base64 formats", () => {
      it("should pass for URL-safe base64 with dashes and underscores (not detected as base64)", () => {
        const base64UrlSafe = "aGVsbG8gd29ybGQgdGhpcyBpcyBhIHRlc3QgZm9yIGJhc2U2NA";

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: base64UrlSafe,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(true);
      });

      it("should handle base64 with various character combinations", () => {
        const textWithSpecialChars = "Test@123!Special~Characters";
        const base64WithSpecialChars = Buffer.from(textWithSpecialChars, "utf8").toString("base64");

        const userData = generatev185UserData({
          user: generatev185BusinessUser({
            name: base64WithSpecialChars,
          }),
        });

        const schemaWithBase64Check = withNoBase64Check(actualV185UserDataSchema);
        const result = schemaWithBase64Check.safeParse(userData);

        expect(result.success).toBe(false);
      });
    });
  });
});
