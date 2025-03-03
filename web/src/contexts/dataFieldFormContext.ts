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

export type DataFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof TaxClearanceCertificateData;

const allProfileFields = Object.keys(profileFieldsFromConfig) as DataFields[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];
const taxClearanceCertificateFields = Object.keys(
  emptyTaxClearanceCertificateData
) as (keyof TaxClearanceCertificateData)[];

const dataFields: DataFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
    ...taxClearanceCertificateFields,
  ]),
];

export type DataFieldErrorMap = ReducedFieldStates<DataFields>;

export const DataFieldFormContext = createFormContext<DataFieldErrorMap>();

export const createDataFieldErrorMap = <FieldError>(): ReducedFieldStates<DataFields, FieldError> =>
  createReducedFieldStates<(typeof dataFields)[number], FieldError>(dataFields);
