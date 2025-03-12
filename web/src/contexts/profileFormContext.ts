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
import {
  EmergencyTripPermitApplicationInfo,
  generateEmptyEmergencyTripPermitData,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";

export type ProfileFields =
  | keyof ProfileData
  | keyof BusinessUser
  | keyof FormationAddress
  | keyof EmergencyTripPermitApplicationInfo;

const allProfileFields = Object.keys(profileFieldsFromConfig) as ProfileFields[];
const businessUserDisplayFields = Object.keys(emptyBusinessUser) as (keyof BusinessUser)[];
const onboardingDataFields = Object.keys(emptyProfileData) as (keyof ProfileData)[];
const formationAddressFields = Object.keys(emptyFormationAddressData) as (keyof FormationAddress)[];
const emergencyTripPermitFields = Object.keys(
  generateEmptyEmergencyTripPermitData()
) as (keyof EmergencyTripPermitApplicationInfo)[];

export const profileFields: ProfileFields[] = [
  ...new Set([
    ...allProfileFields,
    ...onboardingDataFields,
    ...businessUserDisplayFields,
    ...formationAddressFields,
    ...emergencyTripPermitFields,
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
