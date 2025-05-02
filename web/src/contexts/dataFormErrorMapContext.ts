import { createFormContext, createReducedFieldStates } from "@/contexts/formContext";
import { profileFieldsFromConfig, ReducedFieldStates } from "@/lib/types/types";
import {
  BusinessUser,
  emptyBusinessUser,
  emptyFormationAddressData,
  emptyProfileData,
  emptyTaxClearanceCertificateData,
  FormationAddress,
  ProfileData,
  TaxClearanceCertificateData,
} from "@businessnjgovnavigator/shared";
import {
  EmergencyTripPermitApplicationInfo,
  generateNewEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";

export type DataFormErrorMapFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof TaxClearanceCertificateData
  | keyof EmergencyTripPermitApplicationInfo;

const allProfileFields = Object.keys(profileFieldsFromConfig) as (keyof ProfileData)[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];
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
