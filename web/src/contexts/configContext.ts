import * as CannabisLicenseAnnualTab2 from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-annual-tab2.json";
import * as CannabisLicenseConditionalTab2 from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-conditional-tab2.json";
import * as CannabisLicenseTab1 from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-tab1.json";
import * as CannabisPriorityStatusTab1 from "@businessnjgovnavigator/content/fieldConfig/cannabis-priority-status-tab1.json";
import * as CannabisPriorityStatusTab2 from "@businessnjgovnavigator/content/fieldConfig/cannabis-priority-status-tab2.json";
import * as ConfigOriginal from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as NaicsCode from "@businessnjgovnavigator/content/fieldConfig/naics-code.json";
import * as NexusDbaFormation from "@businessnjgovnavigator/content/fieldConfig/nexus-dba-formation.json";
import * as NexusNameSearch from "@businessnjgovnavigator/content/fieldConfig/nexus-name-search.json";
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

import { merge } from "lodash";
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
      ProfileOnboardingDakota,
      CannabisPriorityStatusTab1,
      CannabisPriorityStatusTab2,
      CannabisLicenseTab1,
      CannabisLicenseAnnualTab2,
      CannabisLicenseConditionalTab2,
      NexusNameSearch,
      NexusDbaFormation,
      NaicsCode
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
  typeof ProfileOnboardingDakota &
  typeof CannabisPriorityStatusTab1 &
  typeof CannabisPriorityStatusTab2 &
  typeof CannabisLicenseTab1 &
  typeof CannabisLicenseAnnualTab2 &
  typeof CannabisLicenseConditionalTab2 &
  typeof NexusNameSearch &
  typeof NexusDbaFormation &
  typeof NaicsCode;

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
    ProfileOnboardingDakota,
    CannabisPriorityStatusTab1,
    CannabisPriorityStatusTab2,
    CannabisLicenseTab1,
    CannabisLicenseAnnualTab2,
    CannabisLicenseConditionalTab2,
    NexusNameSearch,
    NexusDbaFormation,
    NaicsCode
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
