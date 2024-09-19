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
import * as ConfigOriginal from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as DashboardCalendar from "@businessnjgovnavigator/content/fieldConfig/dashboard-calendar.json";
import * as DashboardDefaults from "@businessnjgovnavigator/content/fieldConfig/dashboard-defaults.json";
import * as DashboardModals from "@businessnjgovnavigator/content/fieldConfig/dashboard-modals.json";
import * as DashboardSnackbars from "@businessnjgovnavigator/content/fieldConfig/dashboard-snackbars.json";
import * as DashboardTabs from "@businessnjgovnavigator/content/fieldConfig/dashboard-tabs.json";
import * as DeferredLocation from "@businessnjgovnavigator/content/fieldConfig/deferred-location.json";
import * as Ein from "@businessnjgovnavigator/content/fieldConfig/ein.json";
import * as ElevatorRegistration from "@businessnjgovnavigator/content/fieldConfig/elevator-registration.json";
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
import * as RaffleBingoStep1 from "@businessnjgovnavigator/content/fieldConfig/raffle-bingo-step1.json";
import * as RaffleBingoStep2 from "@businessnjgovnavigator/content/fieldConfig/raffle-bingo-step2.json";
import * as StarterKits from "@businessnjgovnavigator/content/fieldConfig/starter-kits.json";
import * as TaxAccess from "@businessnjgovnavigator/content/fieldConfig/tax-access-modal.json";
import * as Tax from "@businessnjgovnavigator/content/fieldConfig/tax.json";
import * as PageMetadata from "@businessnjgovnavigator/content/page-metadata/page-metadata.json";

import { merge } from "lodash";
import { createContext } from "react";

const merged = JSON.parse(
  JSON.stringify(
    merge(
      AccountSetup,
      anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults,
      BusinessFormation,
      BusinessStructurePrompt,
      BusinessStructureTask,
      CalloutDefaults,
      CannabisLicenseAnnualTab2,
      CannabisLicenseConditionalTab2,
      CannabisLicenseEligibilityModal,
      CannabisLicenseTab1,
      CannabisPriorityStatusTab1,
      CannabisPriorityStatusTab2,
      ConfigOriginal,
      DashboardCalendar,
      DashboardDefaults,
      DashboardModals,
      DashboardSnackbars,
      DashboardTabs,
      DeferredLocation,
      Ein,
      ElevatorRegistration,
      FormationInterimSuccessPage,
      FormationSuccessPage,
      HousingRegistrationSearchTask,
      NaicsCode,
      NavigationDefaults,
      NavigationDefaults,
      NexusDbaFormation,
      NexusNameSearch,
      PageMetadata,
      PageMetadata,
      PageNotFoundError,
      Profile,
      RaffleBingoStep1,
      RaffleBingoStep2,
      SiteWideErrorMessages,
      StarterKits,
      HousingRegistrationSearchTask,
      anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults
    )
  )
);

export type ConfigType = typeof ConfigOriginal &
  typeof AccountSetup &
  typeof anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults &
  typeof BusinessFormation &
  typeof BusinessStructurePrompt &
  typeof BusinessStructureTask &
  typeof CalloutDefaults &
  typeof CalloutDefaults &
  typeof CannabisLicenseAnnualTab2 &
  typeof CannabisLicenseConditionalTab2 &
  typeof CannabisLicenseEligibilityModal &
  typeof CannabisLicenseTab1 &
  typeof CannabisPriorityStatusTab1 &
  typeof CannabisPriorityStatusTab2 &
  typeof DashboardCalendar &
  typeof DashboardDefaults &
  typeof DashboardModals &
  typeof DashboardSnackbars &
  typeof DashboardTabs &
  typeof DeferredLocation &
  typeof Ein &
  typeof ElevatorRegistration &
  typeof FormationInterimSuccessPage &
  typeof FormationSuccessPage &
  typeof HousingRegistrationSearchTask &
  typeof NaicsCode &
  typeof NavigationDefaults &
  typeof NexusDbaFormation &
  typeof NexusNameSearch &
  typeof PageMetadata &
  typeof PageMetadata &
  typeof PageNotFoundError &
  typeof Profile &
  typeof RaffleBingoStep1 &
  typeof RaffleBingoStep2 &
  typeof SiteWideErrorMessages &
  typeof StarterKits &
  typeof Tax &
  typeof TaxAccess &
  typeof HousingRegistrationSearchTask &
  typeof anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults;

export const getMergedConfig = (): ConfigType => {
  return merge(
    AccountSetup,
    anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults,
    BusinessFormation,
    BusinessStructureTask,
    CalloutDefaults,
    CannabisLicenseAnnualTab2,
    CannabisLicenseConditionalTab2,
    CannabisLicenseEligibilityModal,
    CannabisLicenseTab1,
    CannabisPriorityStatusTab1,
    CannabisPriorityStatusTab2,
    ConfigOriginal,
    DashboardCalendar,
    DashboardDefaults,
    DashboardModals,
    DashboardSnackbars,
    DashboardTabs,
    DeferredLocation,
    Ein,
    ElevatorRegistration,
    FormationInterimSuccessPage,
    FormationSuccessPage,
    HousingRegistrationSearchTask,
    NaicsCode,
    NavigationDefaults,
    NexusDbaFormation,
    NexusNameSearch,
    PageMetadata,
    PageMetadata,
    PageNotFoundError,
    Profile,
    RaffleBingoStep1,
    RaffleBingoStep2,
    StarterKits,
    HousingRegistrationSearchTask,
    anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults
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
