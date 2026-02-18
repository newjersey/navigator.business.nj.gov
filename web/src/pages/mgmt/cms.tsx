import CannabisLocationAlert from "@/lib/cms/editors/cannabisLocationAlert";
import ContextEditor from "@/lib/cms/editors/context-info";
import IconWidgetEditor from "@/lib/cms/editors/icon";
import AlertEditor from "@/lib/cms/editors/infoAlert";
import { default as LargeCallout } from "@/lib/cms/editors/large-callout";
import { default as MiniCallout } from "@/lib/cms/editors/mini-callout";
import Note from "@/lib/cms/editors/note";
import { NoSpaceControl } from "@/lib/cms/fields/nospacefield";
import { WriteOnceReadOnlyNoSpaceControl } from "@/lib/cms/fields/writeoncereadonlynospacefield";
import { applyTheme } from "@/lib/cms/helpers/applyTheme";
import CannabisEligibilityModalPreview from "@/lib/cms/previews/CannabisEligibilityModalPreview";
import CannabisLicensePreview from "@/lib/cms/previews/CannabisLicensePreview";
import CannabisPriorityStatusPreview from "@/lib/cms/previews/CannabisPriorityStatusPreview";
import CertificationsPreview from "@/lib/cms/previews/CertificationsPreview";
import ContextInfoPreview from "@/lib/cms/previews/ContextInfoPreview";
import DashboardCalendarPreview from "@/lib/cms/previews/DashboardCalendarPreview";
import DashboardModalsPreview from "@/lib/cms/previews/DashboardModalsPreview";
import DashboardSnackbarsPreview from "@/lib/cms/previews/DashboardSnackbarsPreview";
import DashboardTabsPreview from "@/lib/cms/previews/DashboardTabsPreview";
import DeferredLocationPreview from "@/lib/cms/previews/DeferredLocationPreview";
import EinInputPreview from "@/lib/cms/previews/EinInputPreview";
import FilingsPreview from "@/lib/cms/previews/FilingsPreview";
import LicenseCalendarEventPreview from "@/lib/cms/previews/LicenseCalendarEventPreview";
import PageMetaDataPreview from "@/lib/cms/previews/PageMetadataPreview";

import AccountSetupPreview from "@/lib/cms/previews/AccountSetupPreview";
import AnytimeActionLicenseReinstatementPreview from "@/lib/cms/previews/AnytimeActionLicenseReinstatementPreview";
import AnytimeActionTaskPreview from "@/lib/cms/previews/AnytimeActionTaskPreview";
import AnytimeActionTaxClearancePreview from "@/lib/cms/previews/AnytimeActionTaxClearancePreview";
import BusinessStructurePreview from "@/lib/cms/previews/BusinessStructurePreview";
import CigaretteLicenseConfirmationPreview from "@/lib/cms/previews/CigaretteLicenseConfirmationPreview";
import CigaretteLicensePreview from "@/lib/cms/previews/CigaretteLicensePreview";
import LoginEmailCheckPreview from "@/lib/cms/previews/EmailLoginCheckPreview";
import EmergencyTripPermitPreview from "@/lib/cms/previews/EmergencyTripPermitPreview";
import EmployerRatesPreview from "@/lib/cms/previews/EmployerRatesPreview";
import FormationDateDeletionModalPreview from "@/lib/cms/previews/FormationDateDeletionModalPreview";
import FormationInterimSuccessPreview from "@/lib/cms/previews/FormationInterimSuccessPreview";
import FormationSuccessPreview from "@/lib/cms/previews/FormationSuccessPagePreview";
import FundingsPreview from "@/lib/cms/previews/FundingsPreview";
import GovernmentContractingAnytimeActionPreview from "@/lib/cms/previews/GovernmentContractingActionTaskPreview";
import LargeCalloutPreview from "@/lib/cms/previews/LargeCalloutPreview";
import LegalMessagePreview from "@/lib/cms/previews/LegalMessagePreview";
import ManageBusinessVehiclesTaskPreview from "@/lib/cms/previews/ManageBusinessVehiclesTaskPreview";
import NaicsLookupPreview from "@/lib/cms/previews/NaicsLookupPreview";
import NavBarPreview from "@/lib/cms/previews/NavBarPreview";
import NexusDbaFormationPreview from "@/lib/cms/previews/NexusDbaFormationPreview";
import NexusNameSearchPreview from "@/lib/cms/previews/NexusNameSearchPreview";
import NjedaPreview from "@/lib/cms/previews/NjedaPreview";
import PageNotFoundPreview from "@/lib/cms/previews/PageNotFoundPreview";
import PassengerTransportCdlPreview from "@/lib/cms/previews/PassengerTransportCdlPreview";
import ProfileFieldsPreview from "@/lib/cms/previews/ProfileFieldsPreview";
import ProfilePreviewMisc from "@/lib/cms/previews/ProfileMiscPreview";
import RaffleBingoPreview from "@/lib/cms/previews/RaffleBingoPreview";
import RemoveBusinessModalPreview from "@/lib/cms/previews/RemoveBusinessModalPreview";
import SelfRegistrationPreview from "@/lib/cms/previews/SelfRegistrationPreview";
import RoadmapSidebarCardPreview from "@/lib/cms/previews/SidebarCardPreview";
import StarterKitsPreview from "@/lib/cms/previews/StarterKitsPreview";
import TaskPreview from "@/lib/cms/previews/TaskPreview";
import TaxAccessPreview from "@/lib/cms/previews/TaxAccessPreview";
import TaxInputPreview from "@/lib/cms/previews/TaxInputPreview";
import XrayRenewalCalendarEventPreview from "@/lib/cms/previews/XrayRenewalCalendarEventPreview";
import XrayTaskPreview from "@/lib/cms/previews/XrayTaskPreview";
import { useMountEffect } from "@/lib/utils/helpers";
import { GetStaticPropsResult } from "next";
import dynamic from "next/dynamic";
import { ReactElement, ReactNode } from "react";
import jsYaml from "js-yaml";

const CMS_CONFIG = {};
const Loading = (): ReactElement => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 font-semibold text-xl">Loading...</p>
    </div>
  );
};
const CMS = dynamic(
  // @ts-expect-error: No type definition available
  () => {
    return import("decap-cms-app").then((CMS) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-expect-error: No type definition available
      CMS.init({ CMS_CONFIG });
      // @ts-expect-error: No type definition available
      CMS.registerWidget("write-once-read-only-no-space", WriteOnceReadOnlyNoSpaceControl);
      // @ts-expect-error: No type definition available
      CMS.registerWidget("no-space", NoSpaceControl);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(ContextEditor);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(AlertEditor);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(Note);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(CannabisLocationAlert);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(LargeCallout);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(MiniCallout);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(IconWidgetEditor);
      // @ts-expect-error: No type definition available
      // disables line wrapping in front-matter props
      CMS.registerCustomFormat("yaml", "yml", {
        fromFile: (text: string) => jsYaml.load(text),
        toFile: (value: string) =>
          jsYaml.dump(value, {
            lineWidth: -1,
          }),
      });

      registerPreview(CMS, "tasks", TaskPreview);
      registerPreview(CMS, "license-tasks", TaskPreview);
      registerPreview(CMS, "abc-emergency-trip-permit", EmergencyTripPermitPreview);
      registerPreview(CMS, "webflow-licenses", TaskPreview);
      registerPreview(CMS, "funding-opportunities", FundingsPreview);
      registerPreview(CMS, "archived-funding-opportunities", FundingsPreview);
      registerPreview(CMS, "certification-opportunities", CertificationsPreview);
      registerPreview(CMS, "archived-certification-opportunities", CertificationsPreview);
      registerPreview(CMS, "certification-checklist", CertificationsPreview);
      registerPreview(CMS, "contextual-information", ContextInfoPreview);
      registerPreview(CMS, "filings", FilingsPreview);
      registerPreview(CMS, "license-calendar-events", LicenseCalendarEventPreview);
      registerPreview(CMS, "municipal-tasks", TaskPreview);
      registerPreview(CMS, "xray-calendar-event", XrayRenewalCalendarEventPreview);
      registerPreview(CMS, "xray-renewal-config", XrayRenewalCalendarEventPreview);
      registerPreview(CMS, "xray", XrayTaskPreview);
      registerPreview(CMS, "manage-business-vehicles", ManageBusinessVehiclesTaskPreview);
      registerPreview(CMS, "passenger-transport-cdl-tab1", PassengerTransportCdlPreview);
      registerPreview(CMS, "passenger-transport-cdl-tab2", PassengerTransportCdlPreview);

      registerPreview(CMS, "funding-onboarding-modal-config", NjedaPreview);
      registerPreview(CMS, "formationDateDeletionModal", FormationDateDeletionModalPreview);
      registerPreview(CMS, "removeBusinessModal", RemoveBusinessModalPreview);

      registerPreview(CMS, "starterKits", StarterKitsPreview);

      registerPreview(CMS, "cigaretteLicense-step1", CigaretteLicensePreview);
      registerPreview(CMS, "cigaretteLicense-step2", CigaretteLicensePreview);
      registerPreview(CMS, "cigaretteLicense-step3", CigaretteLicensePreview);
      registerPreview(CMS, "cigaretteLicense-step4", CigaretteLicensePreview);

      registerPreview(CMS, "cigaretteLicense-shared", CigaretteLicensePreview);
      registerPreview(CMS, "cigaretteLicense-confirmation", CigaretteLicenseConfirmationPreview);

      registerPreview(CMS, "page-not-found-error", PageNotFoundPreview);
      registerPreview(CMS, "check-account-email-page", LoginEmailCheckPreview);

      registerPreview(CMS, "selfRegistration", SelfRegistrationPreview);

      registerPreview(CMS, "legalMessageDefaults", LegalMessagePreview);

      // ----- Anytime Actions -----
      registerPreview(CMS, "anytime-action-tasks", AnytimeActionTaskPreview);
      registerPreview(
        CMS,
        "anytime-action-license-reinstatements",
        AnytimeActionLicenseReinstatementPreview,
      );
      registerPreview(CMS, "taxClearanceCertificate-step1", AnytimeActionTaxClearancePreview);
      registerPreview(CMS, "taxClearanceCertificate-step2", AnytimeActionTaxClearancePreview);
      registerPreview(CMS, "taxClearanceCertificate-step3", AnytimeActionTaxClearancePreview);
      registerPreview(CMS, "taxClearanceCertificate-shared", AnytimeActionTaxClearancePreview);
      registerPreview(CMS, "taxClearanceCertificate-download", AnytimeActionTaxClearancePreview);
      registerPreview(CMS, "government-contracting", GovernmentContractingAnytimeActionPreview);

      // ----- Roadmap Sidebar Card -----
      registerPreview(CMS, "roadmap-sidebar-card", RoadmapSidebarCardPreview);

      // ----- Steps -----
      registerPreview(CMS, "raffle-bingo-steps", RaffleBingoPreview);

      // ----- Page Metadata -----
      registerPreview(CMS, "page-metadata", PageMetaDataPreview);

      // ----- Profile -----
      registerPreview(CMS, "profile-fields", ProfileFieldsPreview);
      registerPreview(CMS, "profile-misc", ProfilePreviewMisc);
      registerPreview(CMS, "employer-rates", EmployerRatesPreview);

      registerPreview(CMS, "cannabisPriority-1", CannabisPriorityStatusPreview);
      registerPreview(CMS, "cannabisPriority-2", CannabisPriorityStatusPreview);

      registerPreview(CMS, "nexus-name-search", NexusNameSearchPreview);
      registerPreview(CMS, "nexus-dba-formation", NexusDbaFormationPreview);

      registerPreview(CMS, "ein-input-section", EinInputPreview);
      registerPreview(CMS, "tax-input-section", TaxInputPreview);
      registerPreview(CMS, "business-structure-selection", BusinessStructurePreview);

      // ----- Cannabis License -----
      registerPreview(CMS, "cannabis-eligibility-modal", CannabisEligibilityModalPreview);
      registerAsTask(CMS, ["applyForAnnualLicense-task", "applyForConditionalLicense-task"]);
      registerAsCannabisLicensePreview(CMS, [
        "cannabisLicense-1",
        "cannabisLicenseAnnual-2",
        "cannabisLicenseConditional-2",
      ]);

      // ----- Formation -----
      registerPreview(
        CMS,
        "business-formation-interim-success-page",
        FormationInterimSuccessPreview,
      );
      registerPreview(CMS, "business-formation-success-page", FormationSuccessPreview);

      // Naics Code
      registerPreview(CMS, "naics-code-lookup", NaicsLookupPreview);
      registerPreview(CMS, "naics-code-input", NaicsLookupPreview);

      // ----- Config --------
      registerPreview(CMS, "dashboard-config-snackbars", DashboardSnackbarsPreview);
      registerPreview(CMS, "dashboard-config-calendar", DashboardCalendarPreview);
      registerPreview(CMS, "dashboard-config-modals", DashboardModalsPreview);
      registerPreview(CMS, "dashboard-config-tabs", DashboardTabsPreview);
      registerPreview(CMS, "account-setup-page", AccountSetupPreview);

      registerPreview(CMS, "deferred-location-config", DeferredLocationPreview);

      registerPreview(CMS, "tax-access", TaxAccessPreview);
      registerPreview(CMS, "navigation-defaults", NavBarPreview);

      registerPreview(CMS, "calloutDefaults", LargeCalloutPreview);
    });
  },
  { ssr: false, loading: Loading },
);

const registerAsTask = (CMS: typeof import("decap-cms-app"), names: string[]): void => {
  for (const name of names) {
    // @ts-expect-error: No type definition available
    CMS.registerPreviewTemplate(name, TaskPreview);
  }
};

const registerAsCannabisLicensePreview = (
  CMS: typeof import("decap-cms-app"),
  names: string[],
): void => {
  for (const name of names) {
    // @ts-expect-error: No type definition available
    CMS.registerPreviewTemplate(name, CannabisLicensePreview);
  }
};

const registerPreview = (
  CMS: typeof import("decap-cms-app"),
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview: (props: any) => ReactNode,
): void => {
  // @ts-expect-error: No type definition available
  CMS.registerPreviewTemplate(name, applyTheme(preview));
};

const Admin = (): ReactElement => {
  const updateRequiredFieldErrorMessage = (): void => {
    const alertElement = document.querySelector(".css-83ylea-toast-danger-Toast");
    if (alertElement) {
      alertElement.textContent =
        "Oops, you've missed a required field. Please complete before saving.\n\nOpen your browser's Inspect > Console to find error.";
    }
  };

  const printFieldWithErrorToConsole = (): void => {
    const errorMessages = document.querySelectorAll(".css-9guxbf-ControlErrorsList");
    if (errorMessages.length > 0) {
      for (const element of errorMessages) {
        const getParent = (
          element: Element | null | undefined,
        ): { label: string | null | undefined; element: Element | null | undefined } => {
          const container = element?.parentElement?.closest(".css-1rsca1y-ControlContainer");
          return {
            element: container,
            label: container?.children[0].textContent,
          };
        };

        const level1Parent = getParent(element.parentElement);
        const level2Parent = getParent(level1Parent.element);
        const level3Parent = getParent(level2Parent.element);
        const level4Parent = getParent(level3Parent.element);

        console.log(
          `%c ${level4Parent.label ? `${level4Parent.label} > ` : ""}
         ${level3Parent.label ? `${level3Parent.label} > ` : ""}
          ${level2Parent.label ? `${level2Parent.label} > ` : ""}
           ${level1Parent.label ? `${level1Parent.label} > ` : ""}
            ${element.textContent}`,
          "background: #111; color: tomato; font-size: 16px;",
        );
      }
    }
  };

  useMountEffect(() => {
    setInterval(() => {
      window.location.reload();
    }, 3600000);

    setInterval(() => {
      printFieldWithErrorToConsole();
    }, 1000 * 30);

    setInterval(() => {
      updateRequiredFieldErrorMessage();
    }, 1000 * 2);
  });

  return (
    <>
      <CMS />
    </>
  );
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default Admin;
