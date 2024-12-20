/* eslint-disable unicorn/no-null */
import { LicenseApplicationIdApiResponse } from "@client/dynamics/license-status/RegulatedBusinessDynamicsLicenseApplicationIdsClient";
import { LicenseApplicationIdResponse } from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import {
  ExternalStatus,
  NewsletterResponse,
  NewsletterStatus,
  newsletterStatusList,
  UserTestingResponse,
} from "@shared/businessUser";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { LicenseChecklistResponse } from "@shared/domain-logic/licenseStatusHelpers";
import {
  castPublicFilingLegalTypeToFormationType,
  FormationData,
  FormationFormData,
  InputFile,
  PublicFilingLegalType,
} from "@shared/formationData";
import { randomInt, randomIntFromInterval } from "@shared/intHelpers";
import { LicenseEntity } from "@shared/license";
import { ProfileData } from "@shared/profileData";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateLicenseStatusItem,
  generateProfileData,
  generateUserData,
  randomPublicFilingLegalType,
} from "@shared/test";
import { UserData } from "@shared/userData";
import {
  getRandomDateInBetween,
  randomElementFromArray,
  RGB_APP_TYPE_KEYS,
  RGB_LICENSE_APPLICATION_INFORMATION,
} from "@test/helpers";
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

  const _userData = generateUserData({});
  const business = generateBusiness(_userData, { formationData: _formationData, profileData: _profileData });

  _userData.businesses[business.id] = business;
  _userData.currentBusinessId = business.id;

  return _userData;
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
export const generateLicenseApplicationIdApiResponseValue = (
  overrides: Partial<LicenseApplicationIdApiResponse>
): LicenseApplicationIdApiResponse => {
  // randApplication randomly selects a real license application structure
  const randApplication = randomElementFromArray(RGB_LICENSE_APPLICATION_INFORMATION);

  return {
    rgb_appnumber: `some-rgb_appnumber-${randomInt()}`,
    rgb_name: `some-rgb_name-${randomInt()}`,
    rgb_number: `some-rgb_number-${randomInt()}1`, // adding 1 at the end to ensure invalid app id
    rgb_startdate: getCurrentDateISOString(),
    rgb_versioncode: 100000000,
    rgb_expirationdate: getCurrentDateISOString(),
    _rgb_apptypeid_value: randApplication.uuid,
    rgb_epsapptypecode: null,
    rgb_publicmoverscode: null,
    statecode: 0,
    statuscode: randomInt(),
    rgb_applicationid: `some-rgb_applicationid-${randomInt()}`,
    [RGB_APP_TYPE_KEYS[randApplication.uuid]]: randApplication.appTypeCode,
    ...overrides,
  };
};

export const generateLicenseStatusChecklistResult = (
  overrides: Partial<LicenseChecklistResponse>
): LicenseChecklistResponse => {
  return {
    licenseStatus: "PENDING",
    professionNameAndLicenseType: `some-professionNameAndLicenseType-${randomInt()}`,
    expirationDateISO: getCurrentDateISOString(),
    checklistItems: [generateLicenseStatusItem({})],
    ...overrides,
  };
};

export const generateLicenseApplicationIdResponseValue = (
  overrides: Partial<LicenseApplicationIdResponse>
): LicenseApplicationIdResponse => {
  return {
    professionNameAndLicenseType: `some-professionNameAndLicenseType-${randomInt()}`,
    expirationDateISO: getCurrentDateISOString(),
    applicationId: `some-applicationId-${randomInt()}`,
    licenseStatus: "ACTIVE",
    ...overrides,
  };
};
