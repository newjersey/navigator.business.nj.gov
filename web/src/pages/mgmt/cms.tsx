import Callout from "@/lib/cms/editors/callout";
import CannabisLocationAlert from "@/lib/cms/editors/cannabisLocationAlert";
import ContextEditor from "@/lib/cms/editors/context-info";
import IconWidgetEditor from "@/lib/cms/editors/icon";
import AlertEditor from "@/lib/cms/editors/infoAlert";
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

import FormationInterimSuccessPreview from "@/lib/cms/previews/FormationInterimSuccessPreview";
import FormationSuccessPreview from "@/lib/cms/previews/FormationSuccessPagePreview";
import FundingsPreview from "@/lib/cms/previews/FundingsPreview";
import NaicsLookupPreview from "@/lib/cms/previews/NaicsLookupPreview";
import NexusDbaFormationPreview from "@/lib/cms/previews/NexusDbaFormationPreview";
import NexusNameSearchPreview from "@/lib/cms/previews/NexusNameSearchPreview";
import PageNotFoundPreview from "@/lib/cms/previews/PageNotFoundPreview";
import ProfileFieldsPreview from "@/lib/cms/previews/ProfileFieldsPreview";
import ProfilePreviewMisc from "@/lib/cms/previews/ProfileMiscPreview";
import RoadmapSidebarCardPreview from "@/lib/cms/previews/SidebarCardPreview";
import TaskPreview from "@/lib/cms/previews/TaskPreview";
import TaxInputPreview from "@/lib/cms/previews/TaxInputPreview";
import { useMountEffect } from "@/lib/utils/helpers";

import AccountSetupPreview from "@/lib/cms/previews/AccountSetupPreview";
import AnytimeActionLicenseReinstatementPreview from "@/lib/cms/previews/AnytimeActionLicenseReinstatementPreview";
import AnytimeActionTaskPreview from "@/lib/cms/previews/AnytimeActionTaskPreview";
import BusinessStructurePreview from "@/lib/cms/previews/BusinessStructurePreview";
import CalloutPreview from "@/lib/cms/previews/CalloutPreview";
import NavBarPreview from "@/lib/cms/previews/NavBarPreview";
import RaffleBingoPreview from "@/lib/cms/previews/RaffleBingoPreview";
import TaxAccessModalPreview from "@/lib/cms/previews/TaxAccessModalPreview";
import { GetStaticPropsResult } from "next";
import dynamic from "next/dynamic";
import { ReactElement } from "react";

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
    return import("netlify-cms-app").then((CMS) => {
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
      CMS.registerEditorComponent(Callout);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(IconWidgetEditor);

      registerPreview(CMS, "tasks", TaskPreview);
      registerPreview(CMS, "license-tasks", TaskPreview);
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

      registerPreview(CMS, "page-not-found-error", PageNotFoundPreview);

      // ----- Anytime Actions -----
      registerPreview(CMS, "anytime-action-tasks-admin", AnytimeActionTaskPreview);
      registerPreview(CMS, "anytime-action-tasks-licenses", AnytimeActionTaskPreview);
      registerPreview(CMS, "anytime-action-tasks-reinstatements", AnytimeActionTaskPreview);
      registerPreview(CMS, "anytime-action-license-reinstatements", AnytimeActionLicenseReinstatementPreview);

      // ----- Roadmap Sidebar Card -----
      registerPreview(CMS, "roadmap-sidebar-card", RoadmapSidebarCardPreview);

      // ----- Steps -----
      registerPreview(CMS, "raffle-bingo-steps", RaffleBingoPreview);

      // ----- Page Metadata -----
      registerPreview(CMS, "page-metadata", PageMetaDataPreview);

      // ----- Profile -----
      registerPreview(CMS, "profile-fields", ProfileFieldsPreview);
      registerPreview(CMS, "profile-misc", ProfilePreviewMisc);

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
      registerPreview(CMS, "business-formation-interim-success-page", FormationInterimSuccessPreview);
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

      registerPreview(CMS, "tax-access-modal", TaxAccessModalPreview);
      registerPreview(CMS, "navigation-defaults", NavBarPreview);

      registerPreview(CMS, "calloutDefaults", CalloutPreview);
    });
  },
  { ssr: false, loading: Loading }
);

const registerAsTask = (CMS: typeof import("netlify-cms-app"), names: string[]): void => {
  for (const name of names) {
    // @ts-expect-error: No type definition available
    CMS.registerPreviewTemplate(name, TaskPreview);
  }
};

const registerAsCannabisLicensePreview = (CMS: typeof import("netlify-cms-app"), names: string[]): void => {
  for (const name of names) {
    // @ts-expect-error: No type definition available
    CMS.registerPreviewTemplate(name, CannabisLicensePreview);
  }
};

const registerPreview = (
  CMS: typeof import("netlify-cms-app"),
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preview: (props: any) => JSX.Element
): void => {
  // @ts-expect-error: No type definition available
  CMS.registerPreviewTemplate(name, applyTheme(preview));
};

const Admin = (): ReactElement => {
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
          element: Element | null | undefined
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
          "background: #111; color: tomato; font-size: 16px;"
        );
      }
    }
  };

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
