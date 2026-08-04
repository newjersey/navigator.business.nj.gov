import type {
  v193FacilityDetails,
  v193MachineDetails,
  v193QuestionnaireData,
  v193StateObject,
  v193TaxClearanceCertificateData,
  v193XrayData,
  v193XrayRegistrationStatusResponse,
  v193GetFilingResponse,
  v193FormationSubmitError,
  v193FormationSubmitResponse,
  v193FormationSigner,
  v193ForeignGoodStandingFileObject,
  v193UserTestingResponse,
  v193NewsletterResponse,
  v193ExternalStatus,
  v193CalendarEvent,
  v193LicenseSearchAddress,
  v193TaxFilingCalendarEvent,
  v193LicenseSearchNameAndAddress,
  v193TaxFilingData,
  v193LicenseDetails,
  v193Municipality,
  v193ProfileDocuments,
  v193BusinessUser,
  v193CommunityAffairsAddress,
  v193RoadmapTaskData,
  v193FormationAddress,
  v193LicenseData,
  v193Preferences,
  v193LicenseStatusItem,
  v193FormationMember,
  v193NameAvailability,
  v193NameAvailabilityResponse,
  v193IndustrySpecificData,
  v193ProfileData,
  v193FormationFormData,
  v193FormationData,
  v193Business,
  v193UserData,
  v193CrtkData,
  v193CrtkEmailMetadata,
  v193CrtkEntry,
  v193CrtkBusinessDetails,
  v193CigaretteLicensePaymentInfo,
  v193CigaretteLicenseData,
  v193EnvironmentData,
} from "@db/migrations/v193_rotate_stranded_legacy_kms_fields";
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
  const schemaWithBase64Check = withNoBase64Check(v193UserDataSchema);
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

export const v193XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v193WasteWaterFieldIdsSchema = z.enum([
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

export const v193WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v193WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v193WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v193DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v193DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v193DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v193DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v193WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v193WasteDataSchema = z.object(
  Object.fromEntries(v193WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v193WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v193LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v193LandDataSchema = z.object(
  Object.fromEntries(v193LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v193LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v193AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v193AirDataSchema = z.object(
  Object.fromEntries(v193AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v193AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v193PaymentTypeSchema = optionalUndefined(z.enum(["CC", "ACH"]));

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

export const v193BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v193FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v193SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v193InFormInBylawsSchema = optionalUndefined(z.enum(["IN_BYLAWS", "IN_FORM"]));

export const v193HowToProceedOptionsSchema = z.enum([
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

export const v193UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v193NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v193NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v193SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v193CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v193LicenseStatusSchema = z.enum([
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

export const v193PropertyLeaseTypeSchema = optionalUndefined(
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
);

export const v193TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v193OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v193ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v193BusinessPersonaSchema = optionalUndefined(
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
);
export const v193OperatingPhaseSchema = optionalUndefined(
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

export const v193CannabisLicenseTypeSchema = optionalUndefined(z.enum(["CONDITIONAL", "ANNUAL"]));
export const v193CarServiceTypeSchema = optionalUndefined(
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
);
export const v193ConstructionTypeSchema = optionalUndefined(
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
);
export const v193ResidentialConstructionTypeSchema = optionalUndefined(
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
);
export const v193EmploymentAndPersonnelServicesTypeSchema = optionalUndefined(
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
);
export const v193EmploymentPlacementTypeSchema = optionalUndefined(
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
);

export const v193ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v193TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v193TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v193taskIdLicenseNameMapping = {
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

export const v193taskIdLicenseNameMappingSchema = z.object({
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

export const v193LicenseTaskIDSchema = z.enum(
  Object.keys(v193taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v193LicenseNameSchema = z.enum(
  Object.values(v193taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v193SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v193QuestionnaireDataSchema: z.ZodType<v193QuestionnaireData> = z.object({
  air: v193AirDataSchema,
  land: v193LandDataSchema,
  waste: v193WasteDataSchema,
  drinkingWater: v193DrinkingWaterDataSchema,
  wasteWater: v193WasteWaterDataSchema,
});

export const v193MachineDetailsSchema: z.ZodType<v193MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v193XrayRegistrationStatusResponseSchema: z.ZodType<v193XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v193MachineDetailsSchema),
    status: v193XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v193FacilityDetailsSchema: z.ZodType<v193FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v193XrayDataSchema: z.ZodType<v193XrayData> = z.object({
  facilityDetails: v193FacilityDetailsSchema.optional(),
  machines: z.array(v193MachineDetailsSchema).optional(),
  status: v193XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v193CigaretteLicensePaymentInfoSchema: z.ZodType<v193CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailSent: z.boolean().optional(),
  });

export const v193StateObjectSchema: z.ZodType<v193StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v193CigaretteLicenseDataSchema: z.ZodType<v193CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v193StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v193StateObjectSchema.optional(),
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
  paymentInfo: v193CigaretteLicensePaymentInfoSchema.optional(),
});

export const v193TaxClearanceCertificateDataSchema: z.ZodType<v193TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: optionalUndefined(z.string()),
    businessName: optionalUndefined(z.string()),
    addressLine1: optionalUndefined(z.string()),
    addressLine2: optionalUndefined(z.string()),
    addressCity: optionalUndefined(z.string()),
    addressState: v193StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: optionalUndefined(z.string()),
    encryptedTaxId: optionalUndefined(z.string()),
    taxPin: optionalUndefined(z.string()),
    encryptedTaxPin: optionalUndefined(z.string()),
    hasPreviouslyReceivedCertificate: optionalUndefined(z.boolean()),
    lastUpdatedISO: optionalUndefined(z.string()),
  });

export const v193EnvironmentDataSchema: z.ZodType<v193EnvironmentData> = z.object({
  questionnaireData: v193QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v193GetFilingResponseSchema: z.ZodType<v193GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v193FormationSubmitErrorSchema: z.ZodType<v193FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v193FormationSubmitResponseSchema: z.ZodType<v193FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: optionalUndefined(z.string()),
  formationId: optionalUndefined(z.string()),
  redirect: optionalUndefined(z.string()),
  errors: z.array(v193FormationSubmitErrorSchema),
  lastUpdatedISO: optionalUndefined(z.string()),
});

export const v193FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v193SignerTitleSchema,
}) satisfies z.ZodType<v193FormationSigner>;

export const v193ForeignGoodStandingFileObjectSchema: z.ZodType<v193ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v193NameAvailabilityResponseSchema = z.object({
  status: optionalUndefined(v193NameAvailabilityStatusSchema),
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v193NameAvailabilityResponse>;

export const v193NameAvailabilitySchema = v193NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v193NameAvailability>;

export const v193NewsletterResponseSchema: z.ZodType<v193NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v193NewsletterStatusSchema,
});

export const v193UserTestingResponseSchema: z.ZodType<v193UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v193UserTestingStatusSchema,
});

export const v193ExternalStatusSchema: z.ZodType<v193ExternalStatus> = z.object({
  newsletter: v193NewsletterResponseSchema.optional(),
  userTesting: v193UserTestingResponseSchema.optional(),
});

export const v193CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v193CalendarEvent>;

export const v193LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v193LicenseSearchAddress>;

export const v193TaxFilingCalendarEventSchema = v193CalendarEventSchema
  .extend({
    identifier: z.string(),
    calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
  })
  .readonly() satisfies z.ZodType<v193TaxFilingCalendarEvent>;

export const v193LicenseSearchNameAndAddressSchema = v193LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v193LicenseSearchNameAndAddress>;

export const v193TaxFilingDataSchema: z.ZodType<v193TaxFilingData> = z.object({
  state: v193TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v193TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v193TaxFilingCalendarEventSchema),
});

export const v193MunicipalitySchema: z.ZodType<v193Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v193LicenseStatusItemSchema: z.ZodType<v193LicenseStatusItem> = z.object({
  title: z.string(),
  status: v193CheckoffStatusSchema,
});

export const v193LicenseDetailsSchema: z.ZodType<v193LicenseDetails> = z.object({
  nameAndAddress: v193LicenseSearchNameAndAddressSchema,
  licenseStatus: v193LicenseStatusSchema,
  expirationDateISO: optionalUndefined(z.string()),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v193LicenseStatusItemSchema),
});

export const v193CommunityAffairsAddressSchema: z.ZodType<v193CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v193MunicipalitySchema,
});

export const v193BusinessUserSchema: z.ZodType<v193BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v193ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v193ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v193ProfileDocumentsSchema: z.ZodType<v193ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v193RoadmapTaskDataSchema: z.ZodType<v193RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v193FormationAddressSchema = z.object({
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
  addressState: v193StateObjectSchema.optional(),
  addressMunicipality: v193MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: optionalUndefined(v193FormationBusinessLocationTypeSchema),
}) satisfies z.ZodType<v193FormationAddress>;

export const v193FormationMemberSchema = v193FormationAddressSchema
  .extend({
    name: z.string(),
  })
  .readonly() satisfies z.ZodType<v193FormationMember>;

export const v193FormationIncorporatorSchema = z
  .object({
    ...v193FormationSignerSchema.shape,
    ...v193FormationAddressSchema.shape,
  })
  .readonly();

export const v193IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: optionalUndefined(z.boolean()),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v193CannabisLicenseTypeSchema,
  cannabisMicrobusiness: optionalUndefined(z.boolean()),
  constructionRenovationPlan: optionalUndefined(z.boolean()),
  carService: v193CarServiceTypeSchema,
  interstateTransport: optionalUndefined(z.boolean()),
  interstateLogistics: optionalUndefined(z.boolean()),
  interstateMoving: optionalUndefined(z.boolean()),
  isChildcareForSixOrMore: optionalUndefined(z.boolean()),
  petCareHousing: optionalUndefined(z.boolean()),
  willSellPetCareItems: optionalUndefined(z.boolean()),
  constructionType: v193ConstructionTypeSchema,
  residentialConstructionType: v193ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v193EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v193EmploymentPlacementTypeSchema,
  propertyLeaseType: v193PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: optionalUndefined(z.boolean()),
  publicWorksContractor: optionalUndefined(z.boolean()),
}) satisfies z.ZodType<v193IndustrySpecificData>;

export const v193ProfileDataSchema = v193IndustrySpecificDataSchema.extend({
  businessPersona: v193BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: optionalUndefined(z.string()),
  legalStructureId: optionalUndefined(z.string()),
  municipality: optionalUndefined(v193MunicipalitySchema),
  dateOfFormation: optionalUndefined(z.string()),
  entityId: optionalUndefined(z.string()),
  employerId: optionalUndefined(z.string()),
  taxId: optionalUndefined(z.string()),
  hashedTaxId: optionalUndefined(z.string()),
  encryptedTaxId: optionalUndefined(z.string()),
  notes: z.string(),
  documents: v193ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: optionalUndefined(z.string()),
  taxPin: optionalUndefined(z.string()),
  encryptedTaxPin: optionalUndefined(z.string()),
  sectorId: optionalUndefined(z.string()),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v193ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v193OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), optionalUndefined(z.boolean())),
  elevatorOwningBusiness: optionalUndefined(z.boolean()),
  communityAffairsAddress: v193CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: optionalUndefined(z.boolean()),
  raffleBingoGames: optionalUndefined(z.boolean()),
  businessOpenMoreThanTwoYears: optionalUndefined(z.boolean()),
  employerAccessRegistration: optionalUndefined(z.boolean()),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v193ProfileData>;

export const v193FormationFormDataSchema = v193FormationAddressSchema
  .extend({
    businessName: z.string(),
    businessNameConfirmation: optionalUndefined(z.boolean()),
    businessSuffix: optionalUndefined(v193BusinessSuffixSchema),
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
    nonprofitBoardMemberQualificationsSpecified: v193InFormInBylawsSchema,
    nonprofitBoardMemberQualificationsTerms: z.string(),
    nonprofitBoardMemberRightsSpecified: v193InFormInBylawsSchema,
    nonprofitBoardMemberRightsTerms: z.string(),
    nonprofitTrusteesMethodSpecified: v193InFormInBylawsSchema,
    nonprofitTrusteesMethodTerms: z.string(),
    nonprofitAssetDistributionSpecified: v193InFormInBylawsSchema,
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
    members: optionalUndefined(z.array(v193FormationMemberSchema)),
    incorporators: optionalUndefined(z.array(v193FormationIncorporatorSchema)),
    signers: optionalUndefined(z.array(v193FormationSignerSchema.readonly())),
    paymentType: v193PaymentTypeSchema,
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
    foreignStateOfFormation: optionalUndefined(v193StateObjectSchema),
    foreignDateOfFormation: optionalUndefined(z.string()), // YYYY-MM-DD
    foreignGoodStandingFile: optionalUndefined(v193ForeignGoodStandingFileObjectSchema),
    legalType: z.string(),
    willPracticeLaw: optionalUndefined(z.boolean()),
    isVeteranNonprofit: optionalUndefined(z.boolean()),
    checkNameReservation: optionalUndefined(z.boolean()),
    howToProceed: v193HowToProceedOptionsSchema,
  })
  .readonly() satisfies z.ZodType<v193FormationFormData>;

export const v193FormationDataSchema: z.ZodType<v193FormationData> = z.object({
  formationFormData: v193FormationFormDataSchema,
  businessNameAvailability: optionalUndefined(v193NameAvailabilitySchema),
  dbaBusinessNameAvailability: optionalUndefined(v193NameAvailabilitySchema),
  formationResponse: optionalUndefined(v193FormationSubmitResponseSchema),
  getFilingResponse: optionalUndefined(v193GetFilingResponseSchema),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v193LicensesSchema = z.object(
  Object.fromEntries(
    v193LicenseNameSchema.options.map((name) => [name, v193LicenseDetailsSchema.optional()]),
  ) as Record<string, z.ZodOptional<typeof v193LicenseDetailsSchema>>,
);

export const v193LicenseDataSchema: z.ZodType<v193LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v193LicensesSchema.optional(),
});

export const v193PreferencesSchema: z.ZodType<v193Preferences> = z.object({
  roadmapOpenSections: z.array(v193SectionTypeSchema),
  roadmapOpenSteps: z.array(z.number()),
  visibleSidebarCards: z.array(z.string()),
  isCalendarFullView: z.boolean(),
  returnToLink: z.string(),
  isHideableRoadmapOpen: z.boolean(),
  phaseNewlyChanged: z.boolean(),
  isNonProfitFromFunding: z.boolean().optional(),
});

export const v193CrtkBusinessDetailsSchema: z.ZodType<v193CrtkBusinessDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v193CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v193CrtkEntrySchema: z.ZodType<v193CrtkEntry> = z.object({
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

export const v193CrtkEmailMetadataSchema: z.ZodType<v193CrtkEmailMetadata> = z.object({
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

export const v193CrtkDataSchema: z.ZodType<v193CrtkData> = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: v193CrtkBusinessDetailsSchema.optional(),
  crtkSearchResult: z.union([v193CrtkSearchResultSchema]),
  crtkEntry: v193CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v193BusinessSchema: z.ZodType<v193Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v193ProfileDataSchema,
  onboardingFormProgress: v193OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v193TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: optionalUndefined(v193LicenseDataSchema),
  preferences: v193PreferencesSchema,
  taxFilingData: v193TaxFilingDataSchema,
  formationData: v193FormationDataSchema,
  environmentData: optionalUndefined(v193EnvironmentDataSchema),
  xrayRegistrationData: optionalUndefined(v193XrayDataSchema),
  crtkData: optionalUndefined(v193CrtkDataSchema),
  roadmapTaskData: v193RoadmapTaskDataSchema,
  taxClearanceCertificateData: optionalUndefined(v193TaxClearanceCertificateDataSchema),
  cigaretteLicenseData: optionalUndefined(v193CigaretteLicenseDataSchema),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v193UserDataSchema: z.ZodType<v193UserData> = z.object({
  user: v193BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v193BusinessSchema),
  currentBusinessId: z.string(),
});
