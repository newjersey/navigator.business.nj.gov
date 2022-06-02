import * as ConfigOriginal from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as ProfileTabDocumentsDakota from "@businessnjgovnavigator/content/fieldConfig/profile-documents-dakota.json";
import * as ProfileTabDocumentsOscar from "@businessnjgovnavigator/content/fieldConfig/profile-documents-oscar.json";
import * as ProfileTabDocumentsPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-documents-poppy.json";
import * as ProfileTabIndustrySpecificDakota from "@businessnjgovnavigator/content/fieldConfig/profile-industries-dakota.json";
import * as ProfileTabIndustrySpecificOscar from "@businessnjgovnavigator/content/fieldConfig/profile-industries-oscar.json";
import * as ProfileTabIndustrySpecificPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-industries-poppy.json";
import * as ProfileTabInfoDakota from "@businessnjgovnavigator/content/fieldConfig/profile-info-dakota.json";
import * as ProfileTabInfoOscar from "@businessnjgovnavigator/content/fieldConfig/profile-info-oscar.json";
import * as ProfileTabInfoPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-info-poppy.json";
import * as ProfileTabNotesDakota from "@businessnjgovnavigator/content/fieldConfig/profile-notes-dakota.json";
import * as ProfileTabNotesOscar from "@businessnjgovnavigator/content/fieldConfig/profile-notes-oscar.json";
import * as ProfileTabNotesPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-notes-poppy.json";
import * as ProfileTabNumbersDakota from "@businessnjgovnavigator/content/fieldConfig/profile-numbers-dakota.json";
import * as ProfileTabNumbersOscar from "@businessnjgovnavigator/content/fieldConfig/profile-numbers-oscar.json";
import * as ProfileTabNumbersPoppy from "@businessnjgovnavigator/content/fieldConfig/profile-numbers-poppy.json";
import * as ProfileOnboardingDakota from "@businessnjgovnavigator/content/fieldConfig/profile-onboarding-dakota.json";
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
      ProfileTabInfoDakota,
      ProfileTabNumbersPoppy,
      ProfileTabNumbersOscar,
      ProfileTabNumbersDakota,
      ProfileTabDocumentsOscar,
      ProfileTabDocumentsPoppy,
      ProfileTabDocumentsDakota,
      ProfileTabNotesOscar,
      ProfileTabNotesPoppy,
      ProfileTabNotesDakota,
      ProfileTabIndustrySpecificPoppy,
      ProfileTabIndustrySpecificOscar,
      ProfileTabIndustrySpecificDakota,
      ProfileOnboardingOscar,
      ProfileOnboardingPoppy,
      ProfileOnboardingDakota
    )
  )
);

export type ConfigType = typeof ConfigOriginal &
  typeof ProfileTabInfoPoppy &
  typeof ProfileTabInfoOscar &
  typeof ProfileTabInfoDakota &
  typeof ProfileTabNumbersPoppy &
  typeof ProfileTabNumbersOscar &
  typeof ProfileTabNumbersDakota &
  typeof ProfileTabDocumentsOscar &
  typeof ProfileTabDocumentsPoppy &
  typeof ProfileTabDocumentsDakota &
  typeof ProfileTabNotesOscar &
  typeof ProfileTabNotesPoppy &
  typeof ProfileTabNotesDakota &
  typeof ProfileTabIndustrySpecificPoppy &
  typeof ProfileTabIndustrySpecificOscar &
  typeof ProfileTabIndustrySpecificDakota &
  typeof ProfileOnboardingOscar &
  typeof ProfileOnboardingPoppy &
  typeof ProfileOnboardingDakota;

export const getMergedConfig = (): ConfigType => {
  return merge(
    ConfigOriginal,
    ProfileTabInfoPoppy,
    ProfileTabInfoOscar,
    ProfileTabInfoDakota,
    ProfileTabNumbersPoppy,
    ProfileTabNumbersOscar,
    ProfileTabNumbersDakota,
    ProfileTabDocumentsOscar,
    ProfileTabDocumentsPoppy,
    ProfileTabDocumentsDakota,
    ProfileTabNotesOscar,
    ProfileTabNotesPoppy,
    ProfileTabNotesDakota,
    ProfileTabIndustrySpecificPoppy,
    ProfileTabIndustrySpecificOscar,
    ProfileTabIndustrySpecificDakota,
    ProfileOnboardingOscar,
    ProfileOnboardingPoppy,
    ProfileOnboardingDakota
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
