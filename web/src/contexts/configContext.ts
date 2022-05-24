import * as ConfigOriginal from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as ProfileTabDocumentsOscar from "@businessnjgovnavigator/content/fieldConfig/profile-documents-oscar.json";
import * as ProfileTabDocumentsPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-documents-poppy.json";
import * as ProfileTabIndustrySpecificOscar from "@businessnjgovnavigator/content/fieldConfig/profile-industries-oscar.json";
import * as ProfileTabIndustrySpecificPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-industries-poppy.json";
import * as ProfileTabInfoOscar from "@businessnjgovnavigator/content/fieldConfig/profile-info-oscar.json";
import * as ProfileTabInfoPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-info-poppy.json";
import * as ProfileTabNotesOscar from "@businessnjgovnavigator/content/fieldConfig/profile-notes-oscar.json";
import * as ProfileTabNotesPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-notes-poppy.json";
import * as ProfileTabNumbersOscar from "@businessnjgovnavigator/content/fieldConfig/profile-numbers-oscar.json";
import * as ProfileTabNumbersPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-numbers-poppy.json";
import * as ProfileOnboardingOscar from "@businessnjgovnavigator/content/fieldConfig/profile-onboarding-oscar.json";
import * as ProfileOnboardingPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-onboarding-poppy.json";
import merge from "lodash.merge";
import { createContext } from "react";

const merged = JSON.parse(
  JSON.stringify(
    merge(
      ConfigOriginal,
      ProfileTabInfoPoppy,
      ProfileTabInfoOscar,
      ProfileTabNumbersPoppy,
      ProfileTabNumbersOscar,
      ProfileTabDocumentsOscar,
      ProfileTabDocumentsPoppy,
      ProfileTabNotesOscar,
      ProfileTabNotesPoppy,
      ProfileTabIndustrySpecificPoppy,
      ProfileTabIndustrySpecificOscar,
      ProfileOnboardingOscar,
      ProfileOnboardingPoppy
    )
  )
);

export type ConfigType = typeof ConfigOriginal &
  typeof ProfileTabInfoPoppy &
  typeof ProfileTabInfoOscar &
  typeof ProfileTabNumbersPoppy &
  typeof ProfileTabNumbersOscar &
  typeof ProfileTabDocumentsOscar &
  typeof ProfileTabDocumentsPoppy &
  typeof ProfileTabNotesOscar &
  typeof ProfileTabNotesPoppy &
  typeof ProfileTabIndustrySpecificPoppy &
  typeof ProfileTabIndustrySpecificOscar &
  typeof ProfileOnboardingOscar &
  typeof ProfileOnboardingPoppy;

export const getMergedConfig = (): ConfigType => {
  return merge(
    ConfigOriginal,
    ProfileTabInfoPoppy,
    ProfileTabInfoOscar,
    ProfileTabNumbersPoppy,
    ProfileTabNumbersOscar,
    ProfileTabDocumentsOscar,
    ProfileTabDocumentsPoppy,
    ProfileTabNotesOscar,
    ProfileTabNotesPoppy,
    ProfileTabIndustrySpecificPoppy,
    ProfileTabIndustrySpecificOscar,
    ProfileOnboardingOscar,
    ProfileOnboardingPoppy
  );
};

export interface ConfigContextType {
  config: ConfigType;
  setOverrides: (config: ConfigType) => void;
}

export const ConfigContext = createContext<ConfigContextType>({
  config: merged,
  setOverrides: () => {},
});
