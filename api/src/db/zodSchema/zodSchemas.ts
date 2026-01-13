import { z, ZodTypeAny } from "zod";
import {
  v184CigaretteLicenseData,
  v184CigaretteLicensePaymentInfo,
  v184EnvironmentData,
  v184FacilityDetails,
  v184MachineDetails,
  v184QuestionnaireData,
  v184StateObject,
  v184TaxClearanceCertificateData,
  v184XrayData,
  v184XrayRegistrationStatusResponse,
  v184GetFilingResponse,
  v184FormationSubmitError,
  v184FormationSubmitResponse,
  v184FormationSigner,
  v184ForeignGoodStandingFileObject,
  v184UserTestingResponse,
  v184NewsletterResponse,
  v184ExternalStatus,
  v184CalendarEvent,
  v184LicenseSearchAddress,
  v184TaxFilingCalendarEvent,
  v184LicenseSearchNameAndAddress,
  v184TaxFilingData,
  v184LicenseDetails,
  v184Municipality,
  v184ProfileDocuments,
  v184BusinessUser,
  v184CommunityAffairsAddress,
  v184RoadmapTaskData,
  v184FormationAddress,
  v184LicenseData,
  v184Preferences,
  v184LicenseStatusItem,
  v184FormationMember,
  v184NameAvailability,
  v184NameAvailabilityResponse,
  v184IndustrySpecificData,
  v184ProfileData,
  v184FormationFormData,
  v184FormationData,
  v184Business,
  v184UserData,
} from "@db/migrations/v184_change_addresscountry_interstatetransport";
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

  if (trimmed.length < 20) return false;

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
  const schemaWithBase64Check = withNoBase64Check(v184UserDataSchema);
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

export const v184XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v184WasteWaterFieldIdsSchema = z.enum([
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

export const v184WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v184WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v184WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v184DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v184DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v184DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v184DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v184WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v184WasteDataSchema = z.object(
  Object.fromEntries(v184WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v184WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v184LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v184LandDataSchema = z.object(
  Object.fromEntries(v184LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v184LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v184AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v184AirDataSchema = z.object(
  Object.fromEntries(v184AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v184AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v184PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v184BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v184FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v184SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v184InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v184HowToProceedOptionsSchema = z.enum([
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

export const v184UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v184NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v184NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v184SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v184CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v184LicenseStatusSchema = z.enum([
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

export const v184PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v184TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v184OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v184ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v184BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v184OperatingPhaseSchema = z.union([
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

export const v184CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v184CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v184ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v184ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v184EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v184EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v184ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v184TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v184TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v184taskIdLicenseNameMapping = {
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

export const v184taskIdLicenseNameMappingSchema = z.object({
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

export const v184LicenseTaskIDSchema = z.enum(
  Object.keys(v184taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v184LicenseNameSchema = z.enum(
  Object.values(v184taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v184SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v184QuestionnaireDataSchema: z.ZodType<v184QuestionnaireData> = z.object({
  air: v184AirDataSchema,
  land: v184LandDataSchema,
  waste: v184WasteDataSchema,
  drinkingWater: v184DrinkingWaterDataSchema,
  wasteWater: v184WasteWaterDataSchema,
});

export const v184MachineDetailsSchema: z.ZodType<v184MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v184XrayRegistrationStatusResponseSchema: z.ZodType<v184XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v184MachineDetailsSchema),
    status: v184XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v184FacilityDetailsSchema: z.ZodType<v184FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v184XrayDataSchema: z.ZodType<v184XrayData> = z.object({
  facilityDetails: v184FacilityDetailsSchema.optional(),
  machines: z.array(v184MachineDetailsSchema).optional(),
  status: v184XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v184CigaretteLicensePaymentInfoSchema: z.ZodType<v184CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v184StateObjectSchema: z.ZodType<v184StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v184CigaretteLicenseDataSchema: z.ZodType<v184CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v184StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v184StateObjectSchema.optional(),
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
  paymentInfo: v184CigaretteLicensePaymentInfoSchema.optional(),
});

export const v184TaxClearanceCertificateDataSchema: z.ZodType<v184TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v184StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v184EnvironmentDataSchema: z.ZodType<v184EnvironmentData> = z.object({
  questionnaireData: v184QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v184GetFilingResponseSchema: z.ZodType<v184GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v184FormationSubmitErrorSchema: z.ZodType<v184FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v184FormationSubmitResponseSchema: z.ZodType<v184FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v184FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v184FormationSignerSchema = z.object({
  name: z.string().max(SIGNER_NAME_MAX_CHAR, {
    message: `signer name cannot exceed ${SIGNER_NAME_MAX_CHAR} characters`,
  }),
  signature: z.boolean(),
  title: v184SignerTitleSchema,
}) satisfies z.ZodType<v184FormationSigner>;

export const v184ForeignGoodStandingFileObjectSchema: z.ZodType<v184ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v184NameAvailabilityResponseSchema = z.object({
  status: v184NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v184NameAvailabilityResponse>;

export const v184NameAvailabilitySchema = v184NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v184NameAvailability>;

export const v184NewsletterResponseSchema: z.ZodType<v184NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v184NewsletterStatusSchema,
});

export const v184UserTestingResponseSchema: z.ZodType<v184UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v184UserTestingStatusSchema,
});

export const v184ExternalStatusSchema: z.ZodType<v184ExternalStatus> = z.object({
  newsletter: v184NewsletterResponseSchema.optional(),
  userTesting: v184UserTestingResponseSchema.optional(),
});

export const v184CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v184CalendarEvent>;

export const v184LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v184LicenseSearchAddress>;

export const v184TaxFilingCalendarEventSchema = v184CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v184TaxFilingCalendarEvent>;

export const v184LicenseSearchNameAndAddressSchema = v184LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v184LicenseSearchNameAndAddress>;

export const v184TaxFilingDataSchema: z.ZodType<v184TaxFilingData> = z.object({
  state: v184TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v184TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v184TaxFilingCalendarEventSchema),
});

export const v184MunicipalitySchema: z.ZodType<v184Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v184LicenseStatusItemSchema: z.ZodType<v184LicenseStatusItem> = z.object({
  title: z.string(),
  status: v184CheckoffStatusSchema,
});

export const v184LicenseDetailsSchema: z.ZodType<v184LicenseDetails> = z.object({
  nameAndAddress: v184LicenseSearchNameAndAddressSchema,
  licenseStatus: v184LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v184LicenseStatusItemSchema),
});

export const v184CommunityAffairsAddressSchema: z.ZodType<v184CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v184MunicipalitySchema,
});

export const v184BusinessUserSchema: z.ZodType<v184BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v184ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v184ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v184ProfileDocumentsSchema: z.ZodType<v184ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v184RoadmapTaskDataSchema: z.ZodType<v184RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v184FormationAddressSchema = z.object({
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
  addressState: v184StateObjectSchema.optional(),
  addressMunicipality: v184MunicipalitySchema.optional(),
  addressProvince: z
    .string()
    .max(BUSINESS_ADDRESS_PROVINCE_MAX_CHAR, {
      message: `address province cannot exceed ${BUSINESS_ADDRESS_PROVINCE_MAX_CHAR} characters`,
    })
    .optional(),
  addressZipCode: z.string(),
  addressCountry: z.string().optional(),
  businessLocationType: z.union([v184FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v184FormationAddress>;

export const v184FormationMemberSchema = v184FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v184FormationMember>;

export const v184FormationIncorporatorSchema = z.object({
  ...v184FormationSignerSchema.shape,
  ...v184FormationAddressSchema.shape,
});

export const v184IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v184CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v184CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.union([z.boolean(), z.undefined()]),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v184ConstructionTypeSchema,
  residentialConstructionType: v184ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v184EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v184EmploymentPlacementTypeSchema,
  propertyLeaseType: v184PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v184IndustrySpecificData>;

export const v184ProfileDataSchema = v184IndustrySpecificDataSchema.extend({
  businessPersona: v184BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v184MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v184ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v184ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v184OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v184CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v184ProfileData>;

export const v184FormationFormDataSchema = v184FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: z.union([v184BusinessSuffixSchema, z.undefined()]),
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
  nonprofitBoardMemberQualificationsSpecified: v184InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v184InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v184InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v184InFormInBylawsSchema,
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
  members: z.union([z.array(v184FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v184FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v184FormationSignerSchema), z.undefined()]),
  paymentType: v184PaymentTypeSchema,
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
  foreignStateOfFormation: z.union([v184StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v184ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.boolean(),
  howToProceed: v184HowToProceedOptionsSchema,
}) satisfies z.ZodType<v184FormationFormData>;

export const v184FormationDataSchema: z.ZodType<v184FormationData> = z.object({
  formationFormData: v184FormationFormDataSchema,
  businessNameAvailability: z.union([v184NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v184NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v184FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v184GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v184LicensesSchema = z.record(z.string(), v184LicenseDetailsSchema);

export const v184LicenseDataSchema: z.ZodType<v184LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v184LicensesSchema.optional(),
});

export const v184PreferencesSchema: z.ZodType<v184Preferences> = z.object({
  roadmapOpenSections: z.array(v184SectionTypeSchema),
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

export const v184BusinessSchema: z.ZodType<v184Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v184ProfileDataSchema,
  onboardingFormProgress: v184OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v184TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v184LicenseDataSchema, z.undefined()]),
  preferences: v184PreferencesSchema,
  taxFilingData: v184TaxFilingDataSchema,
  formationData: v184FormationDataSchema,
  environmentData: z.union([v184EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v184XrayDataSchema, z.undefined()]),
  roadmapTaskData: v184RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v184TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v184CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v184UserDataSchema: z.ZodType<v184UserData> = z.object({
  user: v184BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v184BusinessSchema),
  currentBusinessId: z.string(),
});
