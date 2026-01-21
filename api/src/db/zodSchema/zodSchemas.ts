import { z, ZodTypeAny } from "zod";
import {
  v185CigaretteLicenseData,
  v185CigaretteLicensePaymentInfo,
  v185EnvironmentData,
  v185FacilityDetails,
  v185MachineDetails,
  v185QuestionnaireData,
  v185StateObject,
  v185TaxClearanceCertificateData,
  v185XrayData,
  v185XrayRegistrationStatusResponse,
  v185GetFilingResponse,
  v185FormationSubmitError,
  v185FormationSubmitResponse,
  v185FormationSigner,
  v185ForeignGoodStandingFileObject,
  v185UserTestingResponse,
  v185NewsletterResponse,
  v185ExternalStatus,
  v185CalendarEvent,
  v185LicenseSearchAddress,
  v185TaxFilingCalendarEvent,
  v185LicenseSearchNameAndAddress,
  v185TaxFilingData,
  v185LicenseDetails,
  v185Municipality,
  v185ProfileDocuments,
  v185BusinessUser,
  v185CommunityAffairsAddress,
  v185RoadmapTaskData,
  v185FormationAddress,
  v185LicenseData,
  v185Preferences,
  v185LicenseStatusItem,
  v185FormationMember,
  v185NameAvailability,
  v185NameAvailabilityResponse,
  v185IndustrySpecificData,
  v185ProfileData,
  v185FormationFormData,
  v185FormationData,
  v185Business,
  v185UserData,
} from "@db/migrations/v185_zod_base64_encoding";
import { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";
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

const isBase64Encoded = (str: string): boolean => {
  if (!str) return false;

  const trimmed = str.trim();

  // Check if string has base64 padding
  const hasPadding = trimmed.endsWith("=") || trimmed.endsWith("==");

  // If it has padding, use original threshold (20). If not, require longer length (28)
  const minLength = hasPadding ? 20 : 28;

  if (trimmed.length < minLength) return false;

  const base64Regex = /^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/;

  if (!base64Regex.test(trimmed)) return false;

  return trimmed.length % 4 === 0;
};

type Path = (string | number | "*")[];

const pathMatches = (actualPath: (string | number)[], excludePattern: Path): boolean => {
  if (actualPath.length !== excludePattern.length) {
    return false;
  }

  return excludePattern.every((segment, i) => {
    if (segment === "*") {
      return true; // wildcard matches any value
    }
    return segment === actualPath[i];
  });
};

const validateAllStringsForBase64 = (
  obj: unknown,
  ctx: z.RefinementCtx,
  path: (string | number)[],
  excludedPaths: Path[],
): void => {
  if (excludedPaths.some((p) => pathMatches(path, p))) {
    return;
  }

  if (typeof obj === "string") {
    if (isBase64Encoded(obj)) {
      ctx.addIssue({
        code: "custom",
        message: "Field contains base64 encoded data which is not allowed",
        path,
      });
    }
    return;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const index = obj.indexOf(item);
      validateAllStringsForBase64(item, ctx, [...path, index], excludedPaths);
    }
    return;
  }

  if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      validateAllStringsForBase64(value, ctx, [...path, key], excludedPaths);
    }
  }
};

const DEFAULT_EXCLUDE_PATHS: Path[] = [
  ["user", "intercomHash"],
  ["businesses", "*", "profileData", "hashedTaxId"],
  ["businesses", "*", "profileData", "encryptedTaxId"],
  ["businesses", "*", "profileData", "encryptedTaxPin"],
  ["businesses", "*", "profileData", "deptOfLaborEin"],
  ["businesses", "*", "cigaretteLicenseData", "encryptedTaxId"],
];

export const withNoBase64Check = <T extends ZodTypeAny>(
  schema: T,
  options?: {
    excludePaths?: Path[];
  },
): T =>
  schema.superRefine((val, ctx) => {
    validateAllStringsForBase64(val, ctx, [], options?.excludePaths ?? DEFAULT_EXCLUDE_PATHS);
  }) as T;

export const parseUserData = (logger: LogWriterType, userData: UserData): void => {
  const schemaWithBase64Check = withNoBase64Check(v185UserDataSchema);
  const result = schemaWithBase64Check.safeParse(userData);

  if (result.success) {
    logger.LogInfo(`Parsing successful, for UserId: ${userData.user.id}`);
  } else {
    logger.LogError(`Parsing failed, for UserId: ${userData.user.id}, here are the issues:`);
    for (const issue of result.error.issues) {
      logger.LogError(
        `UserId: ${userData.user.id} - Path: [${issue.path.join(".")}] | Message: ${issue.message}`,
      );
    }
  }
};

export const v185XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v185WasteWaterFieldIdsSchema = z.enum([
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

export const v185WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v185WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v185WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v185DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v185DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v185DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v185DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v185WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v185WasteDataSchema = z.object(
  Object.fromEntries(v185WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v185WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v185LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v185LandDataSchema = z.object(
  Object.fromEntries(v185LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v185LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v185AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v185AirDataSchema = z.object(
  Object.fromEntries(v185AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v185AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v185PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v185BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v185FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v185SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v185InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v185HowToProceedOptionsSchema = z.enum([
  "DIFFERENT_NAME",
  "KEEP_NAME",
  "CANCEL_NAME",
] as const);

export const externalStatusListSchema = z.enum([
  "SUCCESS",
  "IN_PROGRESS",
  "CONNECTION_ERROR",
] as const);

export const userTestingStatusListSchema = z.enum(externalStatusListSchema.options);

export const v185UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v185NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v185NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v185SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v185CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v185LicenseStatusSchema = z.enum([
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

export const v185PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v185TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v185OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v185ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v185BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v185OperatingPhaseSchema = z.union([
  z.enum([
    "GUEST_MODE",
    "NEEDS_TO_FORM",
    "NEEDS_BUSINESS_STRUCTURE",
    "FORMED",
    "UP_AND_RUNNING",
    "UP_AND_RUNNING_OWNING",
    "REMOTE_SELLER_WORKER",
  ] as const),
  z.undefined(),
]);

export const v185CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v185CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v185ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v185ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v185EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v185EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v185ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v185TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v185TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v185taskIdLicenseNameMapping = {
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

export const v185taskIdLicenseNameMappingSchema = z.object({
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

export const v185LicenseTaskIDSchema = z.enum(
  Object.keys(v185taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v185LicenseNameSchema = z.enum(
  Object.values(v185taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v185SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v185QuestionnaireDataSchema: z.ZodType<v185QuestionnaireData> = z.object({
  air: v185AirDataSchema,
  land: v185LandDataSchema,
  waste: v185WasteDataSchema,
  drinkingWater: v185DrinkingWaterDataSchema,
  wasteWater: v185WasteWaterDataSchema,
});

export const v185MachineDetailsSchema: z.ZodType<v185MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v185XrayRegistrationStatusResponseSchema: z.ZodType<v185XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v185MachineDetailsSchema),
    status: v185XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v185FacilityDetailsSchema: z.ZodType<v185FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v185XrayDataSchema: z.ZodType<v185XrayData> = z.object({
  facilityDetails: v185FacilityDetailsSchema.optional(),
  machines: z.array(v185MachineDetailsSchema).optional(),
  status: v185XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v185CigaretteLicensePaymentInfoSchema: z.ZodType<v185CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v185StateObjectSchema: z.ZodType<v185StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v185CigaretteLicenseDataSchema: z.ZodType<v185CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v185StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v185StateObjectSchema.optional(),
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
  paymentInfo: v185CigaretteLicensePaymentInfoSchema.optional(),
});

export const v185TaxClearanceCertificateDataSchema: z.ZodType<v185TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v185StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v185EnvironmentDataSchema: z.ZodType<v185EnvironmentData> = z.object({
  questionnaireData: v185QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v185GetFilingResponseSchema: z.ZodType<v185GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v185FormationSubmitErrorSchema: z.ZodType<v185FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v185FormationSubmitResponseSchema: z.ZodType<v185FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v185FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v185FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v185SignerTitleSchema,
}) satisfies z.ZodType<v185FormationSigner>;

export const v185ForeignGoodStandingFileObjectSchema: z.ZodType<v185ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v185NameAvailabilityResponseSchema = z.object({
  status: v185NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v185NameAvailabilityResponse>;

export const v185NameAvailabilitySchema = v185NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v185NameAvailability>;

export const v185NewsletterResponseSchema: z.ZodType<v185NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v185NewsletterStatusSchema,
});

export const v185UserTestingResponseSchema: z.ZodType<v185UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v185UserTestingStatusSchema,
});

export const v185ExternalStatusSchema: z.ZodType<v185ExternalStatus> = z.object({
  newsletter: v185NewsletterResponseSchema.optional(),
  userTesting: v185UserTestingResponseSchema.optional(),
});

export const v185CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v185CalendarEvent>;

export const v185LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v185LicenseSearchAddress>;

export const v185TaxFilingCalendarEventSchema = v185CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v185TaxFilingCalendarEvent>;

export const v185LicenseSearchNameAndAddressSchema = v185LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v185LicenseSearchNameAndAddress>;

export const v185TaxFilingDataSchema: z.ZodType<v185TaxFilingData> = z.object({
  state: v185TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v185TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v185TaxFilingCalendarEventSchema),
});

export const v185MunicipalitySchema: z.ZodType<v185Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v185LicenseStatusItemSchema: z.ZodType<v185LicenseStatusItem> = z.object({
  title: z.string(),
  status: v185CheckoffStatusSchema,
});

export const v185LicenseDetailsSchema: z.ZodType<v185LicenseDetails> = z.object({
  nameAndAddress: v185LicenseSearchNameAndAddressSchema,
  licenseStatus: v185LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v185LicenseStatusItemSchema),
});

export const v185CommunityAffairsAddressSchema: z.ZodType<v185CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v185MunicipalitySchema,
});

export const v185BusinessUserSchema: z.ZodType<v185BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v185ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v185ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v185ProfileDocumentsSchema: z.ZodType<v185ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v185RoadmapTaskDataSchema: z.ZodType<v185RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v185FormationAddressSchema = z.object({
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
  addressState: v185StateObjectSchema.optional(),
  addressMunicipality: v185MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: z.union([v185FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v185FormationAddress>;

export const v185FormationMemberSchema = v185FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v185FormationMember>;

export const v185FormationIncorporatorSchema = z.object({
  ...v185FormationSignerSchema.shape,
  ...v185FormationAddressSchema.shape,
});

export const v185IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v185CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v185CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.union([z.boolean(), z.undefined()]),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v185ConstructionTypeSchema,
  residentialConstructionType: v185ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v185EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v185EmploymentPlacementTypeSchema,
  propertyLeaseType: v185PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v185IndustrySpecificData>;

export const v185ProfileDataSchema = v185IndustrySpecificDataSchema.extend({
  businessPersona: v185BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v185MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v185ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v185ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v185OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v185CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v185ProfileData>;

export const v185FormationFormDataSchema = v185FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: z.union([v185BusinessSuffixSchema, z.undefined()]),
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
  nonprofitBoardMemberQualificationsSpecified: v185InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v185InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v185InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v185InFormInBylawsSchema,
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
  members: z.union([z.array(v185FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v185FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v185FormationSignerSchema), z.undefined()]),
  paymentType: v185PaymentTypeSchema,
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
  foreignStateOfFormation: z.union([v185StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v185ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.boolean(),
  howToProceed: v185HowToProceedOptionsSchema,
}) satisfies z.ZodType<v185FormationFormData>;

export const v185FormationDataSchema: z.ZodType<v185FormationData> = z.object({
  formationFormData: v185FormationFormDataSchema,
  businessNameAvailability: z.union([v185NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v185NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v185FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v185GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v185LicensesSchema = z.record(z.string(), v185LicenseDetailsSchema);

export const v185LicenseDataSchema: z.ZodType<v185LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v185LicensesSchema.optional(),
});

export const v185PreferencesSchema: z.ZodType<v185Preferences> = z.object({
  roadmapOpenSections: z.array(v185SectionTypeSchema),
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

export const v185BusinessSchema: z.ZodType<v185Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v185ProfileDataSchema,
  onboardingFormProgress: v185OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v185TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v185LicenseDataSchema, z.undefined()]),
  preferences: v185PreferencesSchema,
  taxFilingData: v185TaxFilingDataSchema,
  formationData: v185FormationDataSchema,
  environmentData: z.union([v185EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v185XrayDataSchema, z.undefined()]),
  roadmapTaskData: v185RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v185TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v185CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v185UserDataSchema: z.ZodType<v185UserData> = z.object({
  user: v185BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v185BusinessSchema),
  currentBusinessId: z.string(),
});
