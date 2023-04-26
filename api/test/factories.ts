import {
  BusinessUser,
  ExternalStatus,
  NewsletterResponse,
  NewsletterStatus,
  newsletterStatusList,
  UserTestingResponse,
} from "@shared/businessUser";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { UserFeedbackRequest, UserIssueRequest } from "@shared/feedbackRequest";
import {
  castPublicFilingLegalTypeToFormationType,
  createEmptyFormationFormData,
  FormationData,
  FormationFormData,
  FormationLegalType,
  InputFile,
  PublicFilingLegalType,
  publicFilingLegalTypes,
} from "@shared/formationData";
import { Industries, Industry } from "@shared/industry";
import { randomInt, randomIntFromInterval } from "@shared/intHelpers";
import { LegalStructure, LegalStructures } from "@shared/legalStructure";
import { LicenseData, LicenseEntity } from "@shared/license";
import { IndustrySpecificData, ProfileData } from "@shared/profileData";
import { TaxFilingData } from "@shared/taxFiling";
import {
  generateFormationData,
  generateFormationFormData,
  generateLicenseStatusItem,
  generateMunicipality,
  generateNameAndAddress,
  generatePreferences,
  generateTaxFiling,
  randomPublicFilingLegalType,
  randomSector,
} from "@shared/test";
import { CURRENT_VERSION, UserData } from "@shared/userData";
import { SelfRegResponse, TaxFilingResult } from "src/domain/types";
import { getRandomDateInBetween, randomElementFromArray } from "./helpers";

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

export const generateTaxFilingDates = (numberOfDates: number): string[] => {
  const dateToShortISO = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };
  const date = new Date(Date.now());
  const futureDate = new Date(Date.now());
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  return [...Array.from({ length: numberOfDates }).keys()].map(() => {
    return getRandomDateInBetween(dateToShortISO(date), dateToShortISO(futureDate)).toLocaleDateString();
  });
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
  const _profileData = generateProfileData({
    legalStructureId: randomPublicFilingLegalType(),
    ...profileData,
  });
  const legalStructureId = castPublicFilingLegalTypeToFormationType(
    _profileData.legalStructureId as PublicFilingLegalType,
    _profileData.businessPersona
  );
  const _formationData = generateFormationData(
    {
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId,
      }),
      ...formationData,
    },
    legalStructureId
  );
  return generateUserData({ formationData: _formationData, profileData: _profileData });
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  const profileData = overrides.profileData ?? generateProfileData({});
  const formationData: FormationData = publicFilingLegalTypes.includes(
    profileData.legalStructureId as PublicFilingLegalType
  )
    ? generateFormationData({}, profileData.legalStructureId as FormationLegalType)
    : {
        formationFormData: createEmptyFormationFormData(),
        businessNameAvailability: undefined,
        formationResponse: undefined,
        getFilingResponse: undefined,
        completedFilingPayment: false,
        lastVisitedPageIndex: 0,
      };

  return {
    version: CURRENT_VERSION,
    versionWhenCreated: -1,
    dateCreatedISO: undefined,
    lastUpdatedISO: getCurrentDateISOString(),
    user: generateUser({}),
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
    filings: [generateTaxFiling({})],
    ...overrides,
  };
};

export const generateInputFile = (overrides: Partial<InputFile>): InputFile => {
  return {
    base64Contents: `some-base-64-contents-${randomInt()}`,
    fileType: randomElementFromArray(["PNG", "PDF"]),
    sizeInBytes: randomInt(),
    filename: `some-filename-${randomInt()}`,
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
    interstateLogistics: false,
    interstateMoving: false,
    isChildcareForSixOrMore: undefined,
    willSellPetCareItems: undefined,
    petCareHousing: undefined,
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
    responsibleOwnerName: `some-responsible-owner-name-${randomInt()}`,
    industryId: industry.id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    encryptedTaxId: "some-encrypted-value",
    taxId: randomInt() % 2 ? `*****${randomInt(4).toString()}` : `*******${randomInt(5).toString()}`,
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
    nexusDbaName: "",
    needsNexusDbaName: false,
    nexusLocationInNewJersey: undefined,
    operatingPhase: "NEEDS_TO_FORM",
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
    lastUpdatedISO: getCurrentDateISOString(),
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

export const randomIndustry = (): Industry => {
  const randomIndex = Math.floor(Math.random() * Industries.length);
  return Industries[randomIndex];
};

export const randomNewsletterStatus = (failed = !!(randomInt() % 2)): NewsletterStatus => {
  const status = failed
    ? newsletterStatusList.filter((i) => {
        return i.includes("ERROR");
      })
    : newsletterStatusList.filter((i) => {
        return !i.includes("ERROR");
      });
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
