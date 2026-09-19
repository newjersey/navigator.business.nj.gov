import type {
  v196FacilityDetails,
  v196MachineDetails,
  v196QuestionnaireData,
  v196StateObject,
  v196TaxClearanceCertificateData,
  v196XrayData,
  v196XrayRegistrationStatusResponse,
  v196GetFilingResponse,
  v196FormationSubmitError,
  v196FormationSubmitResponse,
  v196FormationSigner,
  v196ForeignGoodStandingFileObject,
  v196UserTestingResponse,
  v196NewsletterResponse,
  v196ExternalStatus,
  v196CalendarEvent,
  v196LicenseSearchAddress,
  v196TaxFilingCalendarEvent,
  v196LicenseSearchNameAndAddress,
  v196TaxFilingData,
  v196LicenseDetails,
  v196Municipality,
  v196ProfileDocuments,
  v196BusinessUser,
  v196CommunityAffairsAddress,
  v196ConsolidationRecord,
  v196RoadmapTaskData,
  v196FormationAddress,
  v196LicenseData,
  v196Preferences,
  v196LicenseStatusItem,
  v196FormationMember,
  v196NameAvailability,
  v196NameAvailabilityResponse,
  v196IndustrySpecificData,
  v196ProfileData,
  v196FormationFormData,
  v196FormationData,
  v196Business,
  v196UserData,
  v196CrtkData,
  v196CrtkEmailMetadata,
  v196CrtkEntry,
  v196CrtkBusinessDetails,
  v196CigaretteLicensePaymentInfo,
  v196CigaretteLicenseData,
  v196EnvironmentData,
} from "@db/migrations/v196_add_email_sign_in_claimed";
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
  const schemaWithBase64Check = withNoBase64Check(v196UserDataSchema);
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

export const v196XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v196WasteWaterFieldIdsSchema = z.enum([
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

export const v196WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v196WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v196WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v196DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v196DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v196DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v196DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v196WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v196WasteDataSchema = z.object(
  Object.fromEntries(v196WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v196WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v196LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v196LandDataSchema = z.object(
  Object.fromEntries(v196LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v196LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v196AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v196AirDataSchema = z.object(
  Object.fromEntries(v196AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v196AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v196PaymentTypeSchema = optionalUndefined(z.enum(["CC", "ACH"]));

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

export const v196BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v196FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v196SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v196InFormInBylawsSchema = optionalUndefined(z.enum(["IN_BYLAWS", "IN_FORM"]));

export const v196HowToProceedOptionsSchema = z.enum([
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

export const v196UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v196NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v196NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v196SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v196CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v196LicenseStatusSchema = z.enum([
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

export const v196PropertyLeaseTypeSchema = optionalUndefined(
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
);

export const v196TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v196OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v196BusinessPersonaSchema = optionalUndefined(
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
);
export const v196OperatingPhaseSchema = optionalUndefined(
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

export const v196CannabisLicenseTypeSchema = optionalUndefined(z.enum(["CONDITIONAL", "ANNUAL"]));
export const v196CarServiceTypeSchema = optionalUndefined(
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
);
export const v196ConstructionTypeSchema = optionalUndefined(
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
);
export const v196ResidentialConstructionTypeSchema = optionalUndefined(
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
);
export const v196EmploymentAndPersonnelServicesTypeSchema = optionalUndefined(
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
);
export const v196EmploymentPlacementTypeSchema = optionalUndefined(
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
);

export const v196ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v196TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v196TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v196taskIdLicenseNameMapping = {
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

export const v196taskIdLicenseNameMappingSchema = z.object({
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

export const v196LicenseTaskIDSchema = z.enum(
  Object.keys(v196taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v196LicenseNameSchema = z.enum(
  Object.values(v196taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v196SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v196QuestionnaireDataSchema: z.ZodType<v196QuestionnaireData> = z.object({
  air: v196AirDataSchema,
  land: v196LandDataSchema,
  waste: v196WasteDataSchema,
  drinkingWater: v196DrinkingWaterDataSchema,
  wasteWater: v196WasteWaterDataSchema,
});

export const v196MachineDetailsSchema: z.ZodType<v196MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v196XrayRegistrationStatusResponseSchema: z.ZodType<v196XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v196MachineDetailsSchema),
    status: v196XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v196FacilityDetailsSchema: z.ZodType<v196FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v196XrayDataSchema: z.ZodType<v196XrayData> = z.object({
  facilityDetails: v196FacilityDetailsSchema.optional(),
  machines: z.array(v196MachineDetailsSchema).optional(),
  status: v196XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v196CigaretteLicensePaymentInfoSchema: z.ZodType<v196CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailSent: z.boolean().optional(),
  });

export const v196StateObjectSchema: z.ZodType<v196StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v196CigaretteLicenseDataSchema: z.ZodType<v196CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v196StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v196StateObjectSchema.optional(),
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
  paymentInfo: v196CigaretteLicensePaymentInfoSchema.optional(),
});

export const v196TaxClearanceCertificateDataSchema: z.ZodType<v196TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: optionalUndefined(z.string()),
    businessName: optionalUndefined(z.string()),
    addressLine1: optionalUndefined(z.string()),
    addressLine2: optionalUndefined(z.string()),
    addressCity: optionalUndefined(z.string()),
    addressState: v196StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: optionalUndefined(z.string()),
    encryptedTaxId: optionalUndefined(z.string()),
    taxPin: optionalUndefined(z.string()),
    encryptedTaxPin: optionalUndefined(z.string()),
    hasPreviouslyReceivedCertificate: optionalUndefined(z.boolean()),
    lastUpdatedISO: optionalUndefined(z.string()),
  });

export const v196EnvironmentDataSchema: z.ZodType<v196EnvironmentData> = z.object({
  questionnaireData: v196QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v196GetFilingResponseSchema: z.ZodType<v196GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v196FormationSubmitErrorSchema: z.ZodType<v196FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v196FormationSubmitResponseSchema: z.ZodType<v196FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: optionalUndefined(z.string()),
  formationId: optionalUndefined(z.string()),
  redirect: optionalUndefined(z.string()),
  errors: z.array(v196FormationSubmitErrorSchema),
  lastUpdatedISO: optionalUndefined(z.string()),
});

export const v196FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v196SignerTitleSchema,
}) satisfies z.ZodType<v196FormationSigner>;

export const v196ForeignGoodStandingFileObjectSchema: z.ZodType<v196ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v196NameAvailabilityResponseSchema = z.object({
  status: optionalUndefined(v196NameAvailabilityStatusSchema),
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v196NameAvailabilityResponse>;

export const v196NameAvailabilitySchema = v196NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v196NameAvailability>;

export const v196NewsletterResponseSchema: z.ZodType<v196NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v196NewsletterStatusSchema,
});

export const v196UserTestingResponseSchema: z.ZodType<v196UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v196UserTestingStatusSchema,
});

export const v196ExternalStatusSchema: z.ZodType<v196ExternalStatus> = z.object({
  newsletter: v196NewsletterResponseSchema.optional(),
  userTesting: v196UserTestingResponseSchema.optional(),
});

export const v196CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v196CalendarEvent>;

export const v196LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v196LicenseSearchAddress>;

export const v196TaxFilingCalendarEventSchema = v196CalendarEventSchema
  .extend({
    identifier: z.string(),
    calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
  })
  .readonly() satisfies z.ZodType<v196TaxFilingCalendarEvent>;

export const v196LicenseSearchNameAndAddressSchema = v196LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v196LicenseSearchNameAndAddress>;

export const v196TaxFilingDataSchema: z.ZodType<v196TaxFilingData> = z.object({
  state: v196TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v196TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v196TaxFilingCalendarEventSchema),
});

export const v196MunicipalitySchema: z.ZodType<v196Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v196LicenseStatusItemSchema: z.ZodType<v196LicenseStatusItem> = z.object({
  title: z.string(),
  status: v196CheckoffStatusSchema,
});

export const v196LicenseDetailsSchema: z.ZodType<v196LicenseDetails> = z.object({
  nameAndAddress: v196LicenseSearchNameAndAddressSchema,
  licenseStatus: v196LicenseStatusSchema,
  expirationDateISO: optionalUndefined(z.string()),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v196LicenseStatusItemSchema),
});

export const v196CommunityAffairsAddressSchema: z.ZodType<v196CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v196MunicipalitySchema,
});

export const v196BusinessUserSchema: z.ZodType<v196BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v196ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
  emailSignInClaimedISO: z.string().optional(),
});

export const v196ProfileDocumentsSchema: z.ZodType<v196ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v196RoadmapTaskDataSchema: z.ZodType<v196RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v196FormationAddressSchema = z.object({
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
  addressState: v196StateObjectSchema.optional(),
  addressMunicipality: v196MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: optionalUndefined(v196FormationBusinessLocationTypeSchema),
}) satisfies z.ZodType<v196FormationAddress>;

export const v196FormationMemberSchema = v196FormationAddressSchema
  .extend({
    name: z.string(),
  })
  .readonly() satisfies z.ZodType<v196FormationMember>;

export const v196FormationIncorporatorSchema = z
  .object({
    ...v196FormationSignerSchema.shape,
    ...v196FormationAddressSchema.shape,
  })
  .readonly();

export const v196IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: optionalUndefined(z.boolean()),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v196CannabisLicenseTypeSchema,
  cannabisMicrobusiness: optionalUndefined(z.boolean()),
  constructionRenovationPlan: optionalUndefined(z.boolean()),
  carService: v196CarServiceTypeSchema,
  interstateTransport: optionalUndefined(z.boolean()),
  interstateLogistics: optionalUndefined(z.boolean()),
  interstateMoving: optionalUndefined(z.boolean()),
  isChildcareForSixOrMore: optionalUndefined(z.boolean()),
  petCareHousing: optionalUndefined(z.boolean()),
  willSellPetCareItems: optionalUndefined(z.boolean()),
  constructionType: v196ConstructionTypeSchema,
  residentialConstructionType: v196ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v196EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v196EmploymentPlacementTypeSchema,
  propertyLeaseType: v196PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: optionalUndefined(z.boolean()),
  publicWorksContractor: optionalUndefined(z.boolean()),
}) satisfies z.ZodType<v196IndustrySpecificData>;

export const v196ProfileDataSchema = v196IndustrySpecificDataSchema.extend({
  businessPersona: v196BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: optionalUndefined(z.string()),
  legalStructureId: optionalUndefined(z.string()),
  municipality: optionalUndefined(v196MunicipalitySchema),
  dateOfFormation: optionalUndefined(z.string()),
  entityId: optionalUndefined(z.string()),
  employerId: optionalUndefined(z.string()),
  taxId: optionalUndefined(z.string()),
  hashedTaxId: optionalUndefined(z.string()),
  encryptedTaxId: optionalUndefined(z.string()),
  notes: z.string(),
  documents: v196ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: optionalUndefined(z.string()),
  taxPin: optionalUndefined(z.string()),
  encryptedTaxPin: optionalUndefined(z.string()),
  sectorId: optionalUndefined(z.string()),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v196ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v196OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), optionalUndefined(z.boolean())),
  elevatorOwningBusiness: optionalUndefined(z.boolean()),
  communityAffairsAddress: v196CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: optionalUndefined(z.boolean()),
  raffleBingoGames: optionalUndefined(z.boolean()),
  businessOpenMoreThanTwoYears: optionalUndefined(z.boolean()),
  employerAccessRegistration: optionalUndefined(z.boolean()),
  deptOfLaborEin: z.string(),
  learningBusiness: optionalUndefined(z.boolean()),
}) satisfies z.ZodType<v196ProfileData>;

export const v196FormationFormDataSchema = v196FormationAddressSchema
  .extend({
    businessName: z.string(),
    businessNameConfirmation: optionalUndefined(z.boolean()),
    businessSuffix: optionalUndefined(v196BusinessSuffixSchema),
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
    nonprofitBoardMemberQualificationsSpecified: v196InFormInBylawsSchema,
    nonprofitBoardMemberQualificationsTerms: z.string(),
    nonprofitBoardMemberRightsSpecified: v196InFormInBylawsSchema,
    nonprofitBoardMemberRightsTerms: z.string(),
    nonprofitTrusteesMethodSpecified: v196InFormInBylawsSchema,
    nonprofitTrusteesMethodTerms: z.string(),
    nonprofitAssetDistributionSpecified: v196InFormInBylawsSchema,
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
    members: optionalUndefined(z.array(v196FormationMemberSchema)),
    incorporators: optionalUndefined(z.array(v196FormationIncorporatorSchema)),
    signers: optionalUndefined(z.array(v196FormationSignerSchema.readonly())),
    paymentType: v196PaymentTypeSchema,
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
    foreignStateOfFormation: optionalUndefined(v196StateObjectSchema),
    foreignDateOfFormation: optionalUndefined(z.string()), // YYYY-MM-DD
    foreignGoodStandingFile: optionalUndefined(v196ForeignGoodStandingFileObjectSchema),
    legalType: z.string(),
    willPracticeLaw: optionalUndefined(z.boolean()),
    isVeteranNonprofit: optionalUndefined(z.boolean()),
    checkNameReservation: optionalUndefined(z.boolean()),
    howToProceed: v196HowToProceedOptionsSchema,
  })
  .readonly() satisfies z.ZodType<v196FormationFormData>;

export const v196FormationDataSchema: z.ZodType<v196FormationData> = z.object({
  formationFormData: v196FormationFormDataSchema,
  businessNameAvailability: optionalUndefined(v196NameAvailabilitySchema),
  dbaBusinessNameAvailability: optionalUndefined(v196NameAvailabilitySchema),
  formationResponse: optionalUndefined(v196FormationSubmitResponseSchema),
  getFilingResponse: optionalUndefined(v196GetFilingResponseSchema),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v196LicensesSchema = z.object(
  Object.fromEntries(
    v196LicenseNameSchema.options.map((name) => [name, v196LicenseDetailsSchema.optional()]),
  ) as Record<string, z.ZodOptional<typeof v196LicenseDetailsSchema>>,
);

export const v196LicenseDataSchema: z.ZodType<v196LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v196LicensesSchema.optional(),
});

export const v196PreferencesSchema: z.ZodType<v196Preferences> = z.object({
  roadmapOpenSections: z.array(v196SectionTypeSchema),
  roadmapOpenSteps: z.array(z.number()),
  visibleSidebarCards: z.array(z.string()),
  isCalendarFullView: z.boolean(),
  returnToLink: z.string(),
  isHideableRoadmapOpen: z.boolean(),
  phaseNewlyChanged: z.boolean(),
  isNonProfitFromFunding: z.boolean().optional(),
});

export const v196CrtkBusinessDetailsSchema: z.ZodType<v196CrtkBusinessDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v196CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v196CrtkEntrySchema: z.ZodType<v196CrtkEntry> = z.object({
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

export const v196CrtkEmailMetadataSchema: z.ZodType<v196CrtkEmailMetadata> = z.object({
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

export const v196CrtkDataSchema: z.ZodType<v196CrtkData> = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: v196CrtkBusinessDetailsSchema.optional(),
  crtkSearchResult: z.union([v196CrtkSearchResultSchema]),
  crtkEntry: v196CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v196BusinessSchema: z.ZodType<v196Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v196ProfileDataSchema,
  onboardingFormProgress: v196OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v196TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: optionalUndefined(v196LicenseDataSchema),
  preferences: v196PreferencesSchema,
  taxFilingData: v196TaxFilingDataSchema,
  formationData: v196FormationDataSchema,
  environmentData: optionalUndefined(v196EnvironmentDataSchema),
  xrayRegistrationData: optionalUndefined(v196XrayDataSchema),
  crtkData: optionalUndefined(v196CrtkDataSchema),
  roadmapTaskData: v196RoadmapTaskDataSchema,
  taxClearanceCertificateData: optionalUndefined(v196TaxClearanceCertificateDataSchema),
  cigaretteLicenseData: optionalUndefined(v196CigaretteLicenseDataSchema),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v196ConsolidationRecordSchema: z.ZodType<v196ConsolidationRecord> = z.object({
  userId: z.string(),
  businessIds: z.array(z.string()),
  documentsCopied: z.array(z.string()),
  mergedAtISO: z.string(),
});

export const v196UserDataSchema: z.ZodType<v196UserData> = z.object({
  user: v196BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v196BusinessSchema),
  currentBusinessId: z.string(),
  consolidatedInto: v196ConsolidationRecordSchema.optional(),
});
