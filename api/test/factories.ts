import {
  BusinessUser,
  ExternalStatus,
  NewsletterResponse,
  NewsletterStatus,
  newsletterStatusList,
  UserTestingResponse,
} from "@shared/businessUser";
import { getCurrentDate, getCurrentDateFormatted, getCurrentDateISOString } from "@shared/dateHelpers";
import { FeedbackRequest } from "@shared/feedbackRequest";
import {
  AllBusinessSuffixes,
  BusinessSuffix,
  BusinessSuffixMap,
  corpLegalStructures,
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
import { randomInt } from "@shared/intHelpers";
import { LegalStructure, LegalStructures } from "@shared/legalStructure";
import { LicenseData, LicenseEntity, LicenseStatusItem, LicenseStatusResult } from "@shared/license";
import { NameAndAddress } from "@shared/misc";
import { Municipality } from "@shared/municipality";
import { ProfileData } from "@shared/profileData";
import { arrayOfSectors as sectors, SectorType } from "@shared/sector";
import { TaxFiling, TaxFilingData } from "@shared/taxFiling";
import { Preferences, UserData } from "@shared/userData";
import { SelfRegResponse } from "../src/domain/types";

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
  const formationData = FormationLegalTypes.includes(profileData.legalStructureId as FormationLegalType)
    ? generateFormationData({}, profileData.legalStructureId as FormationLegalType)
    : {
        formationFormData: createEmptyFormationFormData(),
        formationResponse: undefined,
        getFilingResponse: undefined,
      };
  return {
    user: generateUser({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
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

export const generateProfileData = (overrides: Partial<ProfileData>): ProfileData => {
  const id = `some-id-${randomInt()}`;
  return {
    hasExistingBusiness: false,
    initialOnboardingFlow: "STARTING",
    businessName: `some-business-name-${randomInt()}`,
    industryId: randomIndustry().id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    liquorLicense: false,
    requiresCpa: false,
    homeBasedBusiness: false,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(9).toString(),
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
    visibleRoadmapSidebarCards: ["welcome"],
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
  const suffixes = legalSuffix ? legalSuffix : AllBusinessSuffixes;
  const randomIndex = Math.floor(Math.random() * suffixes.length);
  return suffixes[randomIndex] as BusinessSuffix;
};

export const generateFeedbackRequest = (overrides: Partial<FeedbackRequest>): FeedbackRequest => {
  return {
    detail: `some-detail-${randomInt()}`,
    pageOfRequest: `some-page-of-request-${randomInt()}`,
    device: `some-device-${randomInt()}`,
    browser: `some-browser-${randomInt()}`,
    screenWidth: `some-screen-width-${randomInt()}`,
    ...overrides,
  };
};
