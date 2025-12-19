import { z } from "zod";
import {
  v183CigaretteLicenseData,
  v183CigaretteLicensePaymentInfo,
  v183EnvironmentData,
  v183FacilityDetails,
  v183MachineDetails,
  v183QuestionnaireData,
  v183StateObject,
  v183TaxClearanceCertificateData,
  v183XrayData,
  v183XrayRegistrationStatusResponse,
  v183GetFilingResponse,
  v183FormationSubmitError,
  v183FormationSubmitResponse,
  v183FormationSigner,
  v183ForeignGoodStandingFileObject,
  v183UserTestingResponse,
  v183NewsletterResponse,
  v183ExternalStatus,
  v183CalendarEvent,
  v183LicenseSearchAddress,
  v183TaxFilingCalendarEvent,
  v183LicenseSearchNameAndAddress,
  v183TaxFilingData,
  v183LicenseDetails,
  v183Municipality,
  v183ProfileDocuments,
  v183BusinessUser,
  v183CommunityAffairsAddress,
  v183RoadmapTaskData,
  v183FormationAddress,
  v183LicenseData,
  v183Preferences,
  v183LicenseStatusItem,
  v183FormationMember,
  v183NameAvailability,
  v183NameAvailabilityResponse,
  v183IndustrySpecificData,
  v183ProfileData,
  v183FormationFormData,
  v183FormationData,
  v183Business,
  v183UserData,
} from "@db/migrations/v183_zod_changes";
import { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";

export const parseUserData = (logger: LogWriterType, userData: UserData): void => {
  const result = v183UserDataSchema.safeParse(userData);

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

export const v183XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v183WasteWaterFieldIdsSchema = z.enum([
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

export const v183WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v183WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v183WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v183DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v183DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v183DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v183DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v183WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v183WasteDataSchema = z.object(
  Object.fromEntries(v183WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v183WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v183LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v183LandDataSchema = z.object(
  Object.fromEntries(v183LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v183LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v183AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v183AirDataSchema = z.object(
  Object.fromEntries(v183AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v183AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v183PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v183BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v183FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v183SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v183InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v183HowToProceedOptionsSchema = z.enum([
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

export const v183UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v183NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v183NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v183SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v183CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v183LicenseStatusSchema = z.enum([
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

export const v183PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v183TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v183OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v183ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v183BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v183OperatingPhaseSchema = z.union([
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

export const v183CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v183CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v183ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v183ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v183EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v183EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v183ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v183TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v183TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v183taskIdLicenseNameMapping = {
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

export const v183taskIdLicenseNameMappingSchema = z.object({
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

export const v183LicenseTaskIDSchema = z.enum(
  Object.keys(v183taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v183LicenseNameSchema = z.enum(
  Object.values(v183taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v183SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v183QuestionnaireDataSchema: z.ZodType<v183QuestionnaireData> = z.object({
  air: v183AirDataSchema,
  land: v183LandDataSchema,
  waste: v183WasteDataSchema,
  drinkingWater: v183DrinkingWaterDataSchema,
  wasteWater: v183WasteWaterDataSchema,
});

export const v183MachineDetailsSchema: z.ZodType<v183MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v183XrayRegistrationStatusResponseSchema: z.ZodType<v183XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v183MachineDetailsSchema),
    status: v183XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v183FacilityDetailsSchema: z.ZodType<v183FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v183XrayDataSchema: z.ZodType<v183XrayData> = z.object({
  facilityDetails: v183FacilityDetailsSchema.optional(),
  machines: z.array(v183MachineDetailsSchema).optional(),
  status: v183XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v183CigaretteLicensePaymentInfoSchema: z.ZodType<v183CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v183StateObjectSchema: z.ZodType<v183StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v183CigaretteLicenseDataSchema: z.ZodType<v183CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v183StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v183StateObjectSchema.optional(),
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
  paymentInfo: v183CigaretteLicensePaymentInfoSchema.optional(),
});

export const v183TaxClearanceCertificateDataSchema: z.ZodType<v183TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v183StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v183EnvironmentDataSchema: z.ZodType<v183EnvironmentData> = z.object({
  questionnaireData: v183QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v183GetFilingResponseSchema: z.ZodType<v183GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v183FormationSubmitErrorSchema: z.ZodType<v183FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v183FormationSubmitResponseSchema: z.ZodType<v183FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v183FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v183FormationSignerSchema = z.object({
  name: z.string(),
  signature: z.boolean(),
  title: v183SignerTitleSchema,
}) satisfies z.ZodType<v183FormationSigner>;

export const v183ForeignGoodStandingFileObjectSchema: z.ZodType<v183ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v183NameAvailabilityResponseSchema = z.object({
  status: v183NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v183NameAvailabilityResponse>;

export const v183NameAvailabilitySchema = v183NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v183NameAvailability>;

export const v183NewsletterResponseSchema: z.ZodType<v183NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v183NewsletterStatusSchema,
});

export const v183UserTestingResponseSchema: z.ZodType<v183UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v183UserTestingStatusSchema,
});

export const v183ExternalStatusSchema: z.ZodType<v183ExternalStatus> = z.object({
  newsletter: v183NewsletterResponseSchema.optional(),
  userTesting: v183UserTestingResponseSchema.optional(),
});

export const v183CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v183CalendarEvent>;

export const v183LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v183LicenseSearchAddress>;

export const v183TaxFilingCalendarEventSchema = v183CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v183TaxFilingCalendarEvent>;

export const v183LicenseSearchNameAndAddressSchema = v183LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v183LicenseSearchNameAndAddress>;

export const v183TaxFilingDataSchema: z.ZodType<v183TaxFilingData> = z.object({
  state: v183TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v183TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v183TaxFilingCalendarEventSchema),
});

export const v183MunicipalitySchema: z.ZodType<v183Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v183LicenseStatusItemSchema: z.ZodType<v183LicenseStatusItem> = z.object({
  title: z.string(),
  status: v183CheckoffStatusSchema,
});

export const v183LicenseDetailsSchema: z.ZodType<v183LicenseDetails> = z.object({
  nameAndAddress: v183LicenseSearchNameAndAddressSchema,
  licenseStatus: v183LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v183LicenseStatusItemSchema),
});

export const v183CommunityAffairsAddressSchema: z.ZodType<v183CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v183MunicipalitySchema,
});

export const v183BusinessUserSchema: z.ZodType<v183BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v183ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v183ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v183ProfileDocumentsSchema: z.ZodType<v183ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v183RoadmapTaskDataSchema: z.ZodType<v183RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v183FormationAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  addressCity: z.string().optional(),
  addressState: v183StateObjectSchema.optional(),
  addressMunicipality: v183MunicipalitySchema.optional(),
  addressProvince: z.string().optional(),
  addressZipCode: z.string(),
  addressCountry: z.string(),
  businessLocationType: z.union([v183FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v183FormationAddress>;

export const v183FormationMemberSchema = v183FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v183FormationMember>;

export const v183FormationIncorporatorSchema = z.object({
  ...v183FormationSignerSchema.shape,
  ...v183FormationAddressSchema.shape,
});

export const v183IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v183CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v183CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.boolean(),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v183ConstructionTypeSchema,
  residentialConstructionType: v183ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v183EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v183EmploymentPlacementTypeSchema,
  propertyLeaseType: v183PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v183IndustrySpecificData>;

export const v183ProfileDataSchema = v183IndustrySpecificDataSchema.extend({
  businessPersona: v183BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v183MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v183ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v183ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v183OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v183CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v183ProfileData>;

export const v183FormationFormDataSchema = v183FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: z.union([v183BusinessSuffixSchema, z.undefined()]),
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
  nonprofitBoardMemberQualificationsSpecified: v183InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v183InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v183InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v183InFormInBylawsSchema,
  nonprofitAssetDistributionTerms: z.string(),
  additionalProvisions: z.union([z.array(z.string()), z.undefined()]),
  agentType: z.enum(["MYSELF", "AUTHORIZED_REP", "PROFESSIONAL_SERVICE"]),
  agentNumber: z.string(),
  agentName: z.string(),
  agentEmail: z.string(),
  agentOfficeAddressLine1: z.string(),
  agentOfficeAddressLine2: z.string(),
  agentOfficeAddressCity: z.string(),
  agentOfficeAddressZipCode: z.string(),
  agentUseAccountInfo: z.boolean(),
  agentUseBusinessAddress: z.boolean(),
  members: z.union([z.array(v183FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v183FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v183FormationSignerSchema), z.undefined()]),
  paymentType: v183PaymentTypeSchema,
  annualReportNotification: z.boolean(),
  corpWatchNotification: z.boolean(),
  officialFormationDocument: z.boolean(),
  certificateOfStanding: z.boolean(),
  certifiedCopyOfFormationDocument: z.boolean(),
  contactFirstName: z.string(),
  contactLastName: z.string(),
  contactPhoneNumber: z.string(),
  foreignStateOfFormation: z.union([v183StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v183ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.boolean(),
  howToProceed: v183HowToProceedOptionsSchema,
}) satisfies z.ZodType<v183FormationFormData>;

export const v183FormationDataSchema: z.ZodType<v183FormationData> = z.object({
  formationFormData: v183FormationFormDataSchema,
  businessNameAvailability: z.union([v183NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v183NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v183FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v183GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v183LicensesSchema = z.record(z.string(), v183LicenseDetailsSchema);

export const v183LicenseDataSchema: z.ZodType<v183LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v183LicensesSchema.optional(),
});

export const v183PreferencesSchema: z.ZodType<v183Preferences> = z.object({
  roadmapOpenSections: z.array(v183SectionTypeSchema),
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

export const v183BusinessSchema: z.ZodType<v183Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v183ProfileDataSchema,
  onboardingFormProgress: v183OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v183TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v183LicenseDataSchema, z.undefined()]),
  preferences: v183PreferencesSchema,
  taxFilingData: v183TaxFilingDataSchema,
  formationData: v183FormationDataSchema,
  environmentData: z.union([v183EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v183XrayDataSchema, z.undefined()]),
  roadmapTaskData: v183RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v183TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v183CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v183UserDataSchema: z.ZodType<v183UserData> = z.object({
  user: v183BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v183BusinessSchema),
  currentBusinessId: z.string(),
});
