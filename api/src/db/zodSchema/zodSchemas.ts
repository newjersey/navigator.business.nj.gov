import type {
  v195FacilityDetails,
  v195MachineDetails,
  v195QuestionnaireData,
  v195StateObject,
  v195TaxClearanceCertificateData,
  v195XrayData,
  v195XrayRegistrationStatusResponse,
  v195GetFilingResponse,
  v195FormationSubmitError,
  v195FormationSubmitResponse,
  v195FormationSigner,
  v195ForeignGoodStandingFileObject,
  v195UserTestingResponse,
  v195NewsletterResponse,
  v195ExternalStatus,
  v195CalendarEvent,
  v195LicenseSearchAddress,
  v195TaxFilingCalendarEvent,
  v195LicenseSearchNameAndAddress,
  v195TaxFilingData,
  v195LicenseDetails,
  v195Municipality,
  v195ProfileDocuments,
  v195BusinessUser,
  v195CommunityAffairsAddress,
  v195RoadmapTaskData,
  v195FormationAddress,
  v195LicenseData,
  v195Preferences,
  v195LicenseStatusItem,
  v195FormationMember,
  v195NameAvailability,
  v195NameAvailabilityResponse,
  v195IndustrySpecificData,
  v195ProfileData,
  v195FormationFormData,
  v195FormationData,
  v195Business,
  v195UserData,
  v195CrtkData,
  v195CrtkEmailMetadata,
  v195CrtkEntry,
  v195CrtkBusinessDetails,
  v195CigaretteLicensePaymentInfo,
  v195CigaretteLicenseData,
  v195EnvironmentData,
} from "@db/migrations/v195_add_learning_business_field_to_business_user_data";
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
  const schemaWithBase64Check = withNoBase64Check(v195UserDataSchema);
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

export const v195XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v195WasteWaterFieldIdsSchema = z.enum([
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

export const v195WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v195WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v195WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v195DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v195DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v195DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v195DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v195WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v195WasteDataSchema = z.object(
  Object.fromEntries(v195WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v195WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v195LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v195LandDataSchema = z.object(
  Object.fromEntries(v195LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v195LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v195AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v195AirDataSchema = z.object(
  Object.fromEntries(v195AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v195AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v195PaymentTypeSchema = optionalUndefined(z.enum(["CC", "ACH"]));

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

export const v195BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v195FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v195SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v195InFormInBylawsSchema = optionalUndefined(z.enum(["IN_BYLAWS", "IN_FORM"]));

export const v195HowToProceedOptionsSchema = z.enum([
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

export const v195UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v195NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v195NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v195SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v195CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v195LicenseStatusSchema = z.enum([
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

export const v195PropertyLeaseTypeSchema = optionalUndefined(
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
);

export const v195TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v195OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v195BusinessPersonaSchema = optionalUndefined(
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
);
export const v195OperatingPhaseSchema = optionalUndefined(
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

export const v195CannabisLicenseTypeSchema = optionalUndefined(z.enum(["CONDITIONAL", "ANNUAL"]));
export const v195CarServiceTypeSchema = optionalUndefined(
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
);
export const v195ConstructionTypeSchema = optionalUndefined(
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
);
export const v195ResidentialConstructionTypeSchema = optionalUndefined(
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
);
export const v195EmploymentAndPersonnelServicesTypeSchema = optionalUndefined(
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
);
export const v195EmploymentPlacementTypeSchema = optionalUndefined(
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
);

export const v195ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v195TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v195TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v195taskIdLicenseNameMapping = {
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

export const v195taskIdLicenseNameMappingSchema = z.object({
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

export const v195LicenseTaskIDSchema = z.enum(
  Object.keys(v195taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v195LicenseNameSchema = z.enum(
  Object.values(v195taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v195SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v195QuestionnaireDataSchema: z.ZodType<v195QuestionnaireData> = z.object({
  air: v195AirDataSchema,
  land: v195LandDataSchema,
  waste: v195WasteDataSchema,
  drinkingWater: v195DrinkingWaterDataSchema,
  wasteWater: v195WasteWaterDataSchema,
});

export const v195MachineDetailsSchema: z.ZodType<v195MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v195XrayRegistrationStatusResponseSchema: z.ZodType<v195XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v195MachineDetailsSchema),
    status: v195XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v195FacilityDetailsSchema: z.ZodType<v195FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v195XrayDataSchema: z.ZodType<v195XrayData> = z.object({
  facilityDetails: v195FacilityDetailsSchema.optional(),
  machines: z.array(v195MachineDetailsSchema).optional(),
  status: v195XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v195CigaretteLicensePaymentInfoSchema: z.ZodType<v195CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailSent: z.boolean().optional(),
  });

export const v195StateObjectSchema: z.ZodType<v195StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v195CigaretteLicenseDataSchema: z.ZodType<v195CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v195StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v195StateObjectSchema.optional(),
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
  paymentInfo: v195CigaretteLicensePaymentInfoSchema.optional(),
});

export const v195TaxClearanceCertificateDataSchema: z.ZodType<v195TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: optionalUndefined(z.string()),
    businessName: optionalUndefined(z.string()),
    addressLine1: optionalUndefined(z.string()),
    addressLine2: optionalUndefined(z.string()),
    addressCity: optionalUndefined(z.string()),
    addressState: v195StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: optionalUndefined(z.string()),
    encryptedTaxId: optionalUndefined(z.string()),
    taxPin: optionalUndefined(z.string()),
    encryptedTaxPin: optionalUndefined(z.string()),
    hasPreviouslyReceivedCertificate: optionalUndefined(z.boolean()),
    lastUpdatedISO: optionalUndefined(z.string()),
  });

export const v195EnvironmentDataSchema: z.ZodType<v195EnvironmentData> = z.object({
  questionnaireData: v195QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v195GetFilingResponseSchema: z.ZodType<v195GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v195FormationSubmitErrorSchema: z.ZodType<v195FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v195FormationSubmitResponseSchema: z.ZodType<v195FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: optionalUndefined(z.string()),
  formationId: optionalUndefined(z.string()),
  redirect: optionalUndefined(z.string()),
  errors: z.array(v195FormationSubmitErrorSchema),
  lastUpdatedISO: optionalUndefined(z.string()),
});

export const v195FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v195SignerTitleSchema,
}) satisfies z.ZodType<v195FormationSigner>;

export const v195ForeignGoodStandingFileObjectSchema: z.ZodType<v195ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v195NameAvailabilityResponseSchema = z.object({
  status: optionalUndefined(v195NameAvailabilityStatusSchema),
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v195NameAvailabilityResponse>;

export const v195NameAvailabilitySchema = v195NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v195NameAvailability>;

export const v195NewsletterResponseSchema: z.ZodType<v195NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v195NewsletterStatusSchema,
});

export const v195UserTestingResponseSchema: z.ZodType<v195UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v195UserTestingStatusSchema,
});

export const v195ExternalStatusSchema: z.ZodType<v195ExternalStatus> = z.object({
  newsletter: v195NewsletterResponseSchema.optional(),
  userTesting: v195UserTestingResponseSchema.optional(),
});

export const v195CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v195CalendarEvent>;

export const v195LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v195LicenseSearchAddress>;

export const v195TaxFilingCalendarEventSchema = v195CalendarEventSchema
  .extend({
    identifier: z.string(),
    calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
  })
  .readonly() satisfies z.ZodType<v195TaxFilingCalendarEvent>;

export const v195LicenseSearchNameAndAddressSchema = v195LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v195LicenseSearchNameAndAddress>;

export const v195TaxFilingDataSchema: z.ZodType<v195TaxFilingData> = z.object({
  state: v195TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v195TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v195TaxFilingCalendarEventSchema),
});

export const v195MunicipalitySchema: z.ZodType<v195Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v195LicenseStatusItemSchema: z.ZodType<v195LicenseStatusItem> = z.object({
  title: z.string(),
  status: v195CheckoffStatusSchema,
});

export const v195LicenseDetailsSchema: z.ZodType<v195LicenseDetails> = z.object({
  nameAndAddress: v195LicenseSearchNameAndAddressSchema,
  licenseStatus: v195LicenseStatusSchema,
  expirationDateISO: optionalUndefined(z.string()),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v195LicenseStatusItemSchema),
});

export const v195CommunityAffairsAddressSchema: z.ZodType<v195CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v195MunicipalitySchema,
});

export const v195BusinessUserSchema: z.ZodType<v195BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v195ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v195ProfileDocumentsSchema: z.ZodType<v195ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v195RoadmapTaskDataSchema: z.ZodType<v195RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v195FormationAddressSchema = z.object({
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
  addressState: v195StateObjectSchema.optional(),
  addressMunicipality: v195MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: optionalUndefined(v195FormationBusinessLocationTypeSchema),
}) satisfies z.ZodType<v195FormationAddress>;

export const v195FormationMemberSchema = v195FormationAddressSchema
  .extend({
    name: z.string(),
  })
  .readonly() satisfies z.ZodType<v195FormationMember>;

export const v195FormationIncorporatorSchema = z
  .object({
    ...v195FormationSignerSchema.shape,
    ...v195FormationAddressSchema.shape,
  })
  .readonly();

export const v195IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: optionalUndefined(z.boolean()),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v195CannabisLicenseTypeSchema,
  cannabisMicrobusiness: optionalUndefined(z.boolean()),
  constructionRenovationPlan: optionalUndefined(z.boolean()),
  carService: v195CarServiceTypeSchema,
  interstateTransport: optionalUndefined(z.boolean()),
  interstateLogistics: optionalUndefined(z.boolean()),
  interstateMoving: optionalUndefined(z.boolean()),
  isChildcareForSixOrMore: optionalUndefined(z.boolean()),
  petCareHousing: optionalUndefined(z.boolean()),
  willSellPetCareItems: optionalUndefined(z.boolean()),
  constructionType: v195ConstructionTypeSchema,
  residentialConstructionType: v195ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v195EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v195EmploymentPlacementTypeSchema,
  propertyLeaseType: v195PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: optionalUndefined(z.boolean()),
  publicWorksContractor: optionalUndefined(z.boolean()),
}) satisfies z.ZodType<v195IndustrySpecificData>;

export const v195ProfileDataSchema = v195IndustrySpecificDataSchema.extend({
  businessPersona: v195BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: optionalUndefined(z.string()),
  legalStructureId: optionalUndefined(z.string()),
  municipality: optionalUndefined(v195MunicipalitySchema),
  dateOfFormation: optionalUndefined(z.string()),
  entityId: optionalUndefined(z.string()),
  employerId: optionalUndefined(z.string()),
  taxId: optionalUndefined(z.string()),
  hashedTaxId: optionalUndefined(z.string()),
  encryptedTaxId: optionalUndefined(z.string()),
  notes: z.string(),
  documents: v195ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: optionalUndefined(z.string()),
  taxPin: optionalUndefined(z.string()),
  encryptedTaxPin: optionalUndefined(z.string()),
  sectorId: optionalUndefined(z.string()),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v195ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v195OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), optionalUndefined(z.boolean())),
  elevatorOwningBusiness: optionalUndefined(z.boolean()),
  communityAffairsAddress: v195CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: optionalUndefined(z.boolean()),
  raffleBingoGames: optionalUndefined(z.boolean()),
  businessOpenMoreThanTwoYears: optionalUndefined(z.boolean()),
  employerAccessRegistration: optionalUndefined(z.boolean()),
  deptOfLaborEin: z.string(),
  learningBusiness: optionalUndefined(z.boolean()),
}) satisfies z.ZodType<v195ProfileData>;

export const v195FormationFormDataSchema = v195FormationAddressSchema
  .extend({
    businessName: z.string(),
    businessNameConfirmation: optionalUndefined(z.boolean()),
    businessSuffix: optionalUndefined(v195BusinessSuffixSchema),
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
    nonprofitBoardMemberQualificationsSpecified: v195InFormInBylawsSchema,
    nonprofitBoardMemberQualificationsTerms: z.string(),
    nonprofitBoardMemberRightsSpecified: v195InFormInBylawsSchema,
    nonprofitBoardMemberRightsTerms: z.string(),
    nonprofitTrusteesMethodSpecified: v195InFormInBylawsSchema,
    nonprofitTrusteesMethodTerms: z.string(),
    nonprofitAssetDistributionSpecified: v195InFormInBylawsSchema,
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
    members: optionalUndefined(z.array(v195FormationMemberSchema)),
    incorporators: optionalUndefined(z.array(v195FormationIncorporatorSchema)),
    signers: optionalUndefined(z.array(v195FormationSignerSchema.readonly())),
    paymentType: v195PaymentTypeSchema,
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
    foreignStateOfFormation: optionalUndefined(v195StateObjectSchema),
    foreignDateOfFormation: optionalUndefined(z.string()), // YYYY-MM-DD
    foreignGoodStandingFile: optionalUndefined(v195ForeignGoodStandingFileObjectSchema),
    legalType: z.string(),
    willPracticeLaw: optionalUndefined(z.boolean()),
    isVeteranNonprofit: optionalUndefined(z.boolean()),
    checkNameReservation: optionalUndefined(z.boolean()),
    howToProceed: v195HowToProceedOptionsSchema,
  })
  .readonly() satisfies z.ZodType<v195FormationFormData>;

export const v195FormationDataSchema: z.ZodType<v195FormationData> = z.object({
  formationFormData: v195FormationFormDataSchema,
  businessNameAvailability: optionalUndefined(v195NameAvailabilitySchema),
  dbaBusinessNameAvailability: optionalUndefined(v195NameAvailabilitySchema),
  formationResponse: optionalUndefined(v195FormationSubmitResponseSchema),
  getFilingResponse: optionalUndefined(v195GetFilingResponseSchema),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v195LicensesSchema = z.object(
  Object.fromEntries(
    v195LicenseNameSchema.options.map((name) => [name, v195LicenseDetailsSchema.optional()]),
  ) as Record<string, z.ZodOptional<typeof v195LicenseDetailsSchema>>,
);

export const v195LicenseDataSchema: z.ZodType<v195LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v195LicensesSchema.optional(),
});

export const v195PreferencesSchema: z.ZodType<v195Preferences> = z.object({
  roadmapOpenSections: z.array(v195SectionTypeSchema),
  roadmapOpenSteps: z.array(z.number()),
  visibleSidebarCards: z.array(z.string()),
  isCalendarFullView: z.boolean(),
  returnToLink: z.string(),
  isHideableRoadmapOpen: z.boolean(),
  phaseNewlyChanged: z.boolean(),
  isNonProfitFromFunding: z.boolean().optional(),
});

export const v195CrtkBusinessDetailsSchema: z.ZodType<v195CrtkBusinessDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v195CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v195CrtkEntrySchema: z.ZodType<v195CrtkEntry> = z.object({
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

export const v195CrtkEmailMetadataSchema: z.ZodType<v195CrtkEmailMetadata> = z.object({
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

export const v195CrtkDataSchema: z.ZodType<v195CrtkData> = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: v195CrtkBusinessDetailsSchema.optional(),
  crtkSearchResult: z.union([v195CrtkSearchResultSchema]),
  crtkEntry: v195CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v195BusinessSchema: z.ZodType<v195Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v195ProfileDataSchema,
  onboardingFormProgress: v195OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v195TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: optionalUndefined(v195LicenseDataSchema),
  preferences: v195PreferencesSchema,
  taxFilingData: v195TaxFilingDataSchema,
  formationData: v195FormationDataSchema,
  environmentData: optionalUndefined(v195EnvironmentDataSchema),
  xrayRegistrationData: optionalUndefined(v195XrayDataSchema),
  crtkData: optionalUndefined(v195CrtkDataSchema),
  roadmapTaskData: v195RoadmapTaskDataSchema,
  taxClearanceCertificateData: optionalUndefined(v195TaxClearanceCertificateDataSchema),
  cigaretteLicenseData: optionalUndefined(v195CigaretteLicenseDataSchema),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v195UserDataSchema: z.ZodType<v195UserData> = z.object({
  user: v195BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v195BusinessSchema),
  currentBusinessId: z.string(),
});
