import { createFormContext, createReducedFieldStates, ReducedFieldStates } from "@/contexts/formContext";
import { profileFieldsFromConfig } from "@/lib/types/types";
import {
  BusinessUser,
  emptyBusinessUser,
  emptyFormationAddressData,
  emptyProfileData,
  FormationAddress,
  IndustrySpecificData,
  ProfileData,
} from "@businessnjgovnavigator/shared";

export type ProfileFields = keyof ProfileData | keyof BusinessUser | keyof FormationAddress;

const allProfileFields = Object.keys(profileFieldsFromConfig) as ProfileFields[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];

export const profileFields: ProfileFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
  ]),
];

export type ProfileFieldErrorMap = ReducedFieldStates<ProfileFields>;

export const ProfileFormContext = createFormContext<ProfileFieldErrorMap>();

export const createProfileFieldErrorMap = <FieldError>(): ReducedFieldStates<ProfileFields, FieldError> =>
  createReducedFieldStates<(typeof profileFields)[number], FieldError>(profileFields);

export type ProfileContentField = Exclude<
  (keyof ProfileData | keyof IndustrySpecificData) & keyof typeof profileFieldsFromConfig,
  "businessPersona"
>;
