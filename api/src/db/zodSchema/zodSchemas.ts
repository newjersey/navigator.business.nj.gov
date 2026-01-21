import { z, ZodTypeAny } from "zod";
import {
  v186CigaretteLicenseData,
  v186CigaretteLicensePaymentInfo,
  v186EnvironmentData,
  v186FacilityDetails,
  v186MachineDetails,
  v186QuestionnaireData,
  v186StateObject,
  v186TaxClearanceCertificateData,
  v186XrayData,
  v186XrayRegistrationStatusResponse,
  v186GetFilingResponse,
  v186FormationSubmitError,
  v186FormationSubmitResponse,
  v186FormationSigner,
  v186ForeignGoodStandingFileObject,
  v186UserTestingResponse,
  v186NewsletterResponse,
  v186ExternalStatus,
  v186CalendarEvent,
  v186LicenseSearchAddress,
  v186TaxFilingCalendarEvent,
  v186LicenseSearchNameAndAddress,
  v186TaxFilingData,
  v186LicenseDetails,
  v186Municipality,
  v186ProfileDocuments,
  v186BusinessUser,
  v186CommunityAffairsAddress,
  v186RoadmapTaskData,
  v186FormationAddress,
  v186LicenseData,
  v186Preferences,
  v186LicenseStatusItem,
  v186FormationMember,
  v186NameAvailability,
  v186NameAvailabilityResponse,
  v186IndustrySpecificData,
  v186ProfileData,
  v186FormationFormData,
  v186FormationData,
  v186Business,
  v186UserData,
} from "@db/migrations/v186_zod_base64_encoding";
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
  const schemaWithBase64Check = withNoBase64Check(v186UserDataSchema);
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

export const v186XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v186WasteWaterFieldIdsSchema = z.enum([
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

export const v186WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v186WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v186WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v186DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v186DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v186DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v186DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v186WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v186WasteDataSchema = z.object(
  Object.fromEntries(v186WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v186WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v186LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v186LandDataSchema = z.object(
  Object.fromEntries(v186LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v186LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v186AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v186AirDataSchema = z.object(
  Object.fromEntries(v186AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v186AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v186PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v186BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v186FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v186SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v186InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v186HowToProceedOptionsSchema = z.enum([
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

export const v186UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v186NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v186NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v186SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v186CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v186LicenseStatusSchema = z.enum([
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

export const v186PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v186TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v186OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v186ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v186BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v186OperatingPhaseSchema = z.union([
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

export const v186CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v186CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v186ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v186ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v186EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v186EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v186ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v186TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v186TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v186taskIdLicenseNameMapping = {
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

export const v186taskIdLicenseNameMappingSchema = z.object({
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

export const v186LicenseTaskIDSchema = z.enum(
  Object.keys(v186taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v186LicenseNameSchema = z.enum(
  Object.values(v186taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v186SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v186QuestionnaireDataSchema: z.ZodType<v186QuestionnaireData> = z.object({
  air: v186AirDataSchema,
  land: v186LandDataSchema,
  waste: v186WasteDataSchema,
  drinkingWater: v186DrinkingWaterDataSchema,
  wasteWater: v186WasteWaterDataSchema,
});

export const v186MachineDetailsSchema: z.ZodType<v186MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v186XrayRegistrationStatusResponseSchema: z.ZodType<v186XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v186MachineDetailsSchema),
    status: v186XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v186FacilityDetailsSchema: z.ZodType<v186FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v186XrayDataSchema: z.ZodType<v186XrayData> = z.object({
  facilityDetails: v186FacilityDetailsSchema.optional(),
  machines: z.array(v186MachineDetailsSchema).optional(),
  status: v186XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v186CigaretteLicensePaymentInfoSchema: z.ZodType<v186CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v186StateObjectSchema: z.ZodType<v186StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v186CigaretteLicenseDataSchema: z.ZodType<v186CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v186StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v186StateObjectSchema.optional(),
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
  paymentInfo: v186CigaretteLicensePaymentInfoSchema.optional(),
});

export const v186TaxClearanceCertificateDataSchema: z.ZodType<v186TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v186StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v186EnvironmentDataSchema: z.ZodType<v186EnvironmentData> = z.object({
  questionnaireData: v186QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v186GetFilingResponseSchema: z.ZodType<v186GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v186FormationSubmitErrorSchema: z.ZodType<v186FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v186FormationSubmitResponseSchema: z.ZodType<v186FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v186FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v186FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v186SignerTitleSchema,
}) satisfies z.ZodType<v186FormationSigner>;

export const v186ForeignGoodStandingFileObjectSchema: z.ZodType<v186ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v186NameAvailabilityResponseSchema = z.object({
  status: v186NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v186NameAvailabilityResponse>;

export const v186NameAvailabilitySchema = v186NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v186NameAvailability>;

export const v186NewsletterResponseSchema: z.ZodType<v186NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v186NewsletterStatusSchema,
});

export const v186UserTestingResponseSchema: z.ZodType<v186UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v186UserTestingStatusSchema,
});

export const v186ExternalStatusSchema: z.ZodType<v186ExternalStatus> = z.object({
  newsletter: v186NewsletterResponseSchema.optional(),
  userTesting: v186UserTestingResponseSchema.optional(),
});

export const v186CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v186CalendarEvent>;

export const v186LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v186LicenseSearchAddress>;

export const v186TaxFilingCalendarEventSchema = v186CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v186TaxFilingCalendarEvent>;

export const v186LicenseSearchNameAndAddressSchema = v186LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v186LicenseSearchNameAndAddress>;

export const v186TaxFilingDataSchema: z.ZodType<v186TaxFilingData> = z.object({
  state: v186TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v186TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v186TaxFilingCalendarEventSchema),
});

export const v186MunicipalitySchema: z.ZodType<v186Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v186LicenseStatusItemSchema: z.ZodType<v186LicenseStatusItem> = z.object({
  title: z.string(),
  status: v186CheckoffStatusSchema,
});

export const v186LicenseDetailsSchema: z.ZodType<v186LicenseDetails> = z.object({
  nameAndAddress: v186LicenseSearchNameAndAddressSchema,
  licenseStatus: v186LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v186LicenseStatusItemSchema),
});

export const v186CommunityAffairsAddressSchema: z.ZodType<v186CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v186MunicipalitySchema,
});

export const v186BusinessUserSchema: z.ZodType<v186BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v186ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v186ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v186ProfileDocumentsSchema: z.ZodType<v186ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v186RoadmapTaskDataSchema: z.ZodType<v186RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v186FormationAddressSchema = z.object({
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
  addressState: v186StateObjectSchema.optional(),
  addressMunicipality: v186MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: z.union([v186FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v186FormationAddress>;

export const v186FormationMemberSchema = v186FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v186FormationMember>;

export const v186FormationIncorporatorSchema = z.object({
  ...v186FormationSignerSchema.shape,
  ...v186FormationAddressSchema.shape,
});

export const v186IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v186CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v186CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.union([z.boolean(), z.undefined()]),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v186ConstructionTypeSchema,
  residentialConstructionType: v186ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v186EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v186EmploymentPlacementTypeSchema,
  propertyLeaseType: v186PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v186IndustrySpecificData>;

export const v186ProfileDataSchema = v186IndustrySpecificDataSchema.extend({
  businessPersona: v186BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v186MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v186ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v186ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v186OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v186CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v186ProfileData>;

export const v186FormationFormDataSchema = v186FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: z.union([v186BusinessSuffixSchema, z.undefined()]),
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
  nonprofitBoardMemberQualificationsSpecified: v186InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v186InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v186InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v186InFormInBylawsSchema,
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
  members: z.union([z.array(v186FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v186FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v186FormationSignerSchema), z.undefined()]),
  paymentType: v186PaymentTypeSchema,
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
  foreignStateOfFormation: z.union([v186StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v186ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.boolean(),
  howToProceed: v186HowToProceedOptionsSchema,
}) satisfies z.ZodType<v186FormationFormData>;

export const v186FormationDataSchema: z.ZodType<v186FormationData> = z.object({
  formationFormData: v186FormationFormDataSchema,
  businessNameAvailability: z.union([v186NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v186NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v186FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v186GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v186LicensesSchema = z.record(z.string(), v186LicenseDetailsSchema);

export const v186LicenseDataSchema: z.ZodType<v186LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v186LicensesSchema.optional(),
});

export const v186PreferencesSchema: z.ZodType<v186Preferences> = z.object({
  roadmapOpenSections: z.array(v186SectionTypeSchema),
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

export const v186BusinessSchema: z.ZodType<v186Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v186ProfileDataSchema,
  onboardingFormProgress: v186OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v186TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v186LicenseDataSchema, z.undefined()]),
  preferences: v186PreferencesSchema,
  taxFilingData: v186TaxFilingDataSchema,
  formationData: v186FormationDataSchema,
  environmentData: z.union([v186EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v186XrayDataSchema, z.undefined()]),
  roadmapTaskData: v186RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v186TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v186CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v186UserDataSchema: z.ZodType<v186UserData> = z.object({
  user: v186BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v186BusinessSchema),
  currentBusinessId: z.string(),
});
