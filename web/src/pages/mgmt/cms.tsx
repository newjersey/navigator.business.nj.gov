import ContextEditor from "@/lib/cms/editors/context-info";
import { NoSpaceControl } from "@/lib/cms/fields/nospacefield";
import { SlugControl } from "@/lib/cms/fields/slugfield";
import CannabisEligibilityModalPreview from "@/lib/cms/previews/CannabisEligibilityModalPreview";
import CannabisLicensePreview from "@/lib/cms/previews/CannabisLicensePreview";
import CannabisPriorityStatusPreview from "@/lib/cms/previews/CannabisPriorityStatusPreview";
import CertificationsPreview from "@/lib/cms/previews/CertificationsPreview";
import ContentPreview from "@/lib/cms/previews/ContentPreview";
import ContextInfoPreview from "@/lib/cms/previews/ContextInfoPreview";
import DashboardCalendarPreview from "@/lib/cms/previews/DashboardCalendarPreview";
import DashboardModalsPreview from "@/lib/cms/previews/DashboardModalsPreview";
import DashboardSnackbarsPreview from "@/lib/cms/previews/DashboardSnackbarsPreview";
import DashboardTabsPreview from "@/lib/cms/previews/DashboardTabsPreview";
import DeferredLocationPreview from "@/lib/cms/previews/DeferredLocationPreview";
import EinInputPreview from "@/lib/cms/previews/EinInputPreview";
import FilingsPreview from "@/lib/cms/previews/FilingsPreview";
import FormationInterimSuccessPreview from "@/lib/cms/previews/FormationInterimSuccessPreview";
import FormationSuccessPreview from "@/lib/cms/previews/FormationSuccessPagePreview";
import FundingsPreview from "@/lib/cms/previews/FundingsPreview";
import NaicsLookupPreview from "@/lib/cms/previews/NaicsLookupPreview";
import NexusDbaFormationPreview from "@/lib/cms/previews/NexusDbaFormationPreview";
import NexusNameSearchPreview from "@/lib/cms/previews/NexusNameSearchPreview";
import PageNotFoundPreview from "@/lib/cms/previews/PageNotFoundPreview";
import ProfilePreviewDocuments from "@/lib/cms/previews/ProfileDocumentsPreview";
import ProfilePreviewIndustrySpecific from "@/lib/cms/previews/ProfileIndustrySpecificPreview";
import ProfilePreviewMisc from "@/lib/cms/previews/ProfileMiscPreview";
import ProfilePreviewOnboarding from "@/lib/cms/previews/ProfileOnboardingPreview";
import ProfilePreview from "@/lib/cms/previews/ProfilePreview";
import RoadmapSidebarCardPreview from "@/lib/cms/previews/SidebarCardPreview";
import TaskPreview from "@/lib/cms/previews/TaskPreview";
import TaxInputPreview from "@/lib/cms/previews/TaxInputPreview";
import { useMountEffect } from "@/lib/utils/helpers";
import dynamic from "next/dynamic";

const CMS_CONFIG = {};
const Loading = () => {
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
      CMS.registerWidget("slug", SlugControl);
      // @ts-expect-error: No type definition available
      CMS.registerWidget("nospace", NoSpaceControl);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(ContextEditor);

      registerPreview(CMS, "tasks", TaskPreview);
      registerPreview(CMS, "funding-opportunities", FundingsPreview);
      registerPreview(CMS, "post-onboarding-content", ContentPreview);
      registerPreview(CMS, "archived-funding-opportunities", FundingsPreview);
      registerPreview(CMS, "certification-opportunities", CertificationsPreview);
      registerPreview(CMS, "archived-certification-opportunities", CertificationsPreview);
      registerPreview(CMS, "certification-checklist", CertificationsPreview);
      registerPreview(CMS, "contextual-information", ContextInfoPreview);
      registerPreview(CMS, "filings", FilingsPreview);
      registerPreview(CMS, "page-not-found-error", PageNotFoundPreview);

      // ----- Roadmap Sidebar Card -----
      registerPreview(CMS, "roadmap-sidebar-card", RoadmapSidebarCardPreview);

      // ----- Profile -----
      registerPreview(CMS, "profile-info-poppy", ProfilePreview);
      registerPreview(CMS, "profile-info-oscar", ProfilePreview);
      registerPreview(CMS, "profile-info-dakota", ProfilePreview);
      registerPreview(CMS, "profile-numbers-poppy", ProfilePreview);
      registerPreview(CMS, "profile-numbers-oscar", ProfilePreview);
      registerPreview(CMS, "profile-numbers-dakota", ProfilePreview);
      registerPreview(CMS, "profile-documents-oscar", ProfilePreviewDocuments);
      registerPreview(CMS, "profile-documents-poppy", ProfilePreviewDocuments);
      registerPreview(CMS, "profile-notes-poppy", ProfilePreview);
      registerPreview(CMS, "profile-notes-oscar", ProfilePreview);
      registerPreview(CMS, "profile-notes-dakota", ProfilePreview);
      registerPreview(CMS, "profile-industries-poppy", ProfilePreviewIndustrySpecific);
      registerPreview(CMS, "profile-industries-oscar", ProfilePreviewIndustrySpecific);
      registerPreview(CMS, "profile-industries-dakota", ProfilePreviewIndustrySpecific);
      registerPreview(CMS, "profile-onboarding-poppy", ProfilePreviewOnboarding);
      registerPreview(CMS, "profile-onboarding-dakota", ProfilePreviewOnboarding);
      registerPreview(CMS, "profile-misc", ProfilePreviewMisc);

      registerPreview(CMS, "cannabisPriority-task", TaskPreview);
      registerPreview(CMS, "cannabisPriority-1", CannabisPriorityStatusPreview);
      registerPreview(CMS, "cannabisPriority-2", CannabisPriorityStatusPreview);

      registerPreview(CMS, "nexus-name-search", NexusNameSearchPreview);
      registerPreview(CMS, "nexus-dba-formation", NexusDbaFormationPreview);
      registerPreview(CMS, "nexus-name-search-task", TaskPreview);
      registerPreview(CMS, "nexus-dba-formation-task", TaskPreview);

      registerPreview(CMS, "naics-code-task", TaskPreview);
      registerPreview(CMS, "naics-code-lookup", NaicsLookupPreview);

      registerPreview(CMS, "ein-task-metadata", TaskPreview);
      registerPreview(CMS, "ein-input-section", EinInputPreview);

      registerPreview(CMS, "tax-task-metadata", TaskPreview);
      registerPreview(CMS, "tax-input-section", TaxInputPreview);

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

      // ----- Config --------
      registerPreview(CMS, "dashboard-config-snackbars", DashboardSnackbarsPreview);
      registerPreview(CMS, "dashboard-config-calendar", DashboardCalendarPreview);
      registerPreview(CMS, "dashboard-config-modals", DashboardModalsPreview);
      registerPreview(CMS, "dashboard-config-tabs", DashboardTabsPreview);

      registerPreview(CMS, "deferred-location-config", DeferredLocationPreview);
    });
  },
  { ssr: false, loading: Loading }
);

const registerAsTask = (CMS: typeof import("netlify-cms-app"), names: string[]) => {
  for (const name of names) {
    // @ts-expect-error: No type definition available
    CMS.registerPreviewTemplate(name, TaskPreview);
  }
};

const registerAsCannabisLicensePreview = (CMS: typeof import("netlify-cms-app"), names: string[]) => {
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
) => {
  // @ts-expect-error: No type definition available
  CMS.registerPreviewTemplate(name, preview);
};

const Admin = () => {
  useMountEffect(() => {
    return setInterval(() => {
      window.location.reload();
    }, 3600000);
  });

  return (
    <>
      <CMS />
    </>
  );
};

export async function getStaticProps() {
  return {
    props: { noAuth: true },
  };
}

export default Admin;
