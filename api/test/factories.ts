import {
  BusinessUser,
  ExternalStatus,
  NewsletterResponse,
  NewsletterStatus,
  newsletterStatusList,
  UserTestingResponse,
} from "@shared/businessUser";
import { AllBusinessSuffixes, BusinessSuffix, FormationData, FormationFormData } from "@shared/formationData";
import { Industries, Industry } from "@shared/industry";
import { LegalStructure, LegalStructures } from "@shared/legalStructure";
import { LicenseData, LicenseEntity, LicenseStatusItem, LicenseStatusResult } from "@shared/license";
import { NameAndAddress } from "@shared/misc";
import { Municipality } from "@shared/municipality";
import { ProfileData } from "@shared/profileData";
import { TaxFiling, TaxFilingData } from "@shared/taxFiling";
import { Preferences, UserData } from "@shared/userData";
import dayjs from "dayjs";
import { SelfRegResponse } from "../src/domain/types";

export const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    externalStatus: generateExternalStatus({}),
    receiveNewsletter: true,
    userTesting: true,
    ...overrides,
  };
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  return {
    user: generateUser({}),
    profileData: generateProfileData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: generateLicenseData({}),
    preferences: generatePreferences(),
    taxFilingData: generateTaxFilingData({}),
    formationData: {
      formationResponse: undefined,
      formationFormData: generateFormationFormData({}),
    },
    ...overrides,
  };
};

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
    entityIdStatus: "UNKNOWN",
    filings: [generateTaxFiling({})],
    ...overrides,
  };
};

export const generateTaxFiling = (overrides: Partial<TaxFiling>): TaxFiling => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: dayjs().format("YYYY-MM-DD"),
    ...overrides,
  };
};

export const generateProfileData = (overrides: Partial<ProfileData>): ProfileData => {
  return {
    hasExistingBusiness: false,
    businessName: `some-business-name-${randomInt()}`,
    industryId: randomIndustry().id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(9).toString(),
    notes: `some-notes-${randomInt()}`,
    certificationIds: [],
    existingEmployees: randomInt(7).toString(),
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
    lastCheckedStatus: dayjs().toISOString(),
    ...overrides,
  };
};

export const generatePreferences = (): Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
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

export const generateFormationData = (overrides: Partial<FormationData>): FormationData => {
  return {
    formationFormData: generateFormationFormData({}),
    formationResponse: undefined,
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

export const generateFormationFormData = (overrides: Partial<FormationFormData>): FormationFormData => {
  return {
    businessSuffix: randomBusinessSuffix(),
    businessStartDate: dayjs().add(1, "days").format("YYYY-MM-DD"),
    businessAddressLine1: `some-address-1-${randomInt()}`,
    businessAddressLine2: `some-address-2-${randomInt()}`,
    businessAddressState: "NJ",
    businessAddressZipCode: `some-zipcode-${randomInt()}`,
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    signer: `some-signer-${randomInt()}`,
    additionalSigners: [`some-additional-signer-${randomInt()}`],
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

export const randomBusinessSuffix = (): BusinessSuffix => {
  const randomIndex = Math.floor(Math.random() * AllBusinessSuffixes.length);
  return AllBusinessSuffixes[randomIndex] as BusinessSuffix;
};
