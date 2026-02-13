import {
  v188CigaretteLicenseData,
  v188CigaretteLicensePaymentInfo,
  v188EnvironmentData,
  v188FacilityDetails,
  v188MachineDetails,
  v188QuestionnaireData,
  v188StateObject,
  v188TaxClearanceCertificateData,
  v188XrayData,
  v188XrayRegistrationStatusResponse,
  v188GetFilingResponse,
  v188FormationSubmitError,
  v188FormationSubmitResponse,
  v188FormationSigner,
  v188ForeignGoodStandingFileObject,
  v188UserTestingResponse,
  v188NewsletterResponse,
  v188ExternalStatus,
  v188CalendarEvent,
  v188LicenseSearchAddress,
  v188TaxFilingCalendarEvent,
  v188LicenseSearchNameAndAddress,
  v188TaxFilingData,
  v188LicenseDetails,
  v188Municipality,
  v188ProfileDocuments,
  v188BusinessUser,
  v188CommunityAffairsAddress,
  v188RoadmapTaskData,
  v188FormationAddress,
  v188LicenseData,
  v188Preferences,
  v188LicenseStatusItem,
  v188FormationMember,
  v188NameAvailability,
  v188NameAvailabilityResponse,
  v188IndustrySpecificData,
  v188ProfileData,
  v188FormationFormData,
  v188FormationData,
  v188Business,
  v188UserData,
  v188CrtkData,
  v188CrtkEmailMetadata,
  v188CrtkEntry,
  v188CrtkBusinessDetails,
} from "@db/migrations/v188_zod_cleanup_address_status_boolean";
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
import { UserData } from "@shared/userData";
import { z, ZodTypeAny } from "zod";

const isBase64Encoded = (str: string): boolean => {
  if (!str) return false;

  const trimmed = str.trim();

  const hasPadding = trimmed.endsWith("=") || trimmed.endsWith("==");

  const minLength = hasPadding ? 1000 : 950;

  if (trimmed.length < minLength) return false;

  const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;

  if (!base64Regex.test(trimmed)) return false;

  return trimmed.length % 4 === 0;
};

const validateAllStringsForBase64 = (
  obj: unknown,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void => {
  if (typeof obj === "string") {
    if (isBase64Encoded(obj)) {
      ctx.addIssue({
        code: "custom",
        message: `Field contains base64 encoded data which is not allowed`,
        path: path,
      });
    }
  } else if (Array.isArray(obj)) {
    for (const [index, item] of obj.entries()) {
      validateAllStringsForBase64(item, ctx, [...path, index]);
    }
  } else if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      validateAllStringsForBase64(value, ctx, [...path, key]);
    }
  }
};

export const withNoBase64Check = <T extends ZodTypeAny>(schema: T): T => {
  return schema.superRefine((val, ctx) => {
    validateAllStringsForBase64(val, ctx, []);
  }) as T;
};

export const parseUserData = (logger: LogWriterType, userData: UserData): void => {
  const schemaWithBase64Check = withNoBase64Check(v188UserDataSchema);
  const result = schemaWithBase64Check.safeParse(userData);

  if (result.success) {
    logger.LogInfo(`ZOD Parsing successful, for UserId: ${userData.user.id}`);
  } else {
    for (const issue of result.error.issues) {
      logger.LogError(
        `ZOD processing error - UserId: ${userData.user.id} - Path: [${issue.path.join(".")}] | Message: ${issue.message}`,
      );
    }
  }
};

export const v188XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v188WasteWaterFieldIdsSchema = z.enum([
  "sanitaryWaste",
  "industrialWaste",
  "localSewage",
  "septicSystem",
  "streamsRiversOrLakes",
  "needsTreatment",
  "planningConstruction",
  "stormWaterDischarge",
  "takeoverIndustrialStormWaterPermit",
  "noWasteWater",
]);

export const v188WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v188WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v188WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v188DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v188DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v188DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v188DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v188WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v188WasteDataSchema = z.object(
  Object.fromEntries(v188WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v188WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v188LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v188LandDataSchema = z.object(
  Object.fromEntries(v188LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v188LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v188AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v188AirDataSchema = z.object(
  Object.fromEntries(v188AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v188AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v188PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

export const llcBusinessSuffixSchema = z.enum([
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY",
] as const);

export const llpBusinessSuffixSchema = z.enum([
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P.",
] as const);

export const lpBusinessSuffixSchema = z.enum(["LIMITED PARTNERSHIP", "LP", "L.P."] as const);

export const corpBusinessSuffixSchema = z.enum([
  "Corporation",
  "Incorporated",
  "Company",
  "LTD",
  "CO",
  "CO.",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const);

export const nonprofitBusinessSuffixSchema = z.enum([
  "A NJ NONPROFIT CORPORATION",
  "CORPORATION",
  "INCORPORATED",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const);

export const foreignCorpBusinessSuffixSchema = z.enum([
  ...corpBusinessSuffixSchema.options,
  "P.C.",
  "P.A.",
] as const);

export const AllBusinessSuffixesSchema = [
  ...llcBusinessSuffixSchema.options,
  ...llpBusinessSuffixSchema.options,
  ...lpBusinessSuffixSchema.options,
  ...corpBusinessSuffixSchema.options,
  ...foreignCorpBusinessSuffixSchema.options,
  ...nonprofitBusinessSuffixSchema.options,
] as const;

export const v188BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v188FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v188SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v188InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v188HowToProceedOptionsSchema = z.enum([
  "DIFFERENT_NAME",
  "KEEP_NAME",
  "CANCEL_NAME",
] as const);

export const externalStatusListSchema = z.enum([
  "SUCCESS",
  "IN_PROGRESS",
  "CONNECTION_ERROR",
  "RESPONSE_ERROR",
] as const);

export const userTestingStatusListSchema = z.enum(externalStatusListSchema.options);

export const v188UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v188NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v188NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v188SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v188CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v188LicenseStatusSchema = z.enum([
  "ACTIVE",
  "PENDING",
  "UNKNOWN",
  "EXPIRED",
  "BARRED",
  "OUT_OF_BUSINESS",
  "REINSTATEMENT_PENDING",
  "CLOSED",
  "DELETED",
  "DENIED",
  "VOLUNTARY_SURRENDER",
  "WITHDRAWN",
] as const);

export const v188PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v188TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v188OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v188ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v188BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v188OperatingPhaseSchema = z.union([
  z.enum([
    "GUEST_MODE",
    "GUEST_MODE_WITH_BUSINESS_STRUCTURE",
    "GUEST_MODE_OWNING",
    "NEEDS_TO_FORM",
    "NEEDS_BUSINESS_STRUCTURE",
    "FORMED",
    "UP_AND_RUNNING",
    "UP_AND_RUNNING_OWNING",
    "REMOTE_SELLER_WORKER",
    "DOMESTIC_EMPLOYER",
  ] as const),
  z.undefined(),
]);

export const v188CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v188CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v188ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v188ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v188EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v188EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v188ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v188TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v188TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v188taskIdLicenseNameMapping = {
  "apply-for-shop-license": "Cosmetology and Hairstyling-Shop",
  "appraiser-license": "Real Estate Appraisers-Appraisal Management Company",
  "architect-license": "Architecture-Certificate of Authorization",
  "health-club-registration": "Health Club Services",
  "home-health-aide-license": "Health Care Services",
  "hvac-license": "HVACR-HVACR CE Sponsor",
  "landscape-architect-license": "Landscape Architecture-Certificate of Authorization",
  "license-massage-therapy": "Massage and Bodywork Therapy-Massage and Bodywork Employer",
  "moving-company-license": "Public Movers and Warehousemen-Public Mover and Warehouseman",
  "pharmacy-license": "Pharmacy-Pharmacy",
  "public-accountant-license": "Accountancy-Firm Registration",
  "register-accounting-firm": "Accountancy-Firm Registration",
  "register-consumer-affairs": "Home Improvement Contractors-Home Improvement Contractor",
  "ticket-broker-reseller-registration": "Ticket Brokers",
  "telemarketing-license": "Telemarketers",
} as const;

export const v188taskIdLicenseNameMappingSchema = z.object({
  "apply-for-shop-license": z.literal("Cosmetology and Hairstyling-Shop"),
  "appraiser-license": z.literal("Real Estate Appraisers-Appraisal Management Company"),
  "architect-license": z.literal("Architecture-Certificate of Authorization"),
  "health-club-registration": z.literal("Health Club Services"),
  "home-health-aide-license": z.literal("Health Care Services"),
  "hvac-license": z.literal("HVACR-HVACR CE Sponsor"),
  "landscape-architect-license": z.literal("Landscape Architecture-Certificate of Authorization"),
  "license-massage-therapy": z.literal(
    "Massage and Bodywork Therapy-Massage and Bodywork Employer",
  ),
  "moving-company-license": z.literal(
    "Public Movers and Warehousemen-Public Mover and Warehouseman",
  ),
  "pharmacy-license": z.literal("Pharmacy-Pharmacy"),
  "public-accountant-license": z.literal("Accountancy-Firm Registration"),
  "register-accounting-firm": z.literal("Accountancy-Firm Registration"),
  "register-consumer-affairs": z.literal(
    "Home Improvement Contractors-Home Improvement Contractor",
  ),
  "ticket-broker-reseller-registration": z.literal("Ticket Brokers"),
  "telemarketing-license": z.literal("Telemarketers"),
} as const);

export const v188LicenseTaskIDSchema = z.enum(
  Object.keys(v188taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v188LicenseNameSchema = z.enum(
  Object.values(v188taskIdLicenseNameMapping) as [string, ...string[]],
);
z.enum([
  "ACTIVE",
  "PENDING",
  "UNKNOWN",
  "EXPIRED",
  "BARRED",
  "OUT_OF_BUSINESS",
  "REINSTATEMENT_PENDING",
  "CLOSED",
  "DELETED",
  "DENIED",
  "VOLUNTARY_SURRENDER",
  "WITHDRAWN",
] as const);
export const v188SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v188QuestionnaireDataSchema: z.ZodType<v188QuestionnaireData> = z.object({
  air: v188AirDataSchema,
  land: v188LandDataSchema,
  waste: v188WasteDataSchema,
  drinkingWater: v188DrinkingWaterDataSchema,
  wasteWater: v188WasteWaterDataSchema,
});

export const v188MachineDetailsSchema: z.ZodType<v188MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v188XrayRegistrationStatusResponseSchema: z.ZodType<v188XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v188MachineDetailsSchema),
    status: v188XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v188FacilityDetailsSchema: z.ZodType<v188FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v188XrayDataSchema: z.ZodType<v188XrayData> = z.object({
  facilityDetails: v188FacilityDetailsSchema.optional(),
  machines: z.array(v188MachineDetailsSchema).optional(),
  status: v188XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v188CigaretteLicensePaymentInfoSchema: z.ZodType<v188CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v188StateObjectSchema: z.ZodType<v188StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v188CigaretteLicenseDataSchema: z.ZodType<v188CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v188StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v188StateObjectSchema.optional(),
  mailingAddressZipCode: z.string().optional(),
  contactName: z.string().optional(),
  contactPhoneNumber: z.string().optional(),
  contactEmail: z.string().optional(),
  salesInfoStartDate: z.string().optional(),
  salesInfoSupplier: z.array(z.string()).optional(),
  signerName: z.string().optional(),
  signerRelationship: z.string().optional(),
  signature: z.boolean().optional(),
  lastUpdatedISO: z.string().optional(),
  paymentInfo: v188CigaretteLicensePaymentInfoSchema.optional(),
});

export const v188TaxClearanceCertificateDataSchema: z.ZodType<v188TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v188StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v188EnvironmentDataSchema: z.ZodType<v188EnvironmentData> = z.object({
  questionnaireData: v188QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v188GetFilingResponseSchema: z.ZodType<v188GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v188FormationSubmitErrorSchema: z.ZodType<v188FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v188FormationSubmitResponseSchema: z.ZodType<v188FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v188FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v188FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v188SignerTitleSchema,
}) satisfies z.ZodType<v188FormationSigner>;

export const v188ForeignGoodStandingFileObjectSchema: z.ZodType<v188ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v188NameAvailabilityResponseSchema = z.object({
  status: v188NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v188NameAvailabilityResponse>;

export const v188NameAvailabilitySchema = v188NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v188NameAvailability>;

export const v188NewsletterResponseSchema: z.ZodType<v188NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v188NewsletterStatusSchema,
});

export const v188UserTestingResponseSchema: z.ZodType<v188UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v188UserTestingStatusSchema,
});

export const v188ExternalStatusSchema: z.ZodType<v188ExternalStatus> = z.object({
  newsletter: v188NewsletterResponseSchema.optional(),
  userTesting: v188UserTestingResponseSchema.optional(),
});

export const v188CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v188CalendarEvent>;

export const v188LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v188LicenseSearchAddress>;

export const v188TaxFilingCalendarEventSchema = v188CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v188TaxFilingCalendarEvent>;

export const v188LicenseSearchNameAndAddressSchema = v188LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v188LicenseSearchNameAndAddress>;

export const v188TaxFilingDataSchema: z.ZodType<v188TaxFilingData> = z.object({
  state: v188TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v188TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v188TaxFilingCalendarEventSchema),
});

export const v188MunicipalitySchema: z.ZodType<v188Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v188LicenseStatusItemSchema: z.ZodType<v188LicenseStatusItem> = z.object({
  title: z.string(),
  status: v188CheckoffStatusSchema,
});

export const v188LicenseDetailsSchema: z.ZodType<v188LicenseDetails> = z.object({
  nameAndAddress: v188LicenseSearchNameAndAddressSchema,
  licenseStatus: v188LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v188LicenseStatusItemSchema),
});

export const v188CommunityAffairsAddressSchema: z.ZodType<v188CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v188MunicipalitySchema,
});

export const v188BusinessUserSchema: z.ZodType<v188BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v188ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v188ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v188ProfileDocumentsSchema: z.ZodType<v188ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v188RoadmapTaskDataSchema: z.ZodType<v188RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v188FormationAddressSchema = z.object({
  addressLine1: z.string().max(BUSINESS_ADDRESS_LINE_1_MAX_CHAR, {
    message: `address line 1 cannot exceed ${BUSINESS_ADDRESS_LINE_1_MAX_CHAR} characters`,
  }),
  addressLine2: z.string().max(BUSINESS_ADDRESS_LINE_2_MAX_CHAR, {
    message: `address line 2 cannot exceed ${BUSINESS_ADDRESS_LINE_2_MAX_CHAR} characters`,
  }),
  addressCity: z
    .string()
    .max(BUSINESS_ADDRESS_CITY_MAX_CHAR, {
      message: `address city cannot exceed ${BUSINESS_ADDRESS_CITY_MAX_CHAR} characters`,
    })
    .optional(),
  addressState: v188StateObjectSchema.optional(),
  addressMunicipality: v188MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: z.union([v188FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v188FormationAddress>;

export const v188FormationMemberSchema = v188FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v188FormationMember>;

export const v188FormationIncorporatorSchema = z.object({
  ...v188FormationSignerSchema.shape,
  ...v188FormationAddressSchema.shape,
});

export const v188IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.union([z.boolean(), z.undefined()]),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v188CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v188CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.union([z.boolean(), z.undefined()]),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v188ConstructionTypeSchema,
  residentialConstructionType: v188ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v188EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v188EmploymentPlacementTypeSchema,
  propertyLeaseType: v188PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v188IndustrySpecificData>;

export const v188ProfileDataSchema = v188IndustrySpecificDataSchema.extend({
  businessPersona: v188BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v188MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v188ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v188ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v188OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v188CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v188ProfileData>;

export const v188FormationFormDataSchema = v188FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.union([z.boolean(), z.undefined()]),
  businessSuffix: z.union([v188BusinessSuffixSchema, z.undefined()]),
  businessTotalStock: z.string(),
  businessStartDate: z.string(), // YYYY-MM-DD
  businessPurpose: z.string(),
  withdrawals: z.string(),
  combinedInvestment: z.string(),
  dissolution: z.string(),
  canCreateLimitedPartner: z.union([z.boolean(), z.undefined()]),
  createLimitedPartnerTerms: z.string(),
  canGetDistribution: z.union([z.boolean(), z.undefined()]),
  getDistributionTerms: z.string(),
  canMakeDistribution: z.union([z.boolean(), z.undefined()]),
  makeDistributionTerms: z.string(),
  hasNonprofitBoardMembers: z.union([z.boolean(), z.undefined()]),
  nonprofitBoardMemberQualificationsSpecified: v188InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v188InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v188InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v188InFormInBylawsSchema,
  nonprofitAssetDistributionTerms: z.string(),
  additionalProvisions: z.union([z.array(z.string()), z.undefined()]),
  agentType: z.enum(["MYSELF", "AUTHORIZED_REP", "PROFESSIONAL_SERVICE"]),
  agentNumber: z.string(),
  agentName: z.string().max(AGENT_NAME_MAX_CHAR, {
    message: `agent name cannot exceed ${AGENT_NAME_MAX_CHAR} characters`,
  }),
  agentEmail: z.string().max(AGENT_EMAIL_MAX_CHAR, {
    message: `agent email cannot exceed ${AGENT_EMAIL_MAX_CHAR} characters`,
  }),
  agentOfficeAddressLine1: z.string().max(AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR, {
    message: `agent address line 1 cannot exceed ${AGENT_OFFICE_ADDRESS_LINE_1_MAX_CHAR} characters`,
  }),
  agentOfficeAddressLine2: z.string().max(AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR, {
    message: `agent address line 2 cannot exceed ${AGENT_OFFICE_ADDRESS_LINE_2_MAX_CHAR} characters`,
  }),
  agentOfficeAddressCity: z.string().max(AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR, {
    message: `agent address city cannot exceed ${AGENT_OFFICE_ADDRESS_CITY_MAX_CHAR} characters`,
  }),
  agentOfficeAddressZipCode: z.string(),
  agentUseAccountInfo: z.boolean(),
  agentUseBusinessAddress: z.boolean(),
  members: z.union([z.array(v188FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v188FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v188FormationSignerSchema), z.undefined()]),
  paymentType: v188PaymentTypeSchema,
  annualReportNotification: z.boolean(),
  corpWatchNotification: z.boolean(),
  officialFormationDocument: z.boolean(),
  certificateOfStanding: z.boolean(),
  certifiedCopyOfFormationDocument: z.boolean(),
  contactFirstName: z.string().max(CONTACT_FIRST_NAME_MAX_CHAR, {
    message: `contact first name cannot exceed ${CONTACT_FIRST_NAME_MAX_CHAR} characters`,
  }),
  contactLastName: z.string().max(CONTACT_LAST_NAME_MAX_CHAR, {
    message: `contact last name cannot exceed ${CONTACT_LAST_NAME_MAX_CHAR} characters`,
  }),
  contactPhoneNumber: z.string(),
  foreignStateOfFormation: z.union([v188StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v188ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.union([z.boolean(), z.undefined()]),
  howToProceed: v188HowToProceedOptionsSchema,
}) satisfies z.ZodType<v188FormationFormData>;

export const v188FormationDataSchema: z.ZodType<v188FormationData> = z.object({
  formationFormData: v188FormationFormDataSchema,
  businessNameAvailability: z.union([v188NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v188NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v188FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v188GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v188LicensesSchema = z.record(z.string(), v188LicenseDetailsSchema);

export const v188LicenseDataSchema: z.ZodType<v188LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v188LicensesSchema.optional(),
});

export const v188PreferencesSchema: z.ZodType<v188Preferences> = z.object({
  roadmapOpenSections: z.array(v188SectionTypeSchema),
  roadmapOpenSteps: z.array(z.number()),
  hiddenFundingIds: z.array(z.string()),
  hiddenCertificationIds: z.array(z.string()),
  visibleSidebarCards: z.array(z.string()),
  isCalendarFullView: z.boolean(),
  returnToLink: z.string(),
  isHideableRoadmapOpen: z.boolean(),
  phaseNewlyChanged: z.boolean(),
  isNonProfitFromFunding: z.boolean().optional(),
});

export const v188CrtkBusinessDetailsSchema: z.ZodType<v188CrtkBusinessDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v188CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v188CrtkEntrySchema: z.ZodType<v188CrtkEntry> = z.object({
  businessName: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  ein: z.string().optional(),
  facilityId: z.string().optional(),
  sicCode: z.string().optional(),
  naicsCode: z.string().optional(),
  naicsDescription: z.string().optional(),
  businessActivity: z.string().optional(),
  type: z.string().optional(),
  facilityStatus: z.string().optional(),
  eligibility: z.string().optional(),
  status: z.string().optional(),
  receivedDate: z.string().optional(),
});

export const v188CrtkEmailMetadataSchema: z.ZodType<v188CrtkEmailMetadata> = z.object({
  username: z.string(),
  email: z.email(),
  businessName: z.string(),
  businessStatus: z.string(),
  businessAddress: z.string(),
  industry: z.string(),
  ein: z.string(),
  naicsCode: z.string(),
  businessActivities: z.string(),
  materialOrProducts: z.string(),
});

export const v188CrtkDataSchema: z.ZodType<v188CrtkData> = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: z.union([v188CrtkBusinessDetailsSchema, z.undefined()]),
  crtkSearchResult: z.union([v188CrtkSearchResultSchema]),
  crtkEntry: v188CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v188BusinessSchema: z.ZodType<v188Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v188ProfileDataSchema,
  onboardingFormProgress: v188OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v188TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v188LicenseDataSchema, z.undefined()]),
  preferences: v188PreferencesSchema,
  taxFilingData: v188TaxFilingDataSchema,
  formationData: v188FormationDataSchema,
  environmentData: z.union([v188EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v188XrayDataSchema, z.undefined()]),
  crtkData: z.union([v188CrtkDataSchema, z.undefined()]),
  roadmapTaskData: v188RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v188TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v188CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v188UserDataSchema: z.ZodType<v188UserData> = z.object({
  user: v188BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v188BusinessSchema),
  currentBusinessId: z.string(),
});
