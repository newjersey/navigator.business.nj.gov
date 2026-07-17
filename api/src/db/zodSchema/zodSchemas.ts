import {
  v192FacilityDetails,
  v192MachineDetails,
  v192QuestionnaireData,
  v192StateObject,
  v192TaxClearanceCertificateData,
  v192XrayData,
  v192XrayRegistrationStatusResponse,
  v192GetFilingResponse,
  v192FormationSubmitError,
  v192FormationSubmitResponse,
  v192FormationSigner,
  v192ForeignGoodStandingFileObject,
  v192UserTestingResponse,
  v192NewsletterResponse,
  v192ExternalStatus,
  v192CalendarEvent,
  v192LicenseSearchAddress,
  v192TaxFilingCalendarEvent,
  v192LicenseSearchNameAndAddress,
  v192TaxFilingData,
  v192LicenseDetails,
  v192Municipality,
  v192ProfileDocuments,
  v192BusinessUser,
  v192CommunityAffairsAddress,
  v192RoadmapTaskData,
  v192FormationAddress,
  v192LicenseData,
  v192Preferences,
  v192LicenseStatusItem,
  v192FormationMember,
  v192NameAvailability,
  v192NameAvailabilityResponse,
  v192IndustrySpecificData,
  v192ProfileData,
  v192FormationFormData,
  v192FormationData,
  v192Business,
  v192UserData,
  v192CrtkData,
  v192CrtkEmailMetadata,
  v192CrtkEntry,
  v192CrtkBusinessDetails,
  v192CigaretteLicensePaymentInfo,
  v192CigaretteLicenseData,
  v192EnvironmentData,
} from "@db/migrations/v192_fix_confirmation_email_sent_typo";
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
  const schemaWithBase64Check = withNoBase64Check(v192UserDataSchema);
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

export const v192XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v192WasteWaterFieldIdsSchema = z.enum([
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

export const v192WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v192WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v192WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v192DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v192DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v192DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v192DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v192WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v192WasteDataSchema = z.object(
  Object.fromEntries(v192WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v192WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v192LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v192LandDataSchema = z.object(
  Object.fromEntries(v192LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v192LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v192AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v192AirDataSchema = z.object(
  Object.fromEntries(v192AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v192AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v192PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v192BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v192FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v192SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v192InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v192HowToProceedOptionsSchema = z.enum([
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

export const v192UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v192NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v192NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v192SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v192CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v192LicenseStatusSchema = z.enum([
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

export const v192PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v192TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v192OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v192ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v192BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v192OperatingPhaseSchema = z.union([
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

export const v192CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v192CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v192ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v192ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v192EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v192EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v192ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v192TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v192TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v192taskIdLicenseNameMapping = {
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

export const v192taskIdLicenseNameMappingSchema = z.object({
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

export const v192LicenseTaskIDSchema = z.enum(
  Object.keys(v192taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v192LicenseNameSchema = z.enum(
  Object.values(v192taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v192SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v192QuestionnaireDataSchema: z.ZodType<v192QuestionnaireData> = z.object({
  air: v192AirDataSchema,
  land: v192LandDataSchema,
  waste: v192WasteDataSchema,
  drinkingWater: v192DrinkingWaterDataSchema,
  wasteWater: v192WasteWaterDataSchema,
});

export const v192MachineDetailsSchema: z.ZodType<v192MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v192XrayRegistrationStatusResponseSchema: z.ZodType<v192XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v192MachineDetailsSchema),
    status: v192XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v192FacilityDetailsSchema: z.ZodType<v192FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v192XrayDataSchema: z.ZodType<v192XrayData> = z.object({
  facilityDetails: v192FacilityDetailsSchema.optional(),
  machines: z.array(v192MachineDetailsSchema).optional(),
  status: v192XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v192CigaretteLicensePaymentInfoSchema: z.ZodType<v192CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailSent: z.boolean().optional(),
  });

export const v192StateObjectSchema: z.ZodType<v192StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v192CigaretteLicenseDataSchema: z.ZodType<v192CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v192StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v192StateObjectSchema.optional(),
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
  paymentInfo: v192CigaretteLicensePaymentInfoSchema.optional(),
});

export const v192TaxClearanceCertificateDataSchema: z.ZodType<v192TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v192StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v192EnvironmentDataSchema: z.ZodType<v192EnvironmentData> = z.object({
  questionnaireData: v192QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v192GetFilingResponseSchema: z.ZodType<v192GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v192FormationSubmitErrorSchema: z.ZodType<v192FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v192FormationSubmitResponseSchema: z.ZodType<v192FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v192FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v192FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v192SignerTitleSchema,
}) satisfies z.ZodType<v192FormationSigner>;

export const v192ForeignGoodStandingFileObjectSchema: z.ZodType<v192ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v192NameAvailabilityResponseSchema = z.object({
  status: z.union([v192NameAvailabilityStatusSchema, z.undefined()]),
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v192NameAvailabilityResponse>;

export const v192NameAvailabilitySchema = v192NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v192NameAvailability>;

export const v192NewsletterResponseSchema: z.ZodType<v192NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v192NewsletterStatusSchema,
});

export const v192UserTestingResponseSchema: z.ZodType<v192UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v192UserTestingStatusSchema,
});

export const v192ExternalStatusSchema: z.ZodType<v192ExternalStatus> = z.object({
  newsletter: v192NewsletterResponseSchema.optional(),
  userTesting: v192UserTestingResponseSchema.optional(),
});

export const v192CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v192CalendarEvent>;

export const v192LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v192LicenseSearchAddress>;

export const v192TaxFilingCalendarEventSchema = v192CalendarEventSchema
  .extend({
    identifier: z.string(),
    calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
  })
  .readonly() satisfies z.ZodType<v192TaxFilingCalendarEvent>;

export const v192LicenseSearchNameAndAddressSchema = v192LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v192LicenseSearchNameAndAddress>;

export const v192TaxFilingDataSchema: z.ZodType<v192TaxFilingData> = z.object({
  state: v192TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v192TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v192TaxFilingCalendarEventSchema),
});

export const v192MunicipalitySchema: z.ZodType<v192Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v192LicenseStatusItemSchema: z.ZodType<v192LicenseStatusItem> = z.object({
  title: z.string(),
  status: v192CheckoffStatusSchema,
});

export const v192LicenseDetailsSchema: z.ZodType<v192LicenseDetails> = z.object({
  nameAndAddress: v192LicenseSearchNameAndAddressSchema,
  licenseStatus: v192LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v192LicenseStatusItemSchema),
});

export const v192CommunityAffairsAddressSchema: z.ZodType<v192CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v192MunicipalitySchema,
});

export const v192BusinessUserSchema: z.ZodType<v192BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v192ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v192ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v192ProfileDocumentsSchema: z.ZodType<v192ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v192RoadmapTaskDataSchema: z.ZodType<v192RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v192FormationAddressSchema = z.object({
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
  addressState: v192StateObjectSchema.optional(),
  addressMunicipality: v192MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: z.union([v192FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v192FormationAddress>;

export const v192FormationMemberSchema = v192FormationAddressSchema
  .extend({
    name: z.string(),
  })
  .readonly() satisfies z.ZodType<v192FormationMember>;

export const v192FormationIncorporatorSchema = z
  .object({
    ...v192FormationSignerSchema.shape,
    ...v192FormationAddressSchema.shape,
  })
  .readonly();

export const v192IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.union([z.boolean(), z.undefined()]),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v192CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: v192CarServiceTypeSchema,
  interstateTransport: z.union([z.boolean(), z.undefined()]),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v192ConstructionTypeSchema,
  residentialConstructionType: v192ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v192EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v192EmploymentPlacementTypeSchema,
  propertyLeaseType: v192PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v192IndustrySpecificData>;

export const v192ProfileDataSchema = v192IndustrySpecificDataSchema.extend({
  businessPersona: v192BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v192MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v192ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v192ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v192OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v192CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v192ProfileData>;

export const v192FormationFormDataSchema = v192FormationAddressSchema
  .extend({
    businessName: z.string(),
    businessNameConfirmation: z.union([z.boolean(), z.undefined()]),
    businessSuffix: z.union([v192BusinessSuffixSchema, z.undefined()]),
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
    nonprofitBoardMemberQualificationsSpecified: v192InFormInBylawsSchema,
    nonprofitBoardMemberQualificationsTerms: z.string(),
    nonprofitBoardMemberRightsSpecified: v192InFormInBylawsSchema,
    nonprofitBoardMemberRightsTerms: z.string(),
    nonprofitTrusteesMethodSpecified: v192InFormInBylawsSchema,
    nonprofitTrusteesMethodTerms: z.string(),
    nonprofitAssetDistributionSpecified: v192InFormInBylawsSchema,
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
    members: z.union([z.array(v192FormationMemberSchema), z.undefined()]),
    incorporators: z.union([z.array(v192FormationIncorporatorSchema), z.undefined()]),
    signers: z.union([z.array(v192FormationSignerSchema.readonly()), z.undefined()]),
    paymentType: v192PaymentTypeSchema,
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
    foreignStateOfFormation: z.union([v192StateObjectSchema, z.undefined()]),
    foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
    foreignGoodStandingFile: z.union([v192ForeignGoodStandingFileObjectSchema, z.undefined()]),
    legalType: z.string(),
    willPracticeLaw: z.union([z.boolean(), z.undefined()]),
    isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
    checkNameReservation: z.union([z.boolean(), z.undefined()]),
    howToProceed: v192HowToProceedOptionsSchema,
  })
  .readonly() satisfies z.ZodType<v192FormationFormData>;

export const v192FormationDataSchema: z.ZodType<v192FormationData> = z.object({
  formationFormData: v192FormationFormDataSchema,
  businessNameAvailability: z.union([v192NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v192NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v192FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v192GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v192LicensesSchema = z.object(
  Object.fromEntries(
    v192LicenseNameSchema.options.map((name) => [name, v192LicenseDetailsSchema.optional()]),
  ) as Record<string, z.ZodOptional<typeof v192LicenseDetailsSchema>>,
);

export const v192LicenseDataSchema: z.ZodType<v192LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v192LicensesSchema.optional(),
});

export const v192PreferencesSchema: z.ZodType<v192Preferences> = z.object({
  roadmapOpenSections: z.array(v192SectionTypeSchema),
  roadmapOpenSteps: z.array(z.number()),
  visibleSidebarCards: z.array(z.string()),
  isCalendarFullView: z.boolean(),
  returnToLink: z.string(),
  isHideableRoadmapOpen: z.boolean(),
  phaseNewlyChanged: z.boolean(),
  isNonProfitFromFunding: z.boolean().optional(),
});

export const v192CrtkBusinessDetailsSchema: z.ZodType<v192CrtkBusinessDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  city: z.string(),
  addressZipCode: z.string(),
  ein: z.string().optional(),
});

export const v192CrtkSearchResultSchema = z.enum(["FOUND", "NOT_FOUND"]);

export const v192CrtkEntrySchema: z.ZodType<v192CrtkEntry> = z.object({
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

export const v192CrtkEmailMetadataSchema: z.ZodType<v192CrtkEmailMetadata> = z.object({
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

export const v192CrtkDataSchema: z.ZodType<v192CrtkData> = z.object({
  lastUpdatedISO: z.string(),
  crtkBusinessDetails: v192CrtkBusinessDetailsSchema.optional(),
  crtkSearchResult: z.union([v192CrtkSearchResultSchema]),
  crtkEntry: v192CrtkEntrySchema,
  crtkEmailSent: z.boolean().optional(),
});

export const v192BusinessSchema: z.ZodType<v192Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v192ProfileDataSchema,
  onboardingFormProgress: v192OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v192TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v192LicenseDataSchema, z.undefined()]),
  preferences: v192PreferencesSchema,
  taxFilingData: v192TaxFilingDataSchema,
  formationData: v192FormationDataSchema,
  environmentData: z.union([v192EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v192XrayDataSchema, z.undefined()]),
  crtkData: z.union([v192CrtkDataSchema, z.undefined()]),
  roadmapTaskData: v192RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v192TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v192CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v192UserDataSchema: z.ZodType<v192UserData> = z.object({
  user: v192BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v192BusinessSchema),
  currentBusinessId: z.string(),
});
