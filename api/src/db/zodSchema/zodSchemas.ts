import type {
  v194FacilityDetails,
  v194MachineDetails,
  v194QuestionnaireData,
  v194StateObject,
  v194TaxClearanceCertificateData,
  v194XrayData,
  v194XrayRegistrationStatusResponse,
  v194GetFilingResponse,
  v194FormationSubmitError,
  v194FormationSubmitResponse,
  v194FormationSigner,
  v194ForeignGoodStandingFileObject,
  v194UserTestingResponse,
  v194NewsletterResponse,
  v194ExternalStatus,
  v194CalendarEvent,
  v194LicenseSearchAddress,
  v194TaxFilingCalendarEvent,
  v194LicenseSearchNameAndAddress,
  v194TaxFilingData,
  v194LicenseDetails,
  v194Municipality,
  v194ProfileDocuments,
  v194BusinessUser,
  v194CommunityAffairsAddress,
  v194RoadmapTaskData,
  v194FormationAddress,
  v194LicenseData,
  v194Preferences,
  v194LicenseStatusItem,
  v194FormationMember,
  v194NameAvailability,
  v194NameAvailabilityResponse,
  v194IndustrySpecificData,
  v194ProfileData,
  v194FormationFormData,
  v194FormationData,
  v194Business,
  v194UserData,
  v194CrtkData,
  v194CrtkEmailMetadata,
  v194CrtkEntry,
  v194CrtkBusinessDetails,
  v194CigaretteLicensePaymentInfo,
  v194CigaretteLicenseData,
  v194EnvironmentData,
} from "@db/migrations/v194_rotate_or_reset_foreign_kms_fields";
import { type LogWriterType } from "@libs/logWriter";
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
import { type UserData } from "@shared/userData";
import { z, type ZodTypeAny } from "zod";

// Zod 4.4 requires an explicit optional wrapper to accept omitted object keys.
// Keep the legacy migration type as a required property whose value may be undefined.
const optionalUndefined = <Schema extends z.ZodType>(
  schema: Schema,
): z.ZodType<z.output<Schema> | undefined, z.input<Schema> | undefined> => {
  return schema.optional();
};

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
  const schemaWithBase64Check = withNoBase64Check(v194UserDataSchema);
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

export const v194XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v194WasteWaterFieldIdsSchema = z.enum([
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

export const v194WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v194WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v194WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v194DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v194DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v194DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v194DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v194WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v194WasteDataSchema = z.object(
  Object.fromEntries(v194WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v194WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v194LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v194LandDataSchema = z.object(
  Object.fromEntries(v194LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v194LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v194AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v194AirDataSchema = z.object(
  Object.fromEntries(v194AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v194AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v194PaymentTypeSchema = optionalUndefined(z.enum(["CC", "ACH"]));

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

export const v194BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v194FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v194SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v194InFormInBylawsSchema = optionalUndefined(z.enum(["IN_BYLAWS", "IN_FORM"]));

export const v194HowToProceedOptionsSchema = z.enum([
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

export const v194UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v194NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v194NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v194SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v194CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v194LicenseStatusSchema = z.enum([
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

export const v194PropertyLeaseTypeSchema = optionalUndefined(
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
);

export const v194TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v194OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v194ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v194BusinessPersonaSchema = optionalUndefined(
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
);
export const v194OperatingPhaseSchema = optionalUndefined(
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
);

export const v194CannabisLicenseTypeSchema = optionalUndefined(z.enum(["CONDITIONAL", "ANNUAL"]));
export const v194CarServiceTypeSchema = optionalUndefined(
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
);
export const v194ConstructionTypeSchema = optionalUndefined(
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
);
export const v194ResidentialConstructionTypeSchema = optionalUndefined(
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
);
export const v194EmploymentAndPersonnelServicesTypeSchema = optionalUndefined(
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
);
export const v194EmploymentPlacementTypeSchema = optionalUndefined(
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
);

export const v194ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v194TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v194TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v194taskIdLicenseNameMapping = {
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

export const v194taskIdLicenseNameMappingSchema = z.object({
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

export const v194LicenseTaskIDSchema = z.enum(
  Object.keys(v194taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v194LicenseNameSchema = z.enum(
  Object.values(v194taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v194SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v194QuestionnaireDataSchema: z.ZodType<v194QuestionnaireData> = z.object({
  air: v194AirDataSchema,
  land: v194LandDataSchema,
  waste: v194WasteDataSchema,
  drinkingWater: v194DrinkingWaterDataSchema,
  wasteWater: v194WasteWaterDataSchema,
});

export const v194MachineDetailsSchema: z.ZodType<v194MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v194XrayRegistrationStatusResponseSchema: z.ZodType<v194XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v194MachineDetailsSchema),
    status: v194XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v194FacilityDetailsSchema: z.ZodType<v194FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v194XrayDataSchema: z.ZodType<v194XrayData> = z.object({
  facilityDetails: v194FacilityDetailsSchema.optional(),
  machines: z.array(v194MachineDetailsSchema).optional(),
  status: v194XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v194CigaretteLicensePaymentInfoSchema: z.ZodType<v194CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailSent: z.boolean().optional(),
  });

export const v194StateObjectSchema: z.ZodType<v194StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v194CigaretteLicenseDataSchema: z.ZodType<v194CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v194StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v194StateObjectSchema.optional(),
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
  paymentInfo: v194CigaretteLicensePaymentInfoSchema.optional(),
});

export const v194TaxClearanceCertificateDataSchema: z.ZodType<v194TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: optionalUndefined(z.string()),
    businessName: optionalUndefined(z.string()),
    addressLine1: optionalUndefined(z.string()),
    addressLine2: optionalUndefined(z.string()),
    addressCity: optionalUndefined(z.string()),
    addressState: v194StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: optionalUndefined(z.string()),
    encryptedTaxId: optionalUndefined(z.string()),
    taxPin: optionalUndefined(z.string()),
    encryptedTaxPin: optionalUndefined(z.string()),
    hasPreviouslyReceivedCertificate: optionalUndefined(z.boolean()),
    lastUpdatedISO: optionalUndefined(z.string()),
  });

export const v194EnvironmentDataSchema: z.ZodType<v194EnvironmentData> = z.object({
  questionnaireData: v194QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v194GetFilingResponseSchema: z.ZodType<v194GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v194FormationSubmitErrorSchema: z.ZodType<v194FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v194FormationSubmitResponseSchema: z.ZodType<v194FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: optionalUndefined(z.string()),
  formationId: optionalUndefined(z.string()),
  redirect: optionalUndefined(z.string()),
  errors: z.array(v194FormationSubmitErrorSchema),
  lastUpdatedISO: optionalUndefined(z.string()),
});

export const v194FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v194SignerTitleSchema,
}) satisfies z.ZodType<v194FormationSigner>;

export const v194ForeignGoodStandingFileObjectSchema: z.ZodType<v194ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v194NameAvailabilityResponseSchema = z.object({
  status: optionalUndefined(v194NameAvailabilityStatusSchema),
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v194NameAvailabilityResponse>;

export const v194NameAvailabilitySchema = v194NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v194NameAvailability>;

export const v194NewsletterResponseSchema: z.ZodType<v194NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v194NewsletterStatusSchema,
});

export const v194UserTestingResponseSchema: z.ZodType<v194UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v194UserTestingStatusSchema,
});

export const v194ExternalStatusSchema: z.ZodType<v194ExternalStatus> = z.object({
  newsletter: v194NewsletterResponseSchema.optional(),
  userTesting: v194UserTestingResponseSchema.optional(),
});

export const v194CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v194CalendarEvent>;

export const v194LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v194LicenseSearchAddress>;

export const v194TaxFilingCalendarEventSchema = v194CalendarEventSchema
  .extend({
    identifier: z.string(),
    calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
  })
  .readonly() satisfies z.ZodType<v194TaxFilingCalendarEvent>;

export const v194LicenseSearchNameAndAddressSchema = v194LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v194LicenseSearchNameAndAddress>;

export const v194TaxFilingDataSchema: z.ZodType<v194TaxFilingData> = z.object({
  state: v194TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v194TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v194TaxFilingCalendarEventSchema),
});

export const v194MunicipalitySchema: z.ZodType<v194Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v194LicenseStatusItemSchema: z.ZodType<v194LicenseStatusItem> = z.object({
  title: z.string(),
  status: v194CheckoffStatusSchema,
});

export const v194LicenseDetailsSchema: z.ZodType<v194LicenseDetails> = z.object({
  nameAndAddress: v194LicenseSearchNameAndAddressSchema,
  licenseStatus: v194LicenseStatusSchema,
  expirationDateISO: optionalUndefined(z.string()),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v194LicenseStatusItemSchema),
});

export const v194CommunityAffairsAddressSchema: z.ZodType<v194CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v194MunicipalitySchema,
});

export const v194BusinessUserSchema: z.ZodType<v194BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v194ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v194ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v194ProfileDocumentsSchema: z.ZodType<v194ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v194RoadmapTaskDataSchema: z.ZodType<v194RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v194FormationAddressSchema = z.object({
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
  addressState: v194StateObjectSchema.optional(),
  addressMunicipality: v194MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: optionalUndefined(v194FormationBusinessLocationTypeSchema),
}) satisfies z.ZodType<v194FormationAddress>;

export const v194FormationMemberSchema = v194FormationAddressSchema
  .extend({
    name: z.string(),
  })
  .readonly() satisfies z.ZodType<v194FormationMember>;

export const v194FormationIncorporatorSchema = z
  .object({
    ...v194FormationSignerSchema.shape,
    ...v194FormationAddressSchema.shape,
  })
  .readonly();

export const v194IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: optionalUndefined(z.boolean()),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v194CannabisLicenseTypeSchema,
  cannabisMicrobusiness: optionalUndefined(z.boolean()),
  constructionRenovationPlan: optionalUndefined(z.boolean()),
  carService: v194CarServiceTypeSchema,
  interstateTransport: optionalUndefined(z.boolean()),
  interstateLogistics: optionalUndefined(z.boolean()),
  interstateMoving: optionalUndefined(z.boolean()),
  isChildcareForSixOrMore: optionalUndefined(z.boolean()),
  petCareHousing: optionalUndefined(z.boolean()),
  willSellPetCareItems: optionalUndefined(z.boolean()),
  constructionType: v194ConstructionTypeSchema,
  residentialConstructionType: v194ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v194EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v194EmploymentPlacementTypeSchema,
  propertyLeaseType: v194PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: optionalUndefined(z.boolean()),
  publicWorksContractor: optionalUndefined(z.boolean()),
}) satisfies z.ZodType<v194IndustrySpecificData>;

export const v194ProfileDataSchema = v194IndustrySpecificDataSchema.extend({
  businessPersona: v194BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: optionalUndefined(z.string()),
  legalStructureId: optionalUndefined(z.string()),
  municipality: optionalUndefined(v194MunicipalitySchema),
  dateOfFormation: optionalUndefined(z.string()),
  entityId: optionalUndefined(z.string()),
  employerId: optionalUndefined(z.string()),
  taxId: optionalUndefined(z.string()),
  hashedTaxId: optionalUndefined(z.string()),
  encryptedTaxId: optionalUndefined(z.string()),
  notes: z.string(),
  documents: v194ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: optionalUndefined(z.string()),
  taxPin: optionalUndefined(z.string()),
  encryptedTaxPin: optionalUndefined(z.string()),
  sectorId: optionalUndefined(z.string()),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v194ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v194OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), optionalUndefined(z.boolean())),
  elevatorOwningBusiness: optionalUndefined(z.boolean()),
  communityAffairsAddress: v194CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: optionalUndefined(z.boolean()),
  raffleBingoGames: optionalUndefined(z.boolean()),
  businessOpenMoreThanTwoYears: optionalUndefined(z.boolean()),
  employerAccessRegistration: optionalUndefined(z.boolean()),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v194ProfileData>;

export const v194FormationFormDataSchema = v194FormationAddressSchema
  .extend({
    businessName: z.string(),
    businessNameConfirmation: optionalUndefined(z.boolean()),
    businessSuffix: optionalUndefined(v194BusinessSuffixSchema),
    businessTotalStock: z.string(),
    businessStartDate: z.string(), // YYYY-MM-DD
    businessPurpose: z.string(),
    withdrawals: z.string(),
    combinedInvestment: z.string(),
    dissolution: z.string(),
    canCreateLimitedPartner: optionalUndefined(z.boolean()),
    createLimitedPartnerTerms: z.string(),
    canGetDistribution: optionalUndefined(z.boolean()),
    getDistributionTerms: z.string(),
    canMakeDistribution: optionalUndefined(z.boolean()),
    makeDistributionTerms: z.string(),
    hasNonprofitBoardMembers: optionalUndefined(z.boolean()),
    nonprofitBoardMemberQualificationsSpecified: v194InFormInBylawsSchema,
    nonprofitBoardMemberQualificationsTerms: z.string(),
    nonprofitBoardMemberRightsSpecified: v194InFormInBylawsSchema,
    nonprofitBoardMemberRightsTerms: z.string(),
    nonprofitTrusteesMethodSpecified: v194InFormInBylawsSchema,
    nonprofitTrusteesMethodTerms: z.string(),
    nonprofitAssetDistributionSpecified: v194InFormInBylawsSchema,
    nonprofitAssetDistributionTerms: z.string(),
    additionalProvisions: optionalUndefined(z.array(z.string())),
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
    members: optionalUndefined(z.array(v194FormationMemberSchema)),
    incorporators: optionalUndefined(z.array(v194FormationIncorporatorSchema)),
    signers: optionalUndefined(z.array(v194FormationSignerSchema.readonly())),
    paymentType: v194PaymentTypeSchema,
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
    foreignStateOfFormation: optionalUndefined(v194StateObjectSchema),
    foreignDateOfFormation: optionalUndefined(z.string()), // YYYY-MM-DD
    foreignGoodStandingFile: optionalUndefined(v194ForeignGoodStandingFileObjectSchema),
    legalType: z.string(),
    willPracticeLaw: optionalUndefined(z.boolean()),
    isVeteranNonprofit: optionalUndefined(z.boolean()),
    checkNameReservation: optionalUndefined(z.boolean()),
    howToProceed: v194HowToProceedOptionsSchema,
  })
  .readonly() satisfies z.ZodType<v194FormationFormData>;

export const v194FormationDataSchema: z.ZodType<v194FormationData> = z.object({
  formationFormData: v194FormationFormDataSchema,
  businessNameAvailability: optionalUndefined(v194NameAvailabilitySchema),
  dbaBusinessNameAvailability: optionalUndefined(v194NameAvailabilitySchema),
  formationResponse: optionalUndefined(v194FormationSubmitResponseSchema),
  getFilingResponse: optionalUndefined(v194GetFilingResponseSchema),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v194LicensesSchema = z.object(
  Object.fromEntries(
    v194LicenseNameSchema.options.map((name) => [name, v194LicenseDetailsSchema.optional()]),
  ) as Record<string, z.ZodOptional<typeof v194LicenseDetailsSchema>>,
);

export const v194LicenseDataSchema: z.ZodType<v194LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v194LicensesSchema.optional(),
});

export const v194PreferencesSchema: z.ZodType<v194Preferences> = z.object({
  roadmapOpenSections: z.array(v194SectionTypeSchema),
  roadmapOpenSteps: z.array(z.number()),
  visibleSidebarCards: z.array(z.string()),
  isCalendarFullView: z.boolean(),
  returnToLink: z.string(),
  isHideableRoadmapOpen: z.boolean(),
  phaseNewlyChanged: z.boolean(),
  isNonProfitFromFunding: z.boolean().optional(),
});

export const v194CrtkBusinessDetailsSchema: z.ZodType<v194CrtkBusinessDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v194CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v194CrtkEntrySchema: z.ZodType<v194CrtkEntry> = z.object({
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

export const v194CrtkEmailMetadataSchema: z.ZodType<v194CrtkEmailMetadata> = z.object({
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

export const v194CrtkDataSchema: z.ZodType<v194CrtkData> = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: v194CrtkBusinessDetailsSchema.optional(),
  crtkSearchResult: z.union([v194CrtkSearchResultSchema]),
  crtkEntry: v194CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v194BusinessSchema: z.ZodType<v194Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v194ProfileDataSchema,
  onboardingFormProgress: v194OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v194TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: optionalUndefined(v194LicenseDataSchema),
  preferences: v194PreferencesSchema,
  taxFilingData: v194TaxFilingDataSchema,
  formationData: v194FormationDataSchema,
  environmentData: optionalUndefined(v194EnvironmentDataSchema),
  xrayRegistrationData: optionalUndefined(v194XrayDataSchema),
  crtkData: optionalUndefined(v194CrtkDataSchema),
  roadmapTaskData: v194RoadmapTaskDataSchema,
  taxClearanceCertificateData: optionalUndefined(v194TaxClearanceCertificateDataSchema),
  cigaretteLicenseData: optionalUndefined(v194CigaretteLicenseDataSchema),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v194UserDataSchema: z.ZodType<v194UserData> = z.object({
  user: v194BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v194BusinessSchema),
  currentBusinessId: z.string(),
});
