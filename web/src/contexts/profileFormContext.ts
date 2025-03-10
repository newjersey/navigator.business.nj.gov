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

export type ProfileFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof TaxClearanceCertificateData;

const allProfileFields = Object.keys(profileFieldsFromConfig) as ProfileFields[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];
const taxClearanceCertificateFields = Object.keys(
  emptyTaxClearanceCertificateData
) as (keyof TaxClearanceCertificateData)[];

const profileFields: ProfileFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
    ...taxClearanceCertificateFields,
  ]),
];

export type ProfileFieldErrorMap = ReducedFieldStates<ProfileFields>;

export const ProfileFormContext = createFormContext<ProfileFieldErrorMap>();

export const createProfileFieldErrorMap = <FieldError>(): ReducedFieldStates<ProfileFields, FieldError> =>
  createReducedFieldStates<(typeof profileFields)[number], FieldError>(profileFields);
