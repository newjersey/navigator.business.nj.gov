import {
  ExternalStatus,
  NewsletterResponse,
  NewsletterStatus,
  newsletterStatusList,
  UserTestingResponse,
} from "@shared/businessUser";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import {
  castPublicFilingLegalTypeToFormationType,
  FormationData,
  FormationFormData,
  InputFile,
  PublicFilingLegalType,
} from "@shared/formationData";
import { randomInt, randomIntFromInterval } from "@shared/intHelpers";
import { LicenseData, LicenseEntity } from "@shared/license";
import { ProfileData } from "@shared/profileData";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateLicenseSearchNameAndAddress,
  generateLicenseStatusItem,
  generateProfileData,
  generateUserDataForBusiness,
  randomPublicFilingLegalType,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { getRandomDateInBetween, randomElementFromArray } from "@test/helpers";
import { SelfRegResponse, TaxFilingResult } from "src/domain/types";

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
  return generateUserDataForBusiness(
    generateBusiness({ formationData: _formationData, profileData: _profileData })
  );
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
    nameAndAddress: generateLicenseSearchNameAndAddress({}),
    completedSearch: true,
    items: [generateLicenseStatusItem({})],
    status: randomElementFromArray(["PENDING", "ACTIVE", "EXPIRED"]),
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
