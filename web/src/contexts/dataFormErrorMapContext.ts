import {
  type BusinessUser,
  type EmergencyTripPermitApplicationInfo,
  emptyBusinessUser,
  emptyFormationAddressData,
  emptyProfileData,
  emptyRoadmapTaskData,
  emptyTaxClearanceCertificateData,
  type FormationAddress,
  generateNewEmergencyTripPermitData,
  type ProfileData,
  type RoadmapTaskData,
  type TaxClearanceCertificateData,
} from "@businessnjgovnavigator/shared";
import {
  type CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import {
  profileFieldsFromConfig,
  type ReducedFieldStates,
} from "@businessnjgovnavigator/shared/types";
import { createFormContext, createReducedFieldStates } from "@/contexts/formContext";

export type DataFormErrorMapFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof TaxClearanceCertificateData
  | keyof RoadmapTaskData
  | keyof EmergencyTripPermitApplicationInfo
  | keyof CigaretteLicenseData;

const allProfileFields = Object.keys(profileFieldsFromConfig) as (keyof ProfileData)[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];
const roadmapTaskDataFields = Object.keys(emptyRoadmapTaskData) as (keyof RoadmapTaskData)[];
const taxClearanceCertificateFields = Object.keys(
  emptyTaxClearanceCertificateData,
) as (keyof TaxClearanceCertificateData)[];
const emergencyTripPermitFields = Object.keys(
  generateNewEmergencyTripPermitData(),
) as (keyof EmergencyTripPermitApplicationInfo)[];
const cigaretteLicenseFields = Object.keys(
  emptyCigaretteLicenseData,
) as (keyof CigaretteLicenseData)[];

const dataFormErrorMapFields: DataFormErrorMapFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
    ...taxClearanceCertificateFields,
    ...roadmapTaskDataFields,
    ...emergencyTripPermitFields,
    ...cigaretteLicenseFields,
  ]),
];

export type DataFormErrorMap = ReducedFieldStates<DataFormErrorMapFields>;

export const DataFormErrorMapContext = createFormContext<DataFormErrorMap>();

export const createDataFormErrorMap = <FieldError>(): ReducedFieldStates<
  DataFormErrorMapFields,
  FieldError
> =>
  createReducedFieldStates<(typeof dataFormErrorMapFields)[number], FieldError>(
    dataFormErrorMapFields,
  );

export const pickData = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};
