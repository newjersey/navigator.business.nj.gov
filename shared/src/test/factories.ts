import { randomElementFromArray } from "../arrayHelpers";
import { BusinessUser } from "../businessUser";
import { getCurrentDate, getCurrentDateFormatted, getCurrentDateISOString } from "../dateHelpers";
import { defaultDateFormat } from "../defaultConstants";
import { createBusinessId } from "../domain-logic/createBusinessId";
import {
  FormationData,
  FormationLegalType,
  FormationSubmitResponse,
  GetFilingResponse,
  PublicFilingLegalType,
  createEmptyFormationFormData,
  publicFilingLegalTypes,
} from "../formationData";
import { Industries, Industry } from "../industry";
import { randomInt } from "../intHelpers";
import { LegalStructure, LegalStructures } from "../legalStructure";
import {
  LicenseData,
  LicenseSearchAddress,
  LicenseSearchNameAndAddress,
  LicenseStatusItem,
  LicenseStatusResult,
} from "../license";
import { MunicipalityDetail } from "../municipality";
import { IndustrySpecificData, ProfileData } from "../profileData";
import { SectorType, arrayOfSectors } from "../sector";
import { TaxFilingCalendarEvent, TaxFilingData, TaxFilingLookUpRequest } from "../taxFiling";
import { Business, CURRENT_VERSION, Preferences, UserData } from "../userData";
import { generateFormationFormData, generateMunicipality } from "./formationFactories";

export const generateFormationSubmitResponse = (
  overrides: Partial<FormationSubmitResponse>
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

export const generateGetFilingResponse = (overrides: Partial<GetFilingResponse>): GetFilingResponse => {
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
  legalStructureId?: FormationLegalType
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
    ...overrides,
  };
};

export const generateLicenseSearchNameAndAddress = (
  overrides: Partial<LicenseSearchNameAndAddress>
): LicenseSearchNameAndAddress => {
  return {
    name: `some-name-${randomInt()}`,
    ...generateLicenseSearchAddress({}),
    ...overrides,
  };
};

export const generateLicenseSearchAddress = (
  overrides: Partial<LicenseSearchAddress>
): LicenseSearchAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    zipCode: `some-zipcode-${randomInt()}`,
    ...overrides,
  };
};

export const generateTaxIdAndBusinessName = (
  overrides: Partial<TaxFilingLookUpRequest>
): TaxFilingLookUpRequest => {
  return {
    businessName: `some-name-${randomInt()}`,
    taxId: `${randomInt(12)}`,
    encryptedTaxId: "some-encrypted-value",
    ...overrides,
  };
};

export const generateLicenseStatusResult = (overrides: Partial<LicenseStatusResult>): LicenseStatusResult => {
  return {
    status: "PENDING",
    checklistItems: [generateLicenseStatusItem({})],
    ...overrides,
  };
};

export const generateLicenseStatusItem = (overrides: Partial<LicenseStatusItem>): LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
    ...overrides,
  };
};

export const generateTaxFilingCalendarEvent = (
  overrides: Partial<TaxFilingCalendarEvent>
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

export const generateLicenseData = (overrides: Partial<LicenseData>): LicenseData => {
  return {
    nameAndAddress: generateLicenseSearchNameAndAddress({}),
    completedSearch: false,
    items: [generateLicenseStatusItem({})],
    status: "PENDING",
    lastUpdatedISO: getCurrentDateISOString(),
    expirationISO: getCurrentDate().add(1, "year").toISOString(),
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
    abExperience: randomInt() % 2 === 0 ? "ExperienceA" : "ExperienceB",
    ...overrides,
  };
};

export const randomFilteredIndustry = (
  function_: (industry: Industry) => boolean,
  { isEnabled = true }
): Industry => {
  const filteredIndustries = Industries.filter((x: Industry) => {
    return function_(x) && x.isEnabled === isEnabled;
  });
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};

export const randomIndustry = (canHavePermanentLocation = false): Industry => {
  const filter = (x: Industry): boolean => {
    return x.canHavePermanentLocation === canHavePermanentLocation;
  };
  return randomFilteredIndustry(filter, { isEnabled: true });
};

export const generateIndustrySpecificData = (
  overrides: Partial<IndustrySpecificData>,
  industry?: Industry
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
    certifiedInteriorDesigner: !!_industry.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable,
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
    employmentPersonnelServiceType: randomElementFromArray(["JOB SEEKERS", "EMPLOYERS"]),
    employmentPlacementType: randomElementFromArray(["TEMPORARY", "PERMANENT"]),
    ...overrides,
  };
};

export const generateProfileData = (
  overrides: Partial<ProfileData>,
  canHavePermanentLocation?: boolean
): ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  const industry = randomIndustry(canHavePermanentLocation);
  const legalStructure = randomLegalStructure().id;

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
    taxId: randomInt(12).toString(),
    encryptedTaxId: undefined,
    notes: `some-notes-${randomInt()}`,
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    existingEmployees: randomInt(7).toString(),
    taxPin: randomInt(4).toString(),
    sectorId: randomSector().id,
    naicsCode: randomInt(6).toString(),
    foreignBusinessTypeIds: [],
    nexusDbaName: "",
    needsNexusDbaName: false,
    operatingPhase: "NEEDS_TO_FORM",
    isNonprofitOnboardingRadio: legalStructure === "nonprofit",
    nonEssentialRadioAnswers: {},
    elevatorOwningBusiness: undefined,
    ...overrides,
  };
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

export const generateBusiness = (overrides: Partial<Business>): Business => {
  const profileData = overrides.profileData ?? generateProfileData({});
  const formationData: FormationData = publicFilingLegalTypes.includes(
    profileData.legalStructureId as PublicFilingLegalType
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
    profileData,
    formationData,
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

export const generateUserDataForBusiness = (business: Business, overrides?: Partial<UserData>): UserData => {
  return {
    version: CURRENT_VERSION,
    versionWhenCreated: -1,
    dateCreatedISO: getCurrentDateISOString(),
    lastUpdatedISO: getCurrentDateISOString(),
    user: generateUser({}),
    currentBusinessId: business.id,
    businesses: {
      [business.id]: business,
    },
    ...overrides,
  };
};

export const generateMunicipalityDetail = (overrides: Partial<MunicipalityDetail>): MunicipalityDetail => {
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
