import { createFormContext, createReducedFieldStates } from "@/contexts/formContext";
import { profileFieldsFromConfig, ReducedFieldStates } from "@/lib/types/types";
import {
  BusinessUser,
  EmergencyTripPermitApplicationInfo,
  emptyBusinessUser,
  emptyFormationAddressData,
  emptyProfileData,
  emptyRoadmapTaskData,
  emptyTaxClearanceCertificateData,
  FormationAddress,
  generateNewEmergencyTripPermitData,
  ProfileData,
  RoadmapTaskData,
  TaxClearanceCertificateData,
} from "@businessnjgovnavigator/shared";

export type DataFormErrorMapFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof TaxClearanceCertificateData
  | keyof RoadmapTaskData
  | keyof EmergencyTripPermitApplicationInfo;

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

const dataFormErrorMapFields: DataFormErrorMapFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
    ...taxClearanceCertificateFields,
    ...roadmapTaskDataFields,
    ...emergencyTripPermitFields,
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
