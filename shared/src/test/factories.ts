import { randomElementFromArray } from "../arrayHelpers";
import { BusinessUser } from "../businessUser";
import { TaxFilingCalendarEvent } from "../calendarEvent";
import { CigaretteLicenseData, EmailConfirmationSubmission } from "../cigaretteLicense";
import { getCurrentDate, getCurrentDateFormatted, getCurrentDateISOString } from "../dateHelpers";
import { defaultDateFormat } from "../defaultConstants";
import { createBusinessId } from "../domain-logic/createBusinessId";
import { EmergencyTripPermitApplicationInfo, getEarliestPermitDate } from "../emergencyTripPermit";
import {
  AirData,
  DrinkingWaterData,
  EnvironmentData,
  LandData,
  QuestionnaireData,
  WasteData,
  WasteWaterData,
} from "../environment";

import {
  createEmptyFormationFormData,
  FormationData,
  FormationLegalType,
  FormationSubmitResponse,
  GetFilingResponse,
  PublicFilingLegalType,
  publicFilingLegalTypes,
} from "../formationData";
import { getIndustries, Industry } from "../industry";
import { randomInt, randomIntFromInterval } from "../intHelpers";
import { LegalStructure, LegalStructures } from "../legalStructure";
import {
  LicenseData,
  LicenseDetails,
  Licenses,
  LicenseSearchAddress,
  LicenseSearchNameAndAddress,
  licenseStatuses,
  LicenseStatusItem,
  taskIdLicenseNameMapping,
} from "../license";
import { MunicipalityDetail } from "../municipality";
import { OperatingPhaseId } from "../operatingPhase";
import {
  BusinessPersona,
  IndustrySpecificData,
  maskingCharacter,
  ProfileData,
} from "../profileData";
import { RoadmapTaskData } from "../roadmapTaskData";
import { arrayOfSectors, SectorType } from "../sector";
import { arrayOfStateObjects as states, StateObject } from "../states";
import {
  taxClearanceCertificateAgencies,
  TaxClearanceCertificateData,
} from "../taxClearanceCertificate";
import { TaxFilingData, TaxFilingLookUpRequest } from "../taxFiling";
import { Business, CURRENT_VERSION, Preferences, UserData } from "../userData";
import { XrayData, XrayRegistrationStatus } from "../xray";
import { generateFormationFormData, generateMunicipality } from "./formationFactories";
import { EmployerRatesRequest, EmployerRatesResponse } from "../employerRates";

export const generateFormationSubmitResponse = (
  overrides: Partial<FormationSubmitResponse>,
): FormationSubmitResponse => {
  return {
    success: !!(randomInt() % 2),
    token: `some-token-${randomInt()}`,
    formationId: `some-id-${randomInt()}`,
    redirect: `some-redirect-${randomInt()}`,
    errors: [],
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateGetFilingResponse = (
  overrides: Partial<GetFilingResponse>,
): GetFilingResponse => {
  return {
    success: true,
    entityId: `some-entity-${randomInt()}`,
    transactionDate: getCurrentDateISOString(),
    confirmationNumber: `some-confirmation-number-${randomInt()}`,
    formationDoc: `some-formation-doc-${randomInt()}`,
    standingDoc: `some-standing-doc-${randomInt()}`,
    certifiedDoc: `some-certified-doc-${randomInt()}`,
    ...overrides,
  };
};

export const generateFormationData = (
  overrides: Partial<FormationData>,
  legalStructureId?: FormationLegalType,
): FormationData => {
  return {
    formationFormData: generateFormationFormData({}, { legalStructureId }),
    businessNameAvailability: undefined,
    dbaBusinessNameAvailability: undefined,
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    lastVisitedPageIndex: 0,
    ...overrides,
  };
};

export const randomSector = (): SectorType => {
  const randomIndex = Math.floor(Math.random() * arrayOfSectors.length);
  return arrayOfSectors[randomIndex];
};

export const generatePreferences = (overrides: Partial<Preferences>): Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [randomInt()],
    hiddenFundingIds: [],
    hiddenCertificationIds: [],
    visibleSidebarCards: [],
    returnToLink: "",
    isCalendarFullView: !(randomInt() % 2),
    isHideableRoadmapOpen: !(randomInt() % 2),
    phaseNewlyChanged: false,
    isNonProfitFromFunding: false,
    ...overrides,
  };
};

export const generateLicenseSearchNameAndAddress = (
  overrides: Partial<LicenseSearchNameAndAddress>,
): LicenseSearchNameAndAddress => {
  return {
    name: `some-name-${randomInt()}`,
    ...generateLicenseSearchAddress({}),
    ...overrides,
  };
};

export const generateLicenseSearchAddress = (
  overrides: Partial<LicenseSearchAddress>,
): LicenseSearchAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    zipCode: `some-zipcode-${randomInt()}`,
    ...overrides,
  };
};

export const generateTaxIdAndBusinessName = (
  overrides: Partial<TaxFilingLookUpRequest>,
): TaxFilingLookUpRequest => {
  return {
    businessName: `some-name-${randomInt()}`,
    taxId: `${randomInt(12)}`,
    encryptedTaxId: "some-encrypted-value",
    ...overrides,
  };
};

export const generateLicenseStatusItem = (
  overrides: Partial<LicenseStatusItem>,
): LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
    ...overrides,
  };
};

export const generateTaxFilingCalendarEvent = (
  overrides: Partial<TaxFilingCalendarEvent>,
): TaxFilingCalendarEvent => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: getCurrentDateFormatted(defaultDateFormat),
    calendarEventType: "TAX-FILING",
    ...overrides,
  };
};

export const randomLegalStructure = (publicFiling?: {
  requiresPublicFiling: boolean | undefined;
}): LegalStructure => {
  const _requiresPublicFiling = publicFiling?.requiresPublicFiling ?? Boolean(randomInt() % 2);
  const LegalPublicFilings = LegalStructures.filter((item: LegalStructure) => {
    return item.requiresPublicFiling === _requiresPublicFiling;
  });
  const randomIndex = Math.floor(Math.random() * LegalPublicFilings.length);
  return LegalPublicFilings[randomIndex];
};

export const generateLicenseDetails = (overrides: Partial<LicenseDetails>): LicenseDetails => {
  return {
    nameAndAddress: generateLicenseSearchNameAndAddress({}),
    licenseStatus: randomElementFromArray(licenseStatuses),
    checklistItems: [generateLicenseStatusItem({})],
    expirationDateISO: getCurrentDate().add(1, "year").toISOString(),
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateLicenseData = (
  overrides: Partial<LicenseData>,
  licensesOverrides?: Licenses,
): LicenseData => {
  return {
    licenses: {
      [randomElementFromArray(Object.values(taskIdLicenseNameMapping))]: {
        ...generateLicenseDetails({}),
      },
      ...licensesOverrides,
    },
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    externalStatus: {},
    receiveNewsletter: true,
    userTesting: true,
    accountCreationSource: `some-source-${randomInt()}`,
    contactSharingWithAccountCreationPartner: true,
    abExperience: randomInt() % 2 === 0 ? "ExperienceA" : "ExperienceB",
    ...overrides,
  };
};

export const filterRandomIndustry = (function_: (industry: Industry) => boolean): Industry => {
  const filteredIndustries = getIndustries().filter((x: Industry) => {
    return function_(x);
  });
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};

export const randomIndustry = (canHavePermanentLocation = false): Industry => {
  const filter = (x: Industry): boolean => {
    return x.canHavePermanentLocation === canHavePermanentLocation;
  };
  return filterRandomIndustry(filter);
};

export const generateIndustrySpecificData = (
  overrides: Partial<IndustrySpecificData>,
  industry?: Industry,
): IndustrySpecificData => {
  const _industry = industry ?? randomIndustry();
  return {
    liquorLicense: !(randomInt() % 2),
    requiresCpa: !(randomInt() % 2),
    homeBasedBusiness: !(randomInt() % 2),
    plannedRenovationQuestion: !(randomInt() % 2),
    cannabisLicenseType: randomElementFromArray(["CONDITIONAL", "ANNUAL"]),
    cannabisMicrobusiness: !(randomInt() % 2),
    constructionRenovationPlan: !(randomInt() % 2),
    providesStaffingService: !(randomInt() % 2),
    certifiedInteriorDesigner:
      !!_industry.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable,
    realEstateAppraisalManagement: !(randomInt() % 2),
    carService: randomElementFromArray(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
    interstateLogistics: !(randomInt() % 2),
    interstateMoving: !(randomInt() % 2),
    isChildcareForSixOrMore: !(randomInt() % 2),
    petCareHousing: !(randomInt() % 2),
    willSellPetCareItems: !(randomInt() % 2),
    constructionType: randomElementFromArray(["RESIDENTIAL", "COMMERCIAL_OR_INDUSTRIAL", "BOTH"]),
    residentialConstructionType: randomElementFromArray([
      "NEW_HOME_CONSTRUCTION",
      "HOME_RENOVATIONS",
      "BOTH",
    ]),
    employmentPersonnelServiceType: randomElementFromArray(["JOB_SEEKERS", "EMPLOYERS"]),
    employmentPlacementType: randomElementFromArray(["TEMPORARY", "PERMANENT", "BOTH"]),
    carnivalRideOwningBusiness: !(randomInt() % 2),
    propertyLeaseType: randomElementFromArray(["SHORT_TERM_RENTAL", "LONG_TERM_RENTAL", "BOTH"]),
    hasThreeOrMoreRentalUnits: !(randomInt() % 2),
    travelingCircusOrCarnivalOwningBusiness: !(randomInt() % 2),
    vacantPropertyOwner: !(randomInt() % 2),
    publicWorksContractor: !(randomInt() % 2),
    ...overrides,
  };
};

export const generateProfileData = (
  overrides: Partial<ProfileData>,
  canHavePermanentLocation?: boolean,
): ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona: BusinessPersona = randomElementFromArray(["STARTING", "OWNING", "FOREIGN"]);
  const industry = randomIndustry(canHavePermanentLocation);
  const taxId = randomInt(12).toString();

  return {
    ...generateIndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-responsible-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    industryId: industry.id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    hashedTaxId: undefined,
    encryptedTaxId: `encrypted-${taxId}`,
    taxPin: maskingCharacter.repeat(4),
    encryptedTaxPin: `encrypted-${randomInt(4)}`,
    notes: `some-notes-${randomInt()}`,
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    existingEmployees: randomInt(7).toString(),
    sectorId: randomSector().id,
    naicsCode: randomInt(6).toString(),
    foreignBusinessTypeIds: [],
    nexusDbaName: "",
    operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
    nonEssentialRadioAnswers: {},
    elevatorOwningBusiness: undefined,
    carnivalRideOwningBusiness: undefined,
    raffleBingoGames: undefined,
    businessOpenMoreThanTwoYears: undefined,
    employerAccessRegistration: undefined,
    deptOfLaborEin: randomInt(15).toString(),
    ...overrides,
  };
};

export const generateStartingProfileData = (
  overrides: Partial<ProfileData>,
  canHavePermanentLocation?: boolean,
): ProfileData => {
  return generateProfileData(
    {
      ...overrides,
      businessPersona: "STARTING",
    },
    canHavePermanentLocation,
  );
};

export const generateOwningProfileData = (
  overrides: Partial<ProfileData>,
  canHavePermanentLocation?: boolean,
): ProfileData => {
  return generateProfileData(
    {
      ...overrides,
      businessPersona: "OWNING",
    },
    canHavePermanentLocation,
  );
};

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
    state: undefined,
    businessName: undefined,
    errorField:
      overrides.state === "FAILED"
        ? randomElementFromArray(["businessName", "formFailure", undefined])
        : undefined,
    lastUpdatedISO: overrides.state ? new Date(Date.now()).toISOString() : undefined,
    registeredISO: ["SUCCESS", "PENDING"].includes(overrides.state ?? "")
      ? new Date(Date.now()).toISOString()
      : undefined,
    filings: [generateTaxFilingCalendarEvent({})],
    ...overrides,
  };
};

export const generateUnitedStatesStateDropdownOption = ({
  includeOutsideOfTheUSA,
  excludeNJ,
  excludeTerritories,
}: {
  includeOutsideOfTheUSA?: boolean;
  excludeNJ?: boolean;
  excludeTerritories?: boolean;
}): StateObject => {
  let filteredStates = states;
  if (!includeOutsideOfTheUSA) {
    filteredStates = filteredStates.filter((stateObject) => {
      return stateObject.shortCode !== "Outside of the USA";
    });
  }
  if (excludeNJ) {
    filteredStates = filteredStates.filter((stateObject) => {
      return stateObject.shortCode !== "NJ";
    });
  }

  if (excludeTerritories) {
    filteredStates = filteredStates.filter((stateObject) => {
      return (
        stateObject.shortCode !== "AS" &&
        stateObject.shortCode !== "VI" &&
        stateObject.shortCode !== "GU"
      );
    });
  }

  return randomElementFromArray(filteredStates);
};

export const generateTaxClearanceCertificateData = (
  overrides: Partial<TaxClearanceCertificateData>,
): TaxClearanceCertificateData => {
  const taxId = randomInt(12).toString();
  const addressState = generateUnitedStatesStateDropdownOption({});
  return {
    requestingAgencyId: randomElementFromArray(taxClearanceCertificateAgencies).id,
    businessName: `some-business-name-${randomInt()}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
    addressState,
    addressZipCode: addressState.shortCode === "NJ" ? generateNjZipCode() : randomInt(5).toString(),
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    encryptedTaxId: `encrypted-${taxId}`,
    taxPin: maskingCharacter.repeat(4),
    encryptedTaxPin: `encrypted-${randomInt(4)}`,
    hasPreviouslyReceivedCertificate: false,
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateCigaretteLicenseData = (
  overrides: Partial<CigaretteLicenseData>,
): CigaretteLicenseData => {
  const taxId = randomInt(12).toString();
  const addressState = generateUnitedStatesStateDropdownOption({});
  return {
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    encryptedTaxId: `encrypted-${taxId}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
    addressState,
    addressZipCode: addressState.shortCode === "NJ" ? generateNjZipCode() : randomInt(5).toString(),
    mailingAddressIsTheSame: false,
    mailingAddressLine1: "",
    mailingAddressLine2: "",
    mailingAddressCity: "",
    mailingAddressState: undefined,
    mailingAddressZipCode: "",
    contactName: `some-contact-name-${randomInt()}`,
    contactPhoneNumber: `some-phone-number-${randomInt()}`,
    contactEmail: `some-email-${randomInt()}`,
    salesInfoStartDate: "08/31/2025",
    salesInfoSupplier: [],
    signerName: `some-signer-name-${randomInt()}`,
    signerRelationship: `some-signer-relationship-${randomInt()}`,
    signature: false,
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateEmailConfirmationSubmission = (
  overrides: Partial<EmailConfirmationSubmission>,
): EmailConfirmationSubmission => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    businessType: randomLegalStructure().name,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    taxId: maskingCharacter.repeat(7) + randomInt(12).toString().slice(-5),
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
    addressState: generateUnitedStatesStateDropdownOption({}).name,
    addressZipCode: randomInt(5).toString(),
    mailingAddressIsTheSame: false,
    mailingAddressLine1: `some-mailing-address-1-${randomInt()}`,
    mailingAddressLine2: `some-mailing-address-2-${randomInt()}`,
    mailingAddressCity: `some-mailing-city-${randomInt()}`,
    mailingAddressState: generateUnitedStatesStateDropdownOption({}).name,
    mailingAddressZipCode: randomInt(5).toString(),
    contactName: `some-contact-name-${randomInt()}`,
    contactPhoneNumber: `some-phone-number-${randomInt()}`,
    contactEmail: `some-email-${randomInt()}@example.com`,
    salesInfoStartDate: "08/31/2025",
    salesInfoSupplier: `some-sales-info-supplier-${randomInt()}`,
    signerName: `some-signer-name-${randomInt()}`,
    signerRelationship: `some-signer-relationship-${randomInt()}`,
    signature: true,
    paymentInfo: {
      orderId: randomInt(),
      orderStatus: "COMPLETED",
      orderTimestamp: getCurrentDateISOString(),
    },
    ...overrides,
  };
};

export const generateLandData = (overrides: Partial<LandData>): LandData => {
  return {
    takeOverExistingBiz: false,
    propertyAssessment: false,
    constructionActivities: false,
    siteImprovementWasteLands: false,
    noLand: false,
    ...overrides,
  };
};

export const generateWasteData = (overrides: Partial<WasteData>): WasteData => {
  return {
    transportWaste: false,
    hazardousMedicalWaste: false,
    constructionDebris: false,
    compostWaste: false,
    treatProcessWaste: false,
    noWaste: false,
    ...overrides,
  };
};

export const generateAirData = (overrides: Partial<AirData>): AirData => {
  return {
    emitEmissions: false,
    emitPollutants: false,
    constructionActivities: false,
    noAir: false,
    ...overrides,
  };
};

export const generateWasteWaterData = (overrides: Partial<WasteWaterData>): WasteWaterData => {
  return {
    sanitaryWaste: false,
    industrialWaste: false,
    localSewage: false,
    septicSystem: false,
    streamsRiversOrLakes: false,
    needsTreatment: false,
    planningConstruction: false,
    stormWaterDischarge: false,
    takeoverIndustrialStormWaterPermit: false,
    noWasteWater: false,
    ...overrides,
  };
};

export const generateDrinkingWaterData = (
  overrides: Partial<DrinkingWaterData>,
): DrinkingWaterData => {
  return {
    ownWell: false,
    combinedWellCapacity: false,
    wellDrilled: false,
    potableWater: false,
    noDrinkingWater: false,
    ...overrides,
  };
};

export const generateEnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<AirData>;
  landOverrides?: Partial<LandData>;
  wasteOverrides?: Partial<WasteData>;
  drinkingWaterOverrides?: Partial<DrinkingWaterData>;
  wasteWaterOverrides?: Partial<WasteWaterData>;
}): QuestionnaireData => ({
  air: generateAirData({ ...airOverrides }),
  land: generateLandData({ ...landOverrides }),
  waste: generateWasteData({ ...wasteOverrides }),
  drinkingWater: generateDrinkingWaterData({ ...drinkingWaterOverrides }),
  wasteWater: generateWasteWaterData({ ...wasteWaterOverrides }),
});

export const generateEnvironmentData = (overrides: Partial<EnvironmentData>): EnvironmentData => {
  return {
    submitted: false,
    questionnaireData: generateEnvironmentQuestionnaireData({}),
    ...overrides,
  };
};

export const generateXrayRegistrationData = (overrides: Partial<XrayData>): XrayData => {
  return {
    facilityDetails: {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 1",
      addressZipCode: "12345",
    },
    status: "ACTIVE" as XrayRegistrationStatus,
    deactivationDate: undefined,
    expirationDate: "08/31/2025",
    machines: [
      {
        registrationNumber: "registrationNumber-123",
        roomId: "01",
        registrationCategory: "DENTIST",
        name: "CORP",
        modelNumber: "modelNumber-123",
        serialNumber: "serialNumber-123",
        annualFee: 92,
      },
    ],
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateBusiness = (overrides: Partial<Business>): Business => {
  const taxId = maskingCharacter.repeat(7) + randomInt(12).toString().slice(-5);
  const taxPin = maskingCharacter.repeat(4);
  const profileData = overrides.profileData ?? generateProfileData({ taxId, taxPin });
  const formationData: FormationData = publicFilingLegalTypes.includes(
    profileData.legalStructureId as PublicFilingLegalType,
  )
    ? generateFormationData({}, profileData.legalStructureId as FormationLegalType)
    : {
        formationFormData: createEmptyFormationFormData(),
        businessNameAvailability: undefined,
        dbaBusinessNameAvailability: undefined,
        formationResponse: undefined,
        getFilingResponse: undefined,
        completedFilingPayment: false,
        lastVisitedPageIndex: 0,
      };

  return {
    id: createBusinessId(),
    dateCreatedISO: getCurrentDateISOString(),
    lastUpdatedISO: getCurrentDateISOString(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: profileData.employerId ? { "register-for-ein": "COMPLETED" } : {},
    taskItemChecklist: {},
    licenseData: generateLicenseData({}),
    preferences: generatePreferences({}),
    taxFilingData: generateTaxFilingData({}),
    taxClearanceCertificateData: generateTaxClearanceCertificateData({ taxId, taxPin }),
    cigaretteLicenseData: generateCigaretteLicenseData({}),
    environmentData: generateEnvironmentData({}),
    xrayRegistrationData: undefined,
    roadmapTaskData: generateRoadmapTaskData({}),
    version: CURRENT_VERSION,
    userId: generateUser({}).id,
    versionWhenCreated: CURRENT_VERSION,
    dateDeletedISO: "",
    profileData,
    formationData,
    ...overrides,
  };
};

export const generateRoadmapTaskData = (overrides: Partial<RoadmapTaskData>): RoadmapTaskData => {
  return {
    manageBusinessVehicles: !(randomInt() % 2),
    passengerTransportSchoolBus: !(randomInt() % 2),
    passengerTransportSixteenOrMorePassengers: !(randomInt() % 2),
    ...overrides,
  };
};
export const generateUserData = (overrides: Partial<UserData>): UserData => {
  const id = createBusinessId();
  return {
    version: CURRENT_VERSION,
    versionWhenCreated: -1,
    dateCreatedISO: getCurrentDateISOString(),
    lastUpdatedISO: getCurrentDateISOString(),
    user: generateUser({}),
    currentBusinessId: overrides.currentBusinessId ?? id,
    businesses: {
      ...overrides.businesses,
      [id]: generateBusiness({ id }),
    },
    ...overrides,
  };
};

export const generateUserDataForBusiness = (
  business: Business,
  overrides?: Partial<UserData>,
): UserData => {
  return {
    version: CURRENT_VERSION,
    versionWhenCreated: -1,
    dateCreatedISO: getCurrentDateISOString(),
    lastUpdatedISO: getCurrentDateISOString(),
    user: generateUser({ id: business.userId }),
    currentBusinessId: business.id,
    businesses: {
      [business.id]: business,
    },
    ...overrides,
  };
};

export const generateMunicipalityDetail = (
  overrides: Partial<MunicipalityDetail>,
): MunicipalityDetail => {
  return {
    id: `some-id-${randomInt()}`,
    townName: `some-town-name-${randomInt()}`,
    countyId: `some-county-id-${randomInt()}`,
    townDisplayName: `some-town-display-name-${randomInt()}`,
    townWebsite: `some-town-website-${randomInt()}`,
    countyName: `some-county-name-${randomInt()}`,
    countyClerkPhone: `some-phone-${randomInt()}`,
    countyClerkWebsite: `some-clerk-webpage-${randomInt()}`,
    countyWebsite: `some-county-website-${randomInt()}`,
    ...overrides,
  };
};

export const generateEmergencyTripPermitApplicationData = (
  overrides: Partial<EmergencyTripPermitApplicationInfo>,
): EmergencyTripPermitApplicationInfo => {
  const requestorEmail = `email-${randomInt()}@email.com`;
  const payerEmail = `email-${randomInt()}@email.com`;
  const additionalEmail = `email-${randomInt()}@email.com`;
  return {
    additionalConfirmemail: additionalEmail,
    additionalEmail: additionalEmail,
    carrier: `some-carrier-${randomInt()}`,
    deliveryAddress: `some-delivery-address-${randomInt()}`,
    deliveryCity: `some-delivery-city-${randomInt()}`,
    deliveryCountry: "US",
    deliverySiteName: `some-delivery-site-name-${randomInt()}`,
    deliveryStateProvince: "NJ",
    deliveryZipPostalCode: `${randomInt(5)}`,
    payerCountry: "US",
    payerStateAbbreviation: "NJ",
    payerFirstName: `some-payer-first-name-${randomInt()}`,
    payerLastName: `some-payer-last-name-${randomInt()}`,
    payerCompanyName: "`some-payer-company-${randomInt()}`",
    payerCity: `some-payer-city-${randomInt()}`,
    payerEmail: payerEmail,
    payerZipCode: `${randomInt(5)}`,
    payerPhoneNumber: `${randomInt(10)}`,
    payerAddress1: `some-payer-address-1-${randomInt()}`,
    payerAddress2: `some-payer-address-1-${randomInt()}`,
    shouldAttachPdfToEmail: false,
    permitDate: getEarliestPermitDate()
      .add(randomIntFromInterval("1", "4"), "days")
      .format(defaultDateFormat),
    permitStartTime: `${randomIntFromInterval("0", "11")}:00`,
    pickupAddress: `some-pickup-address-${randomInt()}`,
    pickupCity: `some-pickup-city-${randomInt()}`,
    pickupCountry: "US",
    pickupSiteName: `some-pickup-site-name-${randomInt()}`,
    pickupStateProvince: "NJ",
    pickupZipPostalCode: `${randomInt(5)}`,
    requestorAddress2: `some-requestor-address-2-${randomInt()}`,
    requestorAddress1: `some-requestor-address-1-${randomInt()}`,
    requestorCity: `some-requestor-city-${randomInt()}`,
    requestorConfirmemail: requestorEmail,
    requestorCountry: "US",
    requestorEmail: requestorEmail,
    requestorFirstName: `some-requestor-first-name-${randomInt()}`,
    requestorLastName: `some-requestor-last-name-${randomInt()}`,
    requestorPhone: `${randomInt(10)}`,
    requestorStateProvince: "NJ",
    requestorZipPostalCode: "",
    shouldSendTextConfirmation: false,
    textMsgMobile: `${randomInt(10)}`,
    vehicleCountry: "US",
    vehicleLicensePlateNum: `${randomInt(6)}`,
    vehicleMake: `some-vehicle-make-${randomInt()}`,
    vehicleStateProvince: "NJ",
    vehicleVinSerial: `${randomInt(10)}`,
    vehicleYear: `${randomInt(4)}`,
    ...overrides,
  };
};

export const generateNjZipCode = (): string => {
  return `0${randomIntFromInterval("7", "8")}${randomInt(3)}`;
};

export const generateEmployerRatesRequestData = (
  overrides: Partial<EmployerRatesRequest>,
): EmployerRatesRequest => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    email: `some-email-${randomInt()}`,
    ein: `some-ein-${randomInt()}`,
    qtr: randomInt(),
    year: randomInt(),
    ...overrides,
  };
};

export const generateEmployerRatesResponse = (
  overrides: Partial<EmployerRatesResponse>,
): EmployerRatesResponse => {
  return {
    employerUiRate: `some-employer-ui-rate-${randomInt()}`,
    employerWfRate: `some-employer-wf-rate-${randomInt()}`,
    employerHcRate: `some-employer-hc-rate-${randomInt()}`,
    employerDiRate: `some-employer-di-rate-${randomInt()}`,
    workerUiRate: `some-worker-ui-rate-${randomInt()}`,
    workerWfRate: `some-worker-wf-rate-${randomInt()}`,
    workerHcRate: `some-worker-hc-rate-${randomInt()}`,
    workerDiRate: `some-worker-di-rate-${randomInt()}`,
    workerFliRate: `some-worker-fli-rate-${randomInt()}`,
    totalDi: `some-total-di-${randomInt()}`,
    totalUiHcWf: `some-total-ui-hc-wf-${randomInt()}`,
    totalFli: `some-total-fli-${randomInt()}`,
    taxableWageBase: `some-taxable-wage-base-${randomInt()}`,
    baseWeekAmt: `some-base-week-amt-${randomInt()}`,
    numberOfBaseWeeks: `some-number-of-base-weeks-${randomInt()}`,
    taxableWageBaseDiFli: `some-taxable-wage-base-di-fli-${randomInt()}`,
    error: `some-error-${randomInt()}`,
    ...overrides,
  };
};
