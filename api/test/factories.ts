import {
  BusinessUser,
  ExternalStatus,
  NewsletterResponse,
  NewsletterStatus,
  newsletterStatusList,
  UserTestingResponse,
} from "@shared/businessUser";
import { getCurrentDate, getCurrentDateFormatted, getCurrentDateISOString } from "@shared/dateHelpers";
import { UserFeedbackRequest, UserIssueRequest } from "@shared/feedbackRequest";
import {
  AllBusinessSuffixes,
  BusinessSuffix,
  BusinessSuffixMap,
  corpLegalStructures,
  createEmptyFormationAddress,
  createEmptyFormationFormData,
  FormationAddress,
  FormationData,
  FormationFormData,
  FormationLegalType,
  FormationLegalTypes,
  FormationSubmitResponse,
  GetFilingResponse,
} from "@shared/formationData";
import { Industries, Industry } from "@shared/industry";
import { randomInt, randomIntFromInterval } from "@shared/intHelpers";
import { LegalStructure, LegalStructures } from "@shared/legalStructure";
import {
  LicenseData,
  LicenseEntity,
  LicenseStatusItem,
  LicenseStatusResult,
  NameAndAddress,
} from "@shared/license";
import { Municipality } from "@shared/municipality";
import { IndustrySpecificData, ProfileData } from "@shared/profileData";
import { arrayOfSectors as sectors, SectorType } from "@shared/sector";
import { TaxFiling, TaxFilingData, TaxFilingLookUpRequest } from "@shared/taxFiling";
import { Preferences, UserData } from "@shared/userData";
import { SelfRegResponse, TaxFilingResult } from "../src/domain/types";
import { getRandomDateInBetween } from "./helpers";

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    externalStatus: generateExternalStatus({}),
    receiveNewsletter: true,
    userTesting: true,
    abExperience: randomInt() % 2 === 0 ? "ExperienceA" : "ExperienceB",
    ...overrides,
  };
};

export const generateTaxFilingDates = (numberOfDates: number) => {
  const dateToShortISO = (date: Date): string => date.toISOString().split("T")[0];
  const date = new Date(Date.now());
  const futureDate = new Date(Date.now());
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  return [...Array.from({ length: numberOfDates }).keys()].map(() =>
    getRandomDateInBetween(dateToShortISO(date), dateToShortISO(futureDate)).toLocaleDateString()
  );
};

export const generateTaxFilingResult = (overrides: Partial<TaxFilingResult>): TaxFilingResult => {
  return {
    Content: `some-content-${randomInt()}`,
    Id: `some-Id-${randomInt()}`,
    Values: generateTaxFilingDates(randomIntFromInterval("4", "12")),
    ...overrides,
  };
};

export const generateFormationUserData = (
  profileData: Partial<ProfileData>,
  formationData: Partial<FormationData>,
  formationFormData: Partial<FormationFormData>
): UserData => {
  const legalStructureId = randomFormationLegalType();
  const _profileData = generateProfileData({ legalStructureId, ...profileData });
  const _formationData = generateFormationData(
    {
      formationFormData: generateFormationFormData(
        formationFormData,
        _profileData.legalStructureId as FormationLegalType
      ),
      ...formationData,
    },
    _profileData.legalStructureId as FormationLegalType
  );
  return generateUserData({ formationData: _formationData, profileData: _profileData });
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  const profileData = overrides.profileData ?? generateProfileData({});
  const formationData: FormationData = FormationLegalTypes.includes(
    profileData.legalStructureId as FormationLegalType
  )
    ? generateFormationData({}, profileData.legalStructureId as FormationLegalType)
    : {
        formationFormData: createEmptyFormationFormData(),
        formationResponse: undefined,
        getFilingResponse: undefined,
        completedFilingPayment: false,
      };

  if (
    !corpLegalStructures.includes(profileData.legalStructureId as FormationLegalType) &&
    formationData.formationFormData.signers.length === 0
  ) {
    formationData.formationFormData.signers.push(createEmptyFormationAddress());
  }

  return {
    user: generateUser({}),
    formProgress: "UNSTARTED",
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

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
    state: undefined,
    businessName: undefined,
    lastUpdatedISO: overrides.state ? new Date(Date.now()).toISOString() : undefined,
    registered: false,
    filings: [generateTaxFiling({})],
    ...overrides,
  };
};

export const generateTaxFiling = (overrides: Partial<TaxFiling>): TaxFiling => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: getCurrentDateFormatted("YYYY-MM-DD"),
    ...overrides,
  };
};

export const generateIndustrySpecificData = (
  overrides: Partial<IndustrySpecificData>,
  industry?: Industry
): IndustrySpecificData => {
  const _industry = industry ?? randomIndustry();
  return {
    liquorLicense: false,
    requiresCpa: false,
    homeBasedBusiness: false,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    providesStaffingService: false,
    certifiedInteriorDesigner: !!_industry.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable,
    realEstateAppraisalManagement: false,
    carService: undefined,
    interstateTransport: false,
    isChildcareForSixOrMore: undefined,
    ...overrides,
  };
};

export const generateProfileData = (overrides: Partial<ProfileData>): ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  const industry = randomIndustry();
  return {
    ...generateIndustrySpecificData({}, industry),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: industry.id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
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
    foreignBusinessType: undefined,
    foreignBusinessTypeIds: [],
    nexusDbaName: undefined,
    nexusLocationInNewJersey: undefined,
    operatingPhase: "NEEDS_TO_FORM",
    ...overrides,
  };
};

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
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

export const generateLicenseStatusResult = (overrides: Partial<LicenseStatusResult>): LicenseStatusResult => {
  return {
    status: "PENDING",
    checklistItems: [generateLicenseStatusItem({})],
    ...overrides,
  };
};

export const generateTaxIdAndBusinessName = (
  overrides: Partial<TaxFilingLookUpRequest>
): TaxFilingLookUpRequest => {
  return {
    businessName: `some-name-${randomInt()}`,
    taxId: `${randomInt(12)}`,
    ...overrides,
  };
};

export const generateNameAndAddress = (overrides: Partial<NameAndAddress>): NameAndAddress => {
  return {
    name: `some-name-${randomInt()}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    zipCode: `some-zipcode-${randomInt()}`,
    ...overrides,
  };
};

export const generateLicenseEntity = (overrides: Partial<LicenseEntity>): LicenseEntity => {
  return {
    fullName: `some-name-${randomInt()}`,
    addressLine1: `some-address-${randomInt()}`,
    addressCity: `some-city-${randomInt()}`,
    addressState: `some-state-${randomInt()}`,
    addressCounty: `some-county-${randomInt()}`,
    addressZipCode: `some-zipcode-${randomInt()}`,
    professionName: `some-profession-${randomInt()}`,
    licenseType: `some-license-type${randomInt()}`,
    applicationNumber: `some-application-number-${randomInt()}`,
    licenseNumber: `some-license-number-${randomInt()}`,
    licenseStatus: "Active",
    issueDate: `20080404 000000.000${randomInt()}`,
    expirationDate: `20091231 000000.000${randomInt()}`,
    checklistItem: `some-item-${randomInt()}`,
    checkoffStatus: "Completed",
    dateThisStatus: `20100430 000000.000${randomInt()}`,
    ...overrides,
  };
};

export const generateLicenseData = (overrides: Partial<LicenseData>): LicenseData => {
  return {
    nameAndAddress: generateNameAndAddress({}),
    completedSearch: true,
    items: [generateLicenseStatusItem({})],
    status: "PENDING",
    lastCheckedStatus: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generatePreferences = (overrides: Partial<Preferences>): Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    hiddenFundingIds: [],
    hiddenCertificationIds: [],
    visibleSidebarCards: ["welcome"],
    returnToLink: "",
    isCalendarFullView: !(randomInt() % 2),
    isHideableRoadmapOpen: !(randomInt() % 2),
    ...overrides,
  };
};

export const generateSelfRegResponse = (overrides: Partial<SelfRegResponse>): SelfRegResponse => {
  return {
    myNJUserKey: `some-mynj-key-${randomInt()}`,
    authRedirectURL: `some-redirect-url-${randomInt()}`,
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * LegalStructures.length);
  return LegalStructures[randomIndex];
};

export const randomSector = (): SectorType => {
  const randomIndex = Math.floor(Math.random() * sectors.length);
  return sectors[randomIndex];
};

export const randomIndustry = (): Industry => {
  const randomIndex = Math.floor(Math.random() * Industries.length);
  return Industries[randomIndex];
};

export const randomNewsletterStatus = (failed = !!(randomInt() % 2)): NewsletterStatus => {
  const status = failed
    ? newsletterStatusList.filter((i) => i.includes("ERROR"))
    : newsletterStatusList.filter((i) => !i.includes("ERROR"));
  const randomIndex = Math.floor(Math.random() * status.length);
  return status[randomIndex];
};

export const generateExternalStatus = (overrides: Partial<ExternalStatus>): ExternalStatus => {
  return {
    newsletter: generateNewsletterResponse({}),
    userTesting: generateUserTestingResponse({}),
    ...overrides,
  };
};

export const generateFormationData = (
  overrides: Partial<FormationData>,
  legalStructureId?: FormationLegalType
): FormationData => {
  return {
    formationFormData: generateFormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    ...overrides,
  };
};

export const generateNewsletterResponse = (overrides: Partial<NewsletterResponse>): NewsletterResponse => {
  const failed = !!(randomInt() % 2);
  return {
    success: !failed,
    status: randomNewsletterStatus(failed),
    ...overrides,
  };
};

export const generateUserTestingResponse = (overrides: Partial<UserTestingResponse>): UserTestingResponse => {
  const failed = !!(randomInt() % 2);
  return {
    success: !failed,
    status: failed ? "CONNECTION_ERROR" : "SUCCESS",
    ...overrides,
  };
};

export const generateFormationFormData = (
  overrides: Partial<FormationFormData>,
  legalStructureId = randomFormationLegalType()
): FormationFormData => {
  const isCorp = legalStructureId ? corpLegalStructures.includes(legalStructureId) : false;

  return {
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: randomBusinessSuffix(legalStructureId),
    businessStartDate: getCurrentDate().add(1, "days").format("YYYY-MM-DD"),
    businessAddressCity: generateMunicipality({}),
    businessAddressLine1: `some-address-1-${randomInt()}`,
    businessAddressLine2: `some-address-2-${randomInt()}`,
    businessAddressState: "NJ",
    businessAddressZipCode: `some-zipcode-${randomInt()}`,
    businessTotalStock: isCorp ? randomInt().toString() : "",
    businessPurpose: `some-purpose-${randomInt()}`,
    provisions: [`some-provision-${randomInt()}`],
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [generateFormationAddress({ signature: true }), generateFormationAddress({ signature: true })],
    members: [generateFormationAddress({})],
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    withdrawals: `some-withdrawals-text-${randomInt()}`,
    dissolution: `some-dissolution-text-${randomInt()}`,
    combinedInvestment: `some-combinedInvestment-text-${randomInt()}`,
    canCreateLimitedPartner: !!(randomInt() % 2),
    createLimitedPartnerTerms: `some-createLimitedPartnerTerms-text-${randomInt()}`,
    canGetDistribution: !!(randomInt() % 2),
    getDistributionTerms: `some-getDistributionTerms-text-${randomInt()}`,
    canMakeDistribution: !!(randomInt() % 2),
    makeDistributionTerms: `some-makeDistributionTerms-text-${randomInt()}`,
    ...overrides,
  } as FormationFormData;
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

export const generateFormationSubmitResponse = (
  overrides: Partial<FormationSubmitResponse>
): FormationSubmitResponse => {
  return {
    success: !!(randomInt() % 2),
    token: `some-token-${randomInt()}`,
    formationId: `some-id-${randomInt()}`,
    redirect: `some-redirect-${randomInt()}`,
    errors: [],
    ...overrides,
  };
};

export const generateFormationAddress = (overrides: Partial<FormationAddress>): FormationAddress => ({
  name: `some-members-name-${randomInt()}`,
  addressLine1: `some-members-address-1-${randomInt()}`,
  addressLine2: `some-members-address-2-${randomInt()}`,
  addressCity: `some-members-address-city-${randomInt()}`,
  addressState: `New Jersey`,
  addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
  signature: false,
  ...overrides,
});

export const randomFormationLegalType = (): FormationLegalType => {
  const randomIndex = Math.floor(Math.random() * FormationLegalTypes.length);
  return FormationLegalTypes[randomIndex] as FormationLegalType;
};

export const randomBusinessSuffix = (legalStructureId?: FormationLegalType): BusinessSuffix => {
  const legalSuffix = legalStructureId ? BusinessSuffixMap[legalStructureId] : undefined;
  const suffixes = legalSuffix ?? AllBusinessSuffixes;
  const randomIndex = Math.floor(Math.random() * suffixes.length);
  return suffixes[randomIndex] as BusinessSuffix;
};

export const generateFeedbackRequest = (overrides: Partial<UserFeedbackRequest>): UserFeedbackRequest => {
  return {
    detail: `some-detail-${randomInt()}`,
    pageOfRequest: `some-page-of-request-${randomInt()}`,
    device: `some-device-${randomInt()}`,
    browser: `some-browser-${randomInt()}`,
    screenWidth: `some-screen-width-${randomInt()}`,
    ...overrides,
  };
};

export const generateIssueRequest = (overrides: Partial<UserIssueRequest>): UserIssueRequest => {
  return {
    context: `some-summary-${randomInt()}`,
    detail: `some-detail-${randomInt()}`,
    pageOfRequest: `some-page-of-request-${randomInt()}`,
    device: `some-device-${randomInt()}`,
    browser: `some-browser-${randomInt()}`,
    screenWidth: `some-screen-width-${randomInt()}`,
    ...overrides,
  };
};
