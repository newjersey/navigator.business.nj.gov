import * as AccountSetup from "@businessnjgovnavigator/content/fieldConfig/account-setup-page.json";
import * as anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults from "@businessnjgovnavigator/content/fieldConfig/anytime-action-reinstatement-and-license-calendar-event-status-defaults.json";
import * as BusinessFormation from "@businessnjgovnavigator/content/fieldConfig/business-formation.json";
import * as BusinessStructurePrompt from "@businessnjgovnavigator/content/fieldConfig/business-structure-prompt.json";
import * as BusinessStructureTask from "@businessnjgovnavigator/content/fieldConfig/business-structure-task.json";
import * as CalloutDefaults from "@businessnjgovnavigator/content/fieldConfig/callout-defaults.json";
import * as CannabisLicenseAnnualTab2 from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-annual-tab2.json";
import * as CannabisLicenseConditionalTab2 from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-conditional-tab2.json";
import * as CannabisLicenseEligibilityModal from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-eligibility-modal.json";
import * as CannabisLicenseTab1 from "@businessnjgovnavigator/content/fieldConfig/cannabis-license-tab1.json";
import * as CannabisPriorityStatusTab1 from "@businessnjgovnavigator/content/fieldConfig/cannabis-priority-status-tab1.json";
import * as CannabisPriorityStatusTab2 from "@businessnjgovnavigator/content/fieldConfig/cannabis-priority-status-tab2.json";
import * as CheckAccountEmailPage from "@businessnjgovnavigator/content/fieldConfig/check-account-email-page.json";
import * as ConfigOriginal from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as DashboardCalendar from "@businessnjgovnavigator/content/fieldConfig/dashboard-calendar.json";
import * as DashboardDefaults from "@businessnjgovnavigator/content/fieldConfig/dashboard-defaults.json";
import * as DashboardModals from "@businessnjgovnavigator/content/fieldConfig/dashboard-modals.json";
import * as DashboardSnackbars from "@businessnjgovnavigator/content/fieldConfig/dashboard-snackbars.json";
import * as DashboardTabs from "@businessnjgovnavigator/content/fieldConfig/dashboard-tabs.json";
import * as DeferredLocation from "@businessnjgovnavigator/content/fieldConfig/deferred-location.json";
import * as Ein from "@businessnjgovnavigator/content/fieldConfig/ein.json";
import * as ElevatorRegistration from "@businessnjgovnavigator/content/fieldConfig/elevator-registration.json";
import * as EnvQuestionnaire from "@businessnjgovnavigator/content/fieldConfig/env-questionnaire.json";
import * as FormationInterimSuccessPage from "@businessnjgovnavigator/content/fieldConfig/formation-interim-success-page.json";
import * as FormationSuccessPage from "@businessnjgovnavigator/content/fieldConfig/formation-success-page.json";
import * as SiteWideErrorMessages from "@businessnjgovnavigator/content/fieldConfig/global-errors-defaults.json";
import * as HousingRegistrationSearchTask from "@businessnjgovnavigator/content/fieldConfig/housing-registration.json";
import * as NaicsCode from "@businessnjgovnavigator/content/fieldConfig/naics-code.json";
import * as NavigationDefaults from "@businessnjgovnavigator/content/fieldConfig/navigation-defaults.json";
import * as NexusDbaFormation from "@businessnjgovnavigator/content/fieldConfig/nexus-dba-formation.json";
import * as NexusNameSearch from "@businessnjgovnavigator/content/fieldConfig/nexus-name-search.json";
import * as PageNotFoundError from "@businessnjgovnavigator/content/fieldConfig/page-not-found-error.json";
import * as Profile from "@businessnjgovnavigator/content/fieldConfig/profile.json";
import * as StarterKits from "@businessnjgovnavigator/content/fieldConfig/starter-kits.json";
import * as TaxAccess from "@businessnjgovnavigator/content/fieldConfig/tax-access-modal.json";
import * as Tax from "@businessnjgovnavigator/content/fieldConfig/tax.json";
import * as CalloutAlerts from "@businessnjgovnavigator/content/mappings/callout-alerts.json";
import * as PageMetadata from "@businessnjgovnavigator/content/page-metadata/page-metadata.json";

import { merge } from "lodash";
import { createContext } from "react";

const merged = JSON.parse(
  JSON.stringify(
    merge(
      ConfigOriginal,
      Profile,
      CannabisPriorityStatusTab1,
      CannabisPriorityStatusTab2,
      CannabisLicenseTab1,
      CannabisLicenseAnnualTab2,
      CannabisLicenseConditionalTab2,
      NexusNameSearch,
      NexusDbaFormation,
      NaicsCode,
      Ein,
      Tax,
      CannabisLicenseEligibilityModal,
      FormationInterimSuccessPage,
      FormationSuccessPage,
      PageNotFoundError,
      SiteWideErrorMessages,
      DeferredLocation,
      DashboardSnackbars,
      DashboardCalendar,
      DashboardTabs,
      DashboardModals,
      BusinessFormation,
      TaxAccess,
      BusinessStructureTask,
      BusinessStructurePrompt,
      AccountSetup,
      NavigationDefaults,
      PageMetadata,
      NavigationDefaults,
      DashboardDefaults,
      PageMetadata,
      CalloutDefaults,
      ElevatorRegistration,
      StarterKits,
      HousingRegistrationSearchTask,
      anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults,
      CalloutAlerts,
      EnvQuestionnaire,
      CheckAccountEmailPage
    )
  )
);

export type ConfigType = typeof ConfigOriginal &
  typeof Profile &
  typeof CannabisPriorityStatusTab1 &
  typeof CannabisPriorityStatusTab2 &
  typeof CannabisLicenseTab1 &
  typeof CannabisLicenseAnnualTab2 &
  typeof CannabisLicenseConditionalTab2 &
  typeof NexusNameSearch &
  typeof NexusDbaFormation &
  typeof NaicsCode &
  typeof Ein &
  typeof Tax &
  typeof CannabisLicenseEligibilityModal &
  typeof FormationInterimSuccessPage &
  typeof FormationSuccessPage &
  typeof PageNotFoundError &
  typeof SiteWideErrorMessages &
  typeof DeferredLocation &
  typeof DashboardCalendar &
  typeof DashboardModals &
  typeof DashboardTabs &
  typeof BusinessFormation &
  typeof BusinessStructureTask &
  typeof TaxAccess &
  typeof DashboardSnackbars &
  typeof BusinessStructurePrompt &
  typeof AccountSetup &
  typeof NavigationDefaults &
  typeof PageMetadata &
  typeof CalloutDefaults &
  typeof ElevatorRegistration &
  typeof CalloutDefaults &
  typeof DashboardDefaults &
  typeof PageMetadata &
  typeof StarterKits &
  typeof HousingRegistrationSearchTask &
  typeof anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults &
  typeof CalloutAlerts &
  typeof CheckAccountEmailPage &
  typeof EnvQuestionnaire;

export const getMergedConfig = (): ConfigType => {
  return merge(
    ConfigOriginal,
    Profile,
    CannabisPriorityStatusTab1,
    CannabisPriorityStatusTab2,
    CannabisLicenseTab1,
    CannabisLicenseAnnualTab2,
    CannabisLicenseConditionalTab2,
    NexusNameSearch,
    NexusDbaFormation,
    NaicsCode,
    Ein,
    Tax,
    CannabisLicenseEligibilityModal,
    FormationInterimSuccessPage,
    FormationSuccessPage,
    PageNotFoundError,
    DeferredLocation,
    DashboardSnackbars,
    DashboardModals,
    DashboardTabs,
    DashboardCalendar,
    BusinessFormation,
    TaxAccess,
    AccountSetup,
    BusinessStructureTask,
    NavigationDefaults,
    PageMetadata,
    DashboardDefaults,
    PageMetadata,
    CalloutDefaults,
    ElevatorRegistration,
    StarterKits,
    HousingRegistrationSearchTask,
    anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults,
    CalloutAlerts,
    EnvQuestionnaire,
    CheckAccountEmailPage
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
