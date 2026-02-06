import {
  v187Business,
  v187BusinessUser,
  v187CalendarEvent,
  v187CigaretteLicenseData,
  v187CigaretteLicensePaymentInfo,
  v187CommunityAffairsAddress,
  v187EnvironmentData,
  v187ExternalStatus,
  v187FacilityDetails,
  v187ForeignGoodStandingFileObject,
  v187FormationAddress,
  v187FormationData,
  v187FormationFormData,
  v187FormationMember,
  v187FormationSigner,
  v187FormationSubmitError,
  v187FormationSubmitResponse,
  v187GetFilingResponse,
  v187IndustrySpecificData,
  v187LicenseData,
  v187LicenseDetails,
  v187LicenseSearchAddress,
  v187LicenseSearchNameAndAddress,
  v187LicenseStatusItem,
  v187MachineDetails,
  v187Municipality,
  v187NameAvailability,
  v187NameAvailabilityResponse,
  v187NewsletterResponse,
  v187Preferences,
  v187ProfileData,
  v187ProfileDocuments,
  v187QuestionnaireData,
  v187RoadmapTaskData,
  v187StateObject,
  v187TaxClearanceCertificateData,
  v187TaxFilingCalendarEvent,
  v187TaxFilingData,
  v187UserData,
  v187UserTestingResponse,
  v187XrayData,
  v187XrayRegistrationStatusResponse,
} from "@db/migrations/v187_add_crtk_data";
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

  const minLength = hasPadding ? 20 : 128;

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
  const schemaWithBase64Check = withNoBase64Check(v187UserDataSchema);
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

export const v187XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v187WasteWaterFieldIdsSchema = z.enum([
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

export const v187WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v187WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v187WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v187DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v187DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v187DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v187DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v187WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v187WasteDataSchema = z.object(
  Object.fromEntries(v187WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v187WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v187LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v187LandDataSchema = z.object(
  Object.fromEntries(v187LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v187LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v187AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v187AirDataSchema = z.object(
  Object.fromEntries(v187AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v187AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v187PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v187BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v187FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v187SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v187InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v187HowToProceedOptionsSchema = z.enum([
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

export const v187UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v187NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v187NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v187SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v187CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v187LicenseStatusSchema = z.enum([
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

export const v187PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v187TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v187OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v187ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v187BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v187OperatingPhaseSchema = z.union([
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

export const v187CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v187CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v187ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v187ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v187EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v187EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v187ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v187TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v187TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v187taskIdLicenseNameMapping = {
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

export const v187taskIdLicenseNameMappingSchema = z.object({
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

export const v187LicenseTaskIDSchema = z.enum(
  Object.keys(v187taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v187LicenseNameSchema = z.enum(
  Object.values(v187taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v187SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v187QuestionnaireDataSchema: z.ZodType<v187QuestionnaireData> = z.object({
  air: v187AirDataSchema,
  land: v187LandDataSchema,
  waste: v187WasteDataSchema,
  drinkingWater: v187DrinkingWaterDataSchema,
  wasteWater: v187WasteWaterDataSchema,
});

export const v187MachineDetailsSchema: z.ZodType<v187MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v187XrayRegistrationStatusResponseSchema: z.ZodType<v187XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v187MachineDetailsSchema),
    status: v187XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v187FacilityDetailsSchema: z.ZodType<v187FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v187XrayDataSchema: z.ZodType<v187XrayData> = z.object({
  facilityDetails: v187FacilityDetailsSchema.optional(),
  machines: z.array(v187MachineDetailsSchema).optional(),
  status: v187XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v187CigaretteLicensePaymentInfoSchema: z.ZodType<v187CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v187StateObjectSchema: z.ZodType<v187StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v187CigaretteLicenseDataSchema: z.ZodType<v187CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v187StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v187StateObjectSchema.optional(),
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
  paymentInfo: v187CigaretteLicensePaymentInfoSchema.optional(),
});

export const v187TaxClearanceCertificateDataSchema: z.ZodType<v187TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v187StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v187EnvironmentDataSchema: z.ZodType<v187EnvironmentData> = z.object({
  questionnaireData: v187QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v187GetFilingResponseSchema: z.ZodType<v187GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v187FormationSubmitErrorSchema: z.ZodType<v187FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v187FormationSubmitResponseSchema: z.ZodType<v187FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v187FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v187FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v187SignerTitleSchema,
}) satisfies z.ZodType<v187FormationSigner>;

export const v187ForeignGoodStandingFileObjectSchema: z.ZodType<v187ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v187NameAvailabilityResponseSchema = z.object({
  status: v187NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v187NameAvailabilityResponse>;

export const v187NameAvailabilitySchema = v187NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v187NameAvailability>;

export const v187NewsletterResponseSchema: z.ZodType<v187NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v187NewsletterStatusSchema,
});

export const v187UserTestingResponseSchema: z.ZodType<v187UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v187UserTestingStatusSchema,
});

export const v187ExternalStatusSchema: z.ZodType<v187ExternalStatus> = z.object({
  newsletter: v187NewsletterResponseSchema.optional(),
  userTesting: v187UserTestingResponseSchema.optional(),
});

export const v187CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v187CalendarEvent>;

export const v187LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v187LicenseSearchAddress>;

export const v187TaxFilingCalendarEventSchema = v187CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v187TaxFilingCalendarEvent>;

export const v187LicenseSearchNameAndAddressSchema = v187LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v187LicenseSearchNameAndAddress>;

export const v187TaxFilingDataSchema: z.ZodType<v187TaxFilingData> = z.object({
  state: v187TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v187TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v187TaxFilingCalendarEventSchema),
});

export const v187MunicipalitySchema: z.ZodType<v187Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v187LicenseStatusItemSchema: z.ZodType<v187LicenseStatusItem> = z.object({
  title: z.string(),
  status: v187CheckoffStatusSchema,
});

export const v187LicenseDetailsSchema: z.ZodType<v187LicenseDetails> = z.object({
  nameAndAddress: v187LicenseSearchNameAndAddressSchema,
  licenseStatus: v187LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v187LicenseStatusItemSchema),
});

export const v187CommunityAffairsAddressSchema: z.ZodType<v187CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v187MunicipalitySchema,
});

export const v187BusinessUserSchema: z.ZodType<v187BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v187ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v187ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v187ProfileDocumentsSchema: z.ZodType<v187ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v187RoadmapTaskDataSchema: z.ZodType<v187RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v187FormationAddressSchema = z.object({
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
  addressState: v187StateObjectSchema.optional(),
  addressMunicipality: v187MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: z.union([v187FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v187FormationAddress>;

export const v187FormationMemberSchema = v187FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v187FormationMember>;

export const v187FormationIncorporatorSchema = z.object({
  ...v187FormationSignerSchema.shape,
  ...v187FormationAddressSchema.shape,
});

export const v187IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v187CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v187CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.union([z.boolean(), z.undefined()]),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v187ConstructionTypeSchema,
  residentialConstructionType: v187ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v187EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v187EmploymentPlacementTypeSchema,
  propertyLeaseType: v187PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v187IndustrySpecificData>;

export const v187ProfileDataSchema = v187IndustrySpecificDataSchema.extend({
  businessPersona: v187BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v187MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v187ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v187ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v187OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v187CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v187ProfileData>;

export const v187FormationFormDataSchema = v187FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: z.union([v187BusinessSuffixSchema, z.undefined()]),
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
  nonprofitBoardMemberQualificationsSpecified: v187InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v187InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v187InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v187InFormInBylawsSchema,
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
  members: z.union([z.array(v187FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v187FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v187FormationSignerSchema), z.undefined()]),
  paymentType: v187PaymentTypeSchema,
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
  foreignStateOfFormation: z.union([v187StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v187ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.boolean(),
  howToProceed: v187HowToProceedOptionsSchema,
}) satisfies z.ZodType<v187FormationFormData>;

export const v187FormationDataSchema: z.ZodType<v187FormationData> = z.object({
  formationFormData: v187FormationFormDataSchema,
  businessNameAvailability: z.union([v187NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v187NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v187FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v187GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v187LicensesSchema = z.record(z.string(), v187LicenseDetailsSchema);

export const v187LicenseDataSchema: z.ZodType<v187LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v187LicensesSchema.optional(),
});

export const v187PreferencesSchema: z.ZodType<v187Preferences> = z.object({
  roadmapOpenSections: z.array(v187SectionTypeSchema),
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

export const v187CrtkBusinessDetailsSchema = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v187CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v187CrtkEntrySchema = z.object({
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

export const v187CrtkEmailMetadataSchema = z.object({
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

export const v187CrtkDataSchema = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: z.union([v187CrtkBusinessDetailsSchema, z.undefined()]),
  crtkSearchResult: z.union([v187CrtkSearchResultSchema]),
  crtkEntry: v187CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v187BusinessSchema: z.ZodType<v187Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v187ProfileDataSchema,
  onboardingFormProgress: v187OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v187TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v187LicenseDataSchema, z.undefined()]),
  preferences: v187PreferencesSchema,
  taxFilingData: v187TaxFilingDataSchema,
  formationData: v187FormationDataSchema,
  environmentData: z.union([v187EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v187XrayDataSchema, z.undefined()]),
  crtkData: z.union([v187CrtkDataSchema, z.undefined()]),
  roadmapTaskData: v187RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v187TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v187CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v187UserDataSchema: z.ZodType<v187UserData> = z.object({
  user: v187BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v187BusinessSchema),
  currentBusinessId: z.string(),
});
