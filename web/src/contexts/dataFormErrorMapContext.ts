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

export type DataFormFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof TaxClearanceCertificateData;

const allProfileFields = Object.keys(profileFieldsFromConfig) as (keyof ProfileData)[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];
const taxClearanceCertificateFields = Object.keys(
  emptyTaxClearanceCertificateData
) as (keyof TaxClearanceCertificateData)[];

const dataFormFields: DataFormFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
    ...taxClearanceCertificateFields,
  ]),
];

export type DataFormErrorMap = ReducedFieldStates<DataFormFields>;

export const DataFormErrorMapContext = createFormContext<DataFormErrorMap>();

export const createDataFormErrorMap = <FieldError>(): ReducedFieldStates<DataFormFields, FieldError> =>
  createReducedFieldStates<(typeof dataFormFields)[number], FieldError>(dataFormFields);
