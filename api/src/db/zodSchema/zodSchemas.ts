import { z } from "zod";
import {
  v182CigaretteLicenseData,
  v182CigaretteLicensePaymentInfo,
  v182EnvironmentData,
  v182FacilityDetails,
  v182MachineDetails,
  v182QuestionnaireData,
  v182StateObject,
  v182TaxClearanceCertificateData,
  v182XrayData,
  v182XrayRegistrationStatusResponse,
  v182GetFilingResponse,
  v182FormationSubmitError,
  v182FormationSubmitResponse,
  v182FormationSigner,
  v182ForeignGoodStandingFileObject,
  v182UserTestingResponse,
  v182NewsletterResponse,
  v182ExternalStatus,
  v182CalendarEvent,
  v182LicenseSearchAddress,
  v182TaxFilingCalendarEvent,
  v182LicenseSearchNameAndAddress,
  v182TaxFilingData,
  v182LicenseDetails,
  v182Municipality,
  v182ProfileDocuments,
  v182BusinessUser,
  v182CommunityAffairsAddress,
  v182RoadmapTaskData,
  v182FormationAddress,
  v182LicenseData,
  v182Preferences,
  v182LicenseStatusItem,
  v182FormationMember,
  v182NameAvailability,
  v182NameAvailabilityResponse,
  v182IndustrySpecificData,
  v182ProfileData,
  v182FormationFormData,
  v182FormationData,
  v182Business,
  v182UserData,
} from "@db/migrations/v182_zod_changes";
import { LogWriterType } from "@libs/logWriter";
import { UserData } from "@shared/userData";

export const parseUserData = (logger: LogWriterType, userData: UserData): void => {
  const result = v182UserDataSchema.safeParse(userData);

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

export const v182XrayRegistrationStatusSchema = z.enum(["ACTIVE", "EXPIRED", "INACTIVE"]);

export const v182WasteWaterFieldIdsSchema = z.enum([
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

export const v182WasteWaterDataSchema = z.object(
  Object.fromEntries(
    v182WasteWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v182WasteWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v182DrinkingWaterFieldIdsSchema = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v182DrinkingWaterDataSchema = z.object(
  Object.fromEntries(
    v182DrinkingWaterFieldIdsSchema.options.map((key) => [key, z.boolean()]),
  ) as Record<(typeof v182DrinkingWaterFieldIdsSchema.options)[number], z.ZodBoolean>,
);

export const v182WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v182WasteDataSchema = z.object(
  Object.fromEntries(v182WasteFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v182WasteFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v182LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v182LandDataSchema = z.object(
  Object.fromEntries(v182LandFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v182LandFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v182AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v182AirDataSchema = z.object(
  Object.fromEntries(v182AirFieldIdsSchema.options.map((key) => [key, z.boolean()])) as Record<
    (typeof v182AirFieldIdsSchema.options)[number],
    z.ZodBoolean
  >,
);

export const v182PaymentTypeSchema = z.union([z.enum(["CC", "ACH"]), z.undefined()]);

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

export const v182BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v182FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v182SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
] as const);

export const v182InFormInBylawsSchema = z.union([z.enum(["IN_BYLAWS", "IN_FORM"]), z.undefined()]);

export const v182HowToProceedOptionsSchema = z.enum([
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

export const v182UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
  ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v182NameAvailabilityStatusSchema = z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
]);

export const v182NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v182SectionTypeSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v182CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v182LicenseStatusSchema = z.enum([
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

export const v182PropertyLeaseTypeSchema = z.union([
  z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
  z.undefined(),
]);

export const v182TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v182OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v182ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v182BusinessPersonaSchema = z.union([
  z.enum(["STARTING", "OWNING", "FOREIGN"]),
  z.undefined(),
]);
export const v182OperatingPhaseSchema = z.union([
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

export const v182CannabisLicenseTypeSchema = z.union([
  z.enum(["CONDITIONAL", "ANNUAL"]),
  z.undefined(),
]);
export const v182CarServiceTypeSchema = z.union([
  z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
  z.undefined(),
]);
export const v182ConstructionTypeSchema = z.union([
  z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
  z.undefined(),
]);
export const v182ResidentialConstructionTypeSchema = z.union([
  z.enum(["NEW_HOME_CONSTRUCTION", "HOME_RENOVATIONS", "BOTH"]),
  z.undefined(),
]);
export const v182EmploymentAndPersonnelServicesTypeSchema = z.union([
  z.enum(["JOB_SEEKERS", "EMPLOYERS"]),
  z.undefined(),
]);
export const v182EmploymentPlacementTypeSchema = z.union([
  z.enum(["TEMPORARY", "PERMANENT", "BOTH"]),
  z.undefined(),
]);

export const v182ForeignBusinessTypeIdSchema = z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none",
] as const);

export const v182TaxFilingStateSchema = z.enum([
  "SUCCESS",
  "FAILED",
  "UNREGISTERED",
  "PENDING",
  "API_ERROR",
] as const);
export const v182TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);

// Plain object mapping for license names
const v182taskIdLicenseNameMapping = {
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

export const v182taskIdLicenseNameMappingSchema = z.object({
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

export const v182LicenseTaskIDSchema = z.enum(
  Object.keys(v182taskIdLicenseNameMapping) as [string, ...string[]],
);

export const v182LicenseNameSchema = z.enum(
  Object.values(v182taskIdLicenseNameMapping) as [string, ...string[]],
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
export const v182SectionNamesSchema = z.enum([
  "PLAN",
  "START",
  "DOMESTIC_EMPLOYER_SECTION",
] as const);

export const v182QuestionnaireDataSchema: z.ZodType<v182QuestionnaireData> = z.object({
  air: v182AirDataSchema,
  land: v182LandDataSchema,
  waste: v182WasteDataSchema,
  drinkingWater: v182DrinkingWaterDataSchema,
  wasteWater: v182WasteWaterDataSchema,
});

export const v182MachineDetailsSchema: z.ZodType<v182MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v182XrayRegistrationStatusResponseSchema: z.ZodType<v182XrayRegistrationStatusResponse> =
  z.object({
    machines: z.array(v182MachineDetailsSchema),
    status: v182XrayRegistrationStatusSchema,
    expirationDate: z.string().optional(),
    deactivationDate: z.string().optional(),
  });

export const v182FacilityDetailsSchema: z.ZodType<v182FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string(),
});

export const v182XrayDataSchema: z.ZodType<v182XrayData> = z.object({
  facilityDetails: v182FacilityDetailsSchema.optional(),
  machines: z.array(v182MachineDetailsSchema).optional(),
  status: v182XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v182CigaretteLicensePaymentInfoSchema: z.ZodType<v182CigaretteLicensePaymentInfo> =
  z.object({
    token: z.string().optional(),
    paymentComplete: z.boolean().optional(),
    orderId: z.number().optional(),
    orderStatus: z.string().optional(),
    orderTimestamp: z.string().optional(),
    confirmationEmailsent: z.boolean().optional(),
  });

export const v182StateObjectSchema: z.ZodType<v182StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v182CigaretteLicenseDataSchema: z.ZodType<v182CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v182StateObjectSchema.optional(),
  addressZipCode: z.string().optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v182StateObjectSchema.optional(),
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
  paymentInfo: v182CigaretteLicensePaymentInfoSchema.optional(),
});

export const v182TaxClearanceCertificateDataSchema: z.ZodType<v182TaxClearanceCertificateData> =
  z.object({
    requestingAgencyId: z.union([z.string(), z.undefined()]),
    businessName: z.union([z.string(), z.undefined()]),
    addressLine1: z.union([z.string(), z.undefined()]),
    addressLine2: z.union([z.string(), z.undefined()]),
    addressCity: z.union([z.string(), z.undefined()]),
    addressState: v182StateObjectSchema.optional(),
    addressZipCode: z.string().optional(),
    taxId: z.union([z.string(), z.undefined()]),
    taxPin: z.union([z.string(), z.undefined()]),
    hasPreviouslyReceivedCertificate: z.union([z.boolean(), z.undefined()]),
    lastUpdatedISO: z.union([z.string(), z.undefined()]),
  });

export const v182EnvironmentDataSchema: z.ZodType<v182EnvironmentData> = z.object({
  questionnaireData: v182QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v182GetFilingResponseSchema: z.ZodType<v182GetFilingResponse> = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v182FormationSubmitErrorSchema: z.ZodType<v182FormationSubmitError> = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});

export const v182FormationSubmitResponseSchema: z.ZodType<v182FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.union([z.string(), z.undefined()]),
  formationId: z.union([z.string(), z.undefined()]),
  redirect: z.union([z.string(), z.undefined()]),
  errors: z.array(v182FormationSubmitErrorSchema),
  lastUpdatedISO: z.union([z.string(), z.undefined()]),
});

export const v182FormationSignerSchema = z.object({
  name: z.string(),
  signature: z.boolean(),
  title: v182SignerTitleSchema,
}) satisfies z.ZodType<v182FormationSigner>;

export const v182ForeignGoodStandingFileObjectSchema: z.ZodType<v182ForeignGoodStandingFileObject> =
  z.object({
    Extension: z.enum(["PDF", "PNG"]),
    Content: z.string(),
  });

export const v182NameAvailabilityResponseSchema = z.object({
  status: v182NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v182NameAvailabilityResponse>;

export const v182NameAvailabilitySchema = v182NameAvailabilityResponseSchema.extend({
  lastUpdatedTimeStamp: z.string(),
}) satisfies z.ZodType<v182NameAvailability>;

export const v182NewsletterResponseSchema: z.ZodType<v182NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v182NewsletterStatusSchema,
});

export const v182UserTestingResponseSchema: z.ZodType<v182UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v182UserTestingStatusSchema,
});

export const v182ExternalStatusSchema: z.ZodType<v182ExternalStatus> = z.object({
  newsletter: v182NewsletterResponseSchema.optional(),
  userTesting: v182UserTestingResponseSchema.optional(),
});

export const v182CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v182CalendarEvent>;

export const v182LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string(),
}) satisfies z.ZodType<v182LicenseSearchAddress>;

export const v182TaxFilingCalendarEventSchema = v182CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v182TaxFilingCalendarEvent>;

export const v182LicenseSearchNameAndAddressSchema = v182LicenseSearchAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v182LicenseSearchNameAndAddress>;

export const v182TaxFilingDataSchema: z.ZodType<v182TaxFilingData> = z.object({
  state: v182TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v182TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v182TaxFilingCalendarEventSchema),
});

export const v182MunicipalitySchema: z.ZodType<v182Municipality> = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v182LicenseStatusItemSchema: z.ZodType<v182LicenseStatusItem> = z.object({
  title: z.string(),
  status: v182CheckoffStatusSchema,
});

export const v182LicenseDetailsSchema: z.ZodType<v182LicenseDetails> = z.object({
  nameAndAddress: v182LicenseSearchNameAndAddressSchema,
  licenseStatus: v182LicenseStatusSchema,
  expirationDateISO: z.union([z.string(), z.undefined()]),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v182LicenseStatusItemSchema),
});

export const v182CommunityAffairsAddressSchema: z.ZodType<v182CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v182MunicipalitySchema,
});

export const v182BusinessUserSchema: z.ZodType<v182BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v182ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v182ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});

export const v182ProfileDocumentsSchema: z.ZodType<v182ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v182RoadmapTaskDataSchema: z.ZodType<v182RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v182FormationAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  addressCity: z.string().optional(),
  addressState: v182StateObjectSchema.optional(),
  addressMunicipality: v182MunicipalitySchema.optional(),
  addressProvince: z.string().optional(),
  addressZipCode: z.string(),
  addressCountry: z.string(),
  businessLocationType: z.union([v182FormationBusinessLocationTypeSchema, z.undefined()]),
}) satisfies z.ZodType<v182FormationAddress>;

export const v182FormationMemberSchema = v182FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v182FormationMember>;

export const v182FormationIncorporatorSchema = z.object({
  ...v182FormationSignerSchema.shape,
  ...v182FormationAddressSchema.shape,
});

export const v182IndustrySpecificDataSchema = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v182CannabisLicenseTypeSchema,
  cannabisMicrobusiness: z.union([z.boolean(), z.undefined()]),
  constructionRenovationPlan: z.union([z.boolean(), z.undefined()]),
  carService: z.union([v182CarServiceTypeSchema, z.undefined()]),
  interstateTransport: z.boolean(),
  interstateLogistics: z.union([z.boolean(), z.undefined()]),
  interstateMoving: z.union([z.boolean(), z.undefined()]),
  isChildcareForSixOrMore: z.union([z.boolean(), z.undefined()]),
  petCareHousing: z.union([z.boolean(), z.undefined()]),
  willSellPetCareItems: z.union([z.boolean(), z.undefined()]),
  constructionType: v182ConstructionTypeSchema,
  residentialConstructionType: v182ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v182EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v182EmploymentPlacementTypeSchema,
  carnivalRideOwningBusiness: z.union([z.boolean(), z.undefined()]),
  propertyLeaseType: v182PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.union([z.boolean(), z.undefined()]),
  travelingCircusOrCarnivalOwningBusiness: z.union([z.boolean(), z.undefined()]),
  vacantPropertyOwner: z.union([z.boolean(), z.undefined()]),
  publicWorksContractor: z.union([z.boolean(), z.undefined()]),
}) satisfies z.ZodType<v182IndustrySpecificData>;

export const v182ProfileDataSchema = v182IndustrySpecificDataSchema.extend({
  businessPersona: v182BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.union([z.string(), z.undefined()]),
  legalStructureId: z.union([z.string(), z.undefined()]),
  municipality: z.union([v182MunicipalitySchema, z.undefined()]),
  dateOfFormation: z.union([z.string(), z.undefined()]),
  entityId: z.union([z.string(), z.undefined()]),
  employerId: z.union([z.string(), z.undefined()]),
  taxId: z.union([z.string(), z.undefined()]),
  hashedTaxId: z.union([z.string(), z.undefined()]),
  encryptedTaxId: z.union([z.string(), z.undefined()]),
  notes: z.string(),
  documents: v182ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.union([z.string(), z.undefined()]),
  taxPin: z.union([z.string(), z.undefined()]),
  encryptedTaxPin: z.union([z.string(), z.undefined()]),
  sectorId: z.union([z.string(), z.undefined()]),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v182ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v182OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.string(), z.union([z.boolean(), z.undefined()])),
  elevatorOwningBusiness: z.union([z.boolean(), z.undefined()]),
  communityAffairsAddress: v182CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.union([z.boolean(), z.undefined()]),
  raffleBingoGames: z.union([z.boolean(), z.undefined()]),
  businessOpenMoreThanTwoYears: z.union([z.boolean(), z.undefined()]),
  employerAccessRegistration: z.union([z.boolean(), z.undefined()]),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v182ProfileData>;

export const v182FormationFormDataSchema = v182FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: z.union([v182BusinessSuffixSchema, z.undefined()]),
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
  nonprofitBoardMemberQualificationsSpecified: v182InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v182InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v182InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v182InFormInBylawsSchema,
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
  members: z.union([z.array(v182FormationMemberSchema), z.undefined()]),
  incorporators: z.union([z.array(v182FormationIncorporatorSchema), z.undefined()]),
  signers: z.union([z.array(v182FormationSignerSchema), z.undefined()]),
  paymentType: v182PaymentTypeSchema,
  annualReportNotification: z.boolean(),
  corpWatchNotification: z.boolean(),
  officialFormationDocument: z.boolean(),
  certificateOfStanding: z.boolean(),
  certifiedCopyOfFormationDocument: z.boolean(),
  contactFirstName: z.string(),
  contactLastName: z.string(),
  contactPhoneNumber: z.string(),
  foreignStateOfFormation: z.union([v182StateObjectSchema, z.undefined()]),
  foreignDateOfFormation: z.union([z.string(), z.undefined()]), // YYYY-MM-DD
  foreignGoodStandingFile: z.union([v182ForeignGoodStandingFileObjectSchema, z.undefined()]),
  legalType: z.string(),
  willPracticeLaw: z.union([z.boolean(), z.undefined()]),
  isVeteranNonprofit: z.union([z.boolean(), z.undefined()]),
  checkNameReservation: z.boolean(),
  howToProceed: v182HowToProceedOptionsSchema,
}) satisfies z.ZodType<v182FormationFormData>;

export const v182FormationDataSchema: z.ZodType<v182FormationData> = z.object({
  formationFormData: v182FormationFormDataSchema,
  businessNameAvailability: z.union([v182NameAvailabilitySchema, z.undefined()]),
  dbaBusinessNameAvailability: z.union([v182NameAvailabilitySchema, z.undefined()]),
  formationResponse: z.union([v182FormationSubmitResponseSchema, z.undefined()]),
  getFilingResponse: z.union([v182GetFilingResponseSchema, z.undefined()]),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v182LicensesSchema = z.record(z.string(), v182LicenseDetailsSchema);

export const v182LicenseDataSchema: z.ZodType<v182LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v182LicensesSchema.optional(),
});

export const v182PreferencesSchema: z.ZodType<v182Preferences> = z.object({
  roadmapOpenSections: z.array(v182SectionTypeSchema),
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

export const v182BusinessSchema: z.ZodType<v182Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v182ProfileDataSchema,
  onboardingFormProgress: v182OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v182TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: z.union([v182LicenseDataSchema, z.undefined()]),
  preferences: v182PreferencesSchema,
  taxFilingData: v182TaxFilingDataSchema,
  formationData: v182FormationDataSchema,
  environmentData: z.union([v182EnvironmentDataSchema, z.undefined()]),
  xrayRegistrationData: z.union([v182XrayDataSchema, z.undefined()]),
  roadmapTaskData: v182RoadmapTaskDataSchema,
  taxClearanceCertificateData: z.union([v182TaxClearanceCertificateDataSchema, z.undefined()]),
  cigaretteLicenseData: z.union([v182CigaretteLicenseDataSchema, z.undefined()]),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v182UserDataSchema: z.ZodType<v182UserData> = z.object({
  user: v182BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v182BusinessSchema),
  currentBusinessId: z.string(),
});
