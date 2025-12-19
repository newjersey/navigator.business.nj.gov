import { z } from "zod";
import {
  v181CigaretteLicenseData,
  v181CigaretteLicensePaymentInfo, v181EnvironmentData,
  v181FacilityDetails,
  v181MachineDetails, v181QuestionnaireData, v181StateObject, v181TaxClearanceCertificateData, v181XrayData,
  v181XrayRegistrationStatusResponse, v181GetFilingResponse, v181FormationSubmitError, v181FormationSubmitResponse, v181FormationSigner,
  v181ForeignGoodStandingFileObject, v181NameAvailabilityResponse, v181NameAvailability, v181UserTestingResponse, v181NewsletterResponse,
  v181ExternalStatus, v181CalendarEvent, v181LicenseSearchAddress, v181TaxFilingCalendarEvent,v181LicenseSearchNameAndAddress, v181TaxFilingData,
  v181LicenseDetails, v181Municipality,v181ProfileDocuments,v181BusinessUser,v181CommunityAffairsAddress, v181RoadmapTaskData, v181FormationAddress,
  v181IndustrySpecificData, v181ProfileData, v181FormationFormData, v181FormationData,v181LicenseData, v181Preferences, v181Business,
  v181UserData, v181LicenseStatusItem, v181FormationMember
} from "@db/migrations/v181_add_updates_reminders_and_phone_number";

export const v181XrayRegistrationStatusSchema = z.enum([
  "ACTIVE",
  "EXPIRED",
  "INACTIVE",
]);

export const v181WasteWaterFieldIdsSchema = z.enum([
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

export const v181WasteWaterDataSchema = z.object(
  Object.fromEntries(v181WasteWaterFieldIdsSchema.options.map(key => [key, z.boolean()])) as Record<
    typeof v181WasteWaterFieldIdsSchema.options[number],
    z.ZodBoolean
  >
);

export const v181DrinkingWaterFieldIdsSchema  = z.enum([
  "ownWell",
  "combinedWellCapacity",
  "wellDrilled",
  "potableWater",
  "noDrinkingWater",
]);

export const v181DrinkingWaterDataSchema = z.object(
  Object.fromEntries(v181DrinkingWaterFieldIdsSchema.options.map(key => [key, z.boolean()])) as Record<
    typeof v181DrinkingWaterFieldIdsSchema.options[number],
    z.ZodBoolean
  >
);

export const v181WasteFieldIdsSchema = z.enum([
  "transportWaste",
  "hazardousMedicalWaste",
  "compostWaste",
  "treatProcessWaste",
  "constructionDebris",
  "noWaste",
]);

export const v181WasteDataSchema = z.object(
  Object.fromEntries(v181WasteFieldIdsSchema.options.map(key => [key, z.boolean()])) as Record<
    typeof v181WasteFieldIdsSchema.options[number],
    z.ZodBoolean
  >
);

export const v181LandFieldIdsSchema = z.enum([
  "takeOverExistingBiz",
  "propertyAssessment",
  "constructionActivities",
  "siteImprovementWasteLands",
  "noLand",
]);

export const v181LandDataSchema = z.object(
  Object.fromEntries(v181LandFieldIdsSchema.options.map(key => [key, z.boolean()])) as Record<
    typeof v181LandFieldIdsSchema.options[number],
    z.ZodBoolean
  >
);

export const v181AirFieldIdsSchema = z.enum([
  "emitPollutants",
  "emitEmissions",
  "constructionActivities",
  "noAir",
]);

export const v181AirDataSchema = z.object(
  Object.fromEntries(v181AirFieldIdsSchema.options.map(key => [key, z.boolean()])) as Record<
    typeof v181AirFieldIdsSchema.options[number],
    z.ZodBoolean
  >
);

export const v181PaymentTypeSchema = z.enum(["CC", "ACH"]).optional();

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

export const foreignCorpBusinessSuffixSchema =  z.enum([
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

export const v181BusinessSuffixSchema = z.enum(AllBusinessSuffixesSchema);

export const v181FormationBusinessLocationTypeSchema = z.enum(["US", "INTL", "NJ"] as const);

export const v181SignerTitleSchema = z.enum([
  "Authorized Representative",
  "Authorized Partner",
  "Incorporator",
  "General Partner",
  "President",
  "Vice-President",
  "Chairman of the Board",
  "CEO",
]as const);

export const v181InFormInBylawsSchema = z.enum(["IN_BYLAWS", "IN_FORM"]).optional();

export const v181HowToProceedOptionsSchema = z.enum([
  "DIFFERENT_NAME",
  "KEEP_NAME",
  "CANCEL_NAME",
] as const);

export const externalStatusListSchema =  z.enum(["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const);

export const userTestingStatusListSchema = z.enum(externalStatusListSchema.options);

export const v181UserTestingStatusSchema = z.enum(userTestingStatusListSchema.options);

export const newsletterStatusListSchema = z.enum([
    ...externalStatusListSchema.options,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
]);

export const v181NameAvailabilityStatusSchema =z.enum([
  "AVAILABLE",
  "DESIGNATOR_ERROR",
  "SPECIAL_CHARACTER_ERROR",
  "UNAVAILABLE",
  "RESTRICTED_ERROR",
  ]).optional();

export const v181NewsletterStatusSchema = z.enum(newsletterStatusListSchema.options);

export const v181SectionTypeSchema = z.enum(["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const);

export const v181CheckoffStatusSchema = z.enum(["ACTIVE", "PENDING", "UNKNOWN"] as const);

export const v181LicenseStatusSchema =z.enum([
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
  "WITHDRAWN",] as const);

export const v181PropertyLeaseTypeSchema = z.enum(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"] as const).optional();


export const v181TaskProgressSchema = z.enum(["TO_DO", "COMPLETED"] as const);

export const v181OnboardingFormProgressSchema = z.enum(["UNSTARTED", "COMPLETED"] as const);

export const v181ABExperienceSchema = z.enum(["ExperienceA", "ExperienceB"] as const);

export const v181BusinessPersonaSchema = z.enum(["STARTING", "OWNING", "FOREIGN"] as const).optional();
export const v181OperatingPhaseSchema =z.enum([
  "GUEST_MODE",
  "NEEDS_TO_FORM",
  "NEEDS_BUSINESS_STRUCTURE",
  "FORMED",
  "UP_AND_RUNNING",
  "UP_AND_RUNNING_OWNING",
  "REMOTE_SELLER_WORKER"
] as const).optional()

export const v181CannabisLicenseTypeSchema = z.enum(["CONDITIONAL", "ANNUAL" ] as const).optional()
export const v181CarServiceTypeSchema = z.enum(["STANDARD", "HIGH_CAPACITY", "BOTH" ] as const).optional()
export const v181ConstructionTypeSchema = z.enum(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH" ] as const).optional()
export const v181ResidentialConstructionTypeSchema =z.enum([
  "NEW_HOME_CONSTRUCTION",
  "HOME_RENOVATIONS",
  "BOTH"
] as const).optional()
export const v181EmploymentAndPersonnelServicesTypeSchema = z.enum(["JOB_SEEKERS", "EMPLOYERS" ] as const).optional()
export const v181EmploymentPlacementTypeSchema = z.enum(["TEMPORARY", "PERMANENT", "BOTH" ] as const).optional()

export const v181ForeignBusinessTypeIdSchema =z.enum([
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "revenueInNJ",
  "transactionsInNJ",
  "none"] as const);

export const v181TaxFilingStateSchema = z.enum(["SUCCESS", "FAILED", "UNREGISTERED", "PENDING", "API_ERROR"] as const);
export const v181TaxFilingErrorFieldsSchema = z.enum(["businessName", "formFailure"] as const);


export const v181taskIdLicenseNameMappingSchema = z.object({
  "apply-for-shop-license": z.literal("Cosmetology and Hairstyling-Shop"),
  "appraiser-license": z.literal("Real Estate Appraisers-Appraisal Management Company"),
  "architect-license": z.literal("Architecture-Certificate of Authorization"),
  "health-club-registration": z.literal("Health Club Services"),
  "home-health-aide-license": z.literal("Health Care Services"),
  "hvac-license": z.literal("HVACR-HVACR CE Sponsor"),
  "landscape-architect-license": z.literal("Landscape Architecture-Certificate of Authorization"),
  "license-massage-therapy": z.literal("Massage and Bodywork Therapy-Massage and Bodywork Employer"),
  "moving-company-license": z.literal("Public Movers and Warehousemen-Public Mover and Warehouseman"),
  "pharmacy-license": z.literal("Pharmacy-Pharmacy"),
  "public-accountant-license": z.literal("Accountancy-Firm Registration"),
  "register-accounting-firm": z.literal("Accountancy-Firm Registration"),
  "register-consumer-affairs": z.literal("Home Improvement Contractors-Home Improvement Contractor"),
  "ticket-broker-reseller-registration": z.literal("Ticket Brokers"),
  "telemarketing-license": z.literal("Telemarketers"),
} as const);

export const v181LicenseTaskIDSchema = z.enum(
  Object.keys(v181taskIdLicenseNameMappingSchema) as [string, ...string[]]
);

export const v181LicenseNameSchema = z.enum(Object.values(v181taskIdLicenseNameMappingSchema) as [
  string,
  ...string[]
]
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
export  const v181SectionNamesSchema = z.enum(["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const);

export const v181QuestionnaireDataSchema: z.ZodType<v181QuestionnaireData>  = z.object({
  air: v181AirDataSchema,
  land: v181LandDataSchema,
  waste: v181WasteDataSchema,
  drinkingWater: v181DrinkingWaterDataSchema,
  wasteWater: v181WasteWaterDataSchema,
});

export const v181MachineDetailsSchema: z.ZodType<v181MachineDetails> = z.object({
  name: z.string().optional(),
  registrationNumber: z.string().optional(),
  roomId: z.string().optional(),
  registrationCategory: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  annualFee: z.number().optional(),
});

export const v181XrayRegistrationStatusResponseSchema: z.ZodType<v181XrayRegistrationStatusResponse>  = z.object({
  machines: z.array(v181MachineDetailsSchema),
  status: v181XrayRegistrationStatusSchema,
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
});

export const v181FacilityDetailsSchema: z.ZodType<v181FacilityDetails> = z.object({
  businessName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  addressZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
});

export const v181XrayDataSchema: z.ZodType<v181XrayData> = z.object({
  facilityDetails: v181FacilityDetailsSchema.optional(),
  machines: z.array(v181MachineDetailsSchema).optional(),
  status: v181XrayRegistrationStatusSchema.optional(),
  expirationDate: z.string().optional(),
  deactivationDate: z.string().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v181CigaretteLicensePaymentInfoSchema: z.ZodType<v181CigaretteLicensePaymentInfo> = z.object({
  token: z.string().optional(),
  paymentComplete: z.boolean().optional(),
  orderId: z.number().optional(),
  orderStatus: z.string().optional(),
  orderTimestamp: z.string().optional(),
  confirmationEmailsent: z.boolean().optional(),
});

export const v181StateObjectSchema:z.ZodType<v181StateObject> = z.object({
  shortCode: z.string(),
  name: z.string(),
});

export const v181CigaretteLicenseDataSchema:z.ZodType<v181CigaretteLicenseData> = z.object({
  businessName: z.string().optional(),
  responsibleOwnerName: z.string().optional(),
  tradeName: z.string().optional(),
  taxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v181StateObjectSchema.optional(),
  addressZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits").optional(),
  mailingAddressIsTheSame: z.boolean().optional(),
  mailingAddressLine1: z.string().optional(),
  mailingAddressLine2: z.string().optional(),
  mailingAddressCity: z.string().optional(),
  mailingAddressState: v181StateObjectSchema.optional(),
  mailingAddressZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits").optional(),
  contactName: z.string().optional(),
  contactPhoneNumber: z.string().optional(),
  contactEmail: z.string().optional(),
  salesInfoStartDate: z.string().optional(),
  salesInfoSupplier: z.array(z.string()).optional(),
  signerName: z.string().optional(),
  signerRelationship: z.string().optional(),
  signature: z.boolean().optional(),
  lastUpdatedISO: z.string().optional(),
  paymentInfo: v181CigaretteLicensePaymentInfoSchema.optional(),
});

export const v181TaxClearanceCertificateDataSchema: z.ZodType<v181TaxClearanceCertificateData> = z.object({
  requestingAgencyId: z.string().optional(),
  businessName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: v181StateObjectSchema.optional(),
  addressZipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits").optional(),
  taxId: z.string().optional(),
  taxPin: z.string().optional(),
  hasPreviouslyReceivedCertificate: z.boolean().optional(),
  lastUpdatedISO: z.string().optional(),
});

export const v181EnvironmentDataSchema: z.ZodType<v181EnvironmentData>  = z.object({
  questionnaireData: v181QuestionnaireDataSchema.optional(),
  submitted: z.boolean().optional(),
  emailSent: z.boolean().optional(),
});

export const v181GetFilingResponseSchema: z.ZodType<v181GetFilingResponse>  = z.object({
  success: z.boolean(),
  entityId: z.string(),
  transactionDate: z.string(), // ISO 8601 date string
  confirmationNumber: z.string(),
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v181FormationSubmitErrorSchema: z.ZodType<v181FormationSubmitError>  = z.object({
  field: z.string(),
  type: z.enum(["FIELD", "UNKNOWN", "RESPONSE"]),
  message: z.string(),
});


export const v181FormationSubmitResponseSchema: z.ZodType<v181FormationSubmitResponse> = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  formationId: z.string().optional(),
  redirect: z.string().optional(),
  errors: z.array(v181FormationSubmitErrorSchema),
  lastUpdatedISO: z.string().optional(),
});


export const v181FormationSignerSchema= z.object({
  name: z.string(),
  signature: z.boolean(),
  title: v181SignerTitleSchema,
}) satisfies z.ZodType<v181FormationSigner>;

export const v181ForeignGoodStandingFileObjectSchema: z.ZodType<v181ForeignGoodStandingFileObject> = z.object({
  Extension: z.enum(["PDF", "PNG"]),
  Content: z.string(),
});

export const v181NameAvailabilityResponseSchema = z.object({
  status: v181NameAvailabilityStatusSchema,
  similarNames: z.array(z.string()),
  invalidWord: z.string().optional(),
}) satisfies z.ZodType<v181NameAvailabilityResponse>;

export const v181NameAvailabilitySchema =
  v181NameAvailabilityResponseSchema.extend({
    lastUpdatedTimeStamp: z.string(),
  }) satisfies z.ZodType<v181NameAvailability>;

export const v181NewsletterResponseSchema: z.ZodType<v181NewsletterResponse> = z.object({
  success: z.boolean().optional(),
  status: v181NewsletterStatusSchema,
});

export const v181UserTestingResponseSchema: z.ZodType<v181UserTestingResponse> = z.object({
  success: z.boolean().optional(),
  status: v181UserTestingStatusSchema,
});

export const v181ExternalStatusSchema: z.ZodType<v181ExternalStatus> = z.object({
  newsletter: v181NewsletterResponseSchema.optional(),
  userTesting: v181UserTestingResponseSchema.optional(),
});

export const v181CalendarEventSchema = z.object({
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "dueDate must be in YYYY-MM-DD format",
  }),
  calendarEventType: z.enum(["TAX-FILING", "LICENSE"]),
}) satisfies z.ZodType<v181CalendarEvent>;

export const v181LicenseSearchAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, {
    message: "zipCode must be 5 digits",
  }),
}) satisfies z.ZodType<v181LicenseSearchAddress>;

export const v181TaxFilingCalendarEventSchema = v181CalendarEventSchema.extend({
  identifier: z.string(),
  calendarEventType: z.literal("TAX-FILING"), // override enum to fixed value
}) satisfies z.ZodType<v181TaxFilingCalendarEvent>;

export const v181LicenseSearchNameAndAddressSchema = v181LicenseSearchAddressSchema.extend({
  name: z.string(),
})satisfies z.ZodType<v181LicenseSearchNameAndAddress>;

export const v181TaxFilingDataSchema: z.ZodType<v181TaxFilingData> = z.object({
  state: v181TaxFilingStateSchema.optional(),
  lastUpdatedISO: z.string().optional(),
  registeredISO: z.string().optional(),
  errorField: v181TaxFilingErrorFieldsSchema.optional(),
  businessName: z.string().optional(),
  filings: z.array(v181TaxFilingCalendarEventSchema),
});

export const v181MunicipalitySchema: z.ZodType<v181Municipality>  = z.object({
  name: z.string(),
  displayName: z.string(),
  county: z.string(),
  id: z.string(),
});

export const v181LicenseStatusItemSchema: z.ZodType<v181LicenseStatusItem> = z.object({
  title: z.string(),
  status: v181CheckoffStatusSchema,
});


export const v181LicenseDetailsSchema: z.ZodType<v181LicenseDetails> = z.object({
  nameAndAddress: v181LicenseSearchNameAndAddressSchema,
  licenseStatus: v181LicenseStatusSchema,
  expirationDateISO: z.string().optional(),
  lastUpdatedISO: z.string(),
  checklistItems: z.array(v181LicenseStatusItemSchema),
});

export const v181CommunityAffairsAddressSchema: z.ZodType<v181CommunityAffairsAddress> = z.object({
  streetAddress1: z.string(),
  streetAddress2: z.string().optional(),
  municipality: v181MunicipalitySchema,
});

export const v181BusinessUserSchema: z.ZodType<v181BusinessUser> = z.object({
  name: z.string().optional(),
  email: z.string(),
  id: z.string(),
  receiveNewsletter: z.boolean(),
  userTesting: z.boolean(),
  receiveUpdatesAndReminders: z.boolean(),
  externalStatus: v181ExternalStatusSchema,
  myNJUserKey: z.string().optional(),
  intercomHash: z.string().optional(),
  abExperience: v181ABExperienceSchema,
  accountCreationSource: z.string(),
  contactSharingWithAccountCreationPartner: z.boolean(),
  phoneNumber: z.string().optional(),
});


export const v181ProfileDocumentsSchema: z.ZodType<v181ProfileDocuments> = z.object({
  formationDoc: z.string(),
  standingDoc: z.string(),
  certifiedDoc: z.string(),
});

export const v181RoadmapTaskDataSchema: z.ZodType<v181RoadmapTaskData> = z.object({
  manageBusinessVehicles: z.boolean().optional(),
  passengerTransportSchoolBus: z.boolean().optional(),
  passengerTransportSixteenOrMorePassengers: z.boolean().optional(),
});

export const v181FormationAddressSchema= z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  addressCity: z.string().optional(),
  addressState: v181StateObjectSchema.optional(),
  addressMunicipality: v181MunicipalitySchema.optional(),
  addressProvince: z.string().optional(),
  addressZipCode: z.string(),
  addressCountry: z.string(),
  businessLocationType: v181FormationBusinessLocationTypeSchema.optional(),
}) satisfies z.ZodType<v181FormationAddress>;

export const v181FormationMemberSchema = v181FormationAddressSchema.extend({
  name: z.string(),
}) satisfies z.ZodType<v181FormationMember>;


export const v181FormationIncorporatorSchema = z.object({
  ...v181FormationSignerSchema.shape,
  ...v181FormationAddressSchema.shape,
});
export const v181IndustrySpecificDataSchema  = z.object({
  liquorLicense: z.boolean(),
  requiresCpa: z.boolean(),
  homeBasedBusiness: z.boolean().optional(),
  providesStaffingService: z.boolean(),
  certifiedInteriorDesigner: z.boolean(),
  realEstateAppraisalManagement: z.boolean(),
  cannabisLicenseType: v181CannabisLicenseTypeSchema.optional(),
  cannabisMicrobusiness: z.boolean().optional(),
  constructionRenovationPlan: z.boolean().optional(),
  carService: v181CarServiceTypeSchema.optional(),
  interstateTransport: z.boolean(),
  interstateLogistics: z.boolean().optional(),
  interstateMoving: z.boolean().optional(),
  isChildcareForSixOrMore: z.boolean().optional(),
  petCareHousing: z.boolean().optional(),
  willSellPetCareItems: z.boolean().optional(),
  constructionType: v181ConstructionTypeSchema,
  residentialConstructionType: v181ResidentialConstructionTypeSchema,
  employmentPersonnelServiceType: v181EmploymentAndPersonnelServicesTypeSchema,
  employmentPlacementType: v181EmploymentPlacementTypeSchema,
  carnivalRideOwningBusiness: z.boolean().optional(),
  propertyLeaseType: v181PropertyLeaseTypeSchema,
  hasThreeOrMoreRentalUnits: z.boolean().optional(),
  travelingCircusOrCarnivalOwningBusiness: z.boolean().optional(),
  vacantPropertyOwner: z.boolean().optional(),
  publicWorksContractor: z.boolean().optional(),
}) satisfies z.ZodType<v181IndustrySpecificData>;

export const v181ProfileDataSchema = v181IndustrySpecificDataSchema.extend({
  businessPersona: v181BusinessPersonaSchema,
  businessName: z.string(),
  responsibleOwnerName: z.string(),
  tradeName: z.string(),
  industryId: z.string().optional(),
  legalStructureId: z.string().optional(),
  municipality: v181MunicipalitySchema.optional(),
  dateOfFormation: z.string().optional(),
  entityId: z.string().optional(),
  employerId: z.string().optional(),
  taxId: z.string().optional(),
  hashedTaxId: z.string().optional(),
  encryptedTaxId: z.string().optional(),
  notes: z.string(),
  documents: v181ProfileDocumentsSchema,
  ownershipTypeIds: z.array(z.string()),
  existingEmployees: z.string().optional(),
  taxPin: z.string().optional(),
  encryptedTaxPin: z.string().optional(),
  sectorId: z.string().optional(),
  naicsCode: z.string(),
  foreignBusinessTypeIds: z.array(v181ForeignBusinessTypeIdSchema),
  nexusDbaName: z.string(),
  operatingPhase: v181OperatingPhaseSchema,
  nonEssentialRadioAnswers: z.record(z.boolean().optional()),
  elevatorOwningBusiness: z.boolean().optional(),
  communityAffairsAddress: v181CommunityAffairsAddressSchema.optional(),
  plannedRenovationQuestion: z.boolean().optional(),
  raffleBingoGames: z.boolean().optional(),
  businessOpenMoreThanTwoYears: z.boolean().optional(),
  employerAccessRegistration: z.boolean().optional(),
  deptOfLaborEin: z.string(),
}) satisfies z.ZodType<v181ProfileData>;

export const v181FormationFormDataSchema = v181FormationAddressSchema.extend({
  businessName: z.string(),
  businessNameConfirmation: z.boolean(),
  businessSuffix: v181BusinessSuffixSchema.optional(),
  businessTotalStock: z.string(),
  businessStartDate: z.string(), // YYYY-MM-DD
  businessPurpose: z.string(),
  withdrawals: z.string(),
  combinedInvestment: z.string(),
  dissolution: z.string(),
  canCreateLimitedPartner: z.boolean().optional(),
  createLimitedPartnerTerms: z.string(),
  canGetDistribution: z.boolean().optional(),
  getDistributionTerms: z.string(),
  canMakeDistribution: z.boolean().optional(),
  makeDistributionTerms: z.string(),
  hasNonprofitBoardMembers: z.boolean().optional(),
  nonprofitBoardMemberQualificationsSpecified: v181InFormInBylawsSchema,
  nonprofitBoardMemberQualificationsTerms: z.string(),
  nonprofitBoardMemberRightsSpecified: v181InFormInBylawsSchema,
  nonprofitBoardMemberRightsTerms: z.string(),
  nonprofitTrusteesMethodSpecified: v181InFormInBylawsSchema,
  nonprofitTrusteesMethodTerms: z.string(),
  nonprofitAssetDistributionSpecified: v181InFormInBylawsSchema,
  nonprofitAssetDistributionTerms: z.string(),
  additionalProvisions: z.array(z.string()).optional(),
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
  members: z.array(v181FormationMemberSchema).optional(),
  incorporators: z.array(v181FormationIncorporatorSchema).optional(),
  signers: z.array(v181FormationSignerSchema).optional(),
  paymentType: v181PaymentTypeSchema,
  annualReportNotification: z.boolean(),
  corpWatchNotification: z.boolean(),
  officialFormationDocument: z.boolean(),
  certificateOfStanding: z.boolean(),
  certifiedCopyOfFormationDocument: z.boolean(),
  contactFirstName: z.string(),
  contactLastName: z.string(),
  contactPhoneNumber: z.string(),
  foreignStateOfFormation: v181StateObjectSchema.optional(),
  foreignDateOfFormation: z.string().optional(), // YYYY-MM-DD
  foreignGoodStandingFile: v181ForeignGoodStandingFileObjectSchema.optional(),
  legalType: z.string(),
  willPracticeLaw: z.boolean().optional(),
  isVeteranNonprofit: z.boolean().optional(),
  checkNameReservation: z.boolean(),
  howToProceed: v181HowToProceedOptionsSchema,
}) satisfies z.ZodType<v181FormationFormData>;


export const v181FormationDataSchema: z.ZodType<v181FormationData> = z.object({
  formationFormData: v181FormationFormDataSchema,
  businessNameAvailability: v181NameAvailabilitySchema.optional(),
  dbaBusinessNameAvailability: v181NameAvailabilitySchema.optional(),
  formationResponse: v181FormationSubmitResponseSchema.optional(),
  getFilingResponse: v181GetFilingResponseSchema.optional(),
  completedFilingPayment: z.boolean(),
  lastVisitedPageIndex: z.number(),
});

export const v181LicensesSchema = z.record(v181LicenseNameSchema, v181LicenseDetailsSchema);

export const v181LicenseDataSchema: z.ZodType<v181LicenseData> = z.object({
  lastUpdatedISO: z.string(),
  licenses: v181LicensesSchema.optional(),
});

export const v181PreferencesSchema: z.ZodType<v181Preferences> = z.object({
  roadmapOpenSections: z.array(v181SectionTypeSchema),
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

export const v181BusinessSchema: z.ZodType<v181Business> = z.object({
  id: z.string(),
  dateCreatedISO: z.string(),
  lastUpdatedISO: z.string(),
  dateDeletedISO: z.string(),
  profileData: v181ProfileDataSchema,
  onboardingFormProgress: v181OnboardingFormProgressSchema,
  taskProgress: z.record(z.string(), v181TaskProgressSchema),
  taskItemChecklist: z.record(z.string(), z.boolean()),
  licenseData: v181LicenseDataSchema.optional(),
  preferences: v181PreferencesSchema,
  taxFilingData: v181TaxFilingDataSchema,
  formationData: v181FormationDataSchema,
  environmentData: v181EnvironmentDataSchema.optional(),
  xrayRegistrationData: v181XrayDataSchema.optional(),
  roadmapTaskData: v181RoadmapTaskDataSchema,
  taxClearanceCertificateData: v181TaxClearanceCertificateDataSchema.optional(),
  cigaretteLicenseData: v181CigaretteLicenseDataSchema.optional(),
  version: z.number(),
  versionWhenCreated: z.number(),
  userId: z.string(),
});

export const v181UserDataSchema: z.ZodType<v181UserData> = z.object({
  user: v181BusinessUserSchema,
  version: z.number(),
  lastUpdatedISO: z.string(),
  dateCreatedISO: z.string(),
  versionWhenCreated: z.number(),
  businesses: z.record(z.string(), v181BusinessSchema),
  currentBusinessId: z.string(),
});
