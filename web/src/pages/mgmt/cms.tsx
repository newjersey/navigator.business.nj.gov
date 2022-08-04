import ContextEditor from "@/lib/cms/editors/context-info";
import { SlugControl } from "@/lib/cms/fields/slugfield";
import CannabisLicensePreview from "@/lib/cms/previews/cannabis-license/cannabis-license";
import CannabisPriorityStatusPreview from "@/lib/cms/previews/cannabis-priority-status";
import CertificationsPreview from "@/lib/cms/previews/certifications";
import ContentPreview from "@/lib/cms/previews/content";
import ContextInfoPreview from "@/lib/cms/previews/context-info";
import FilingsPreview from "@/lib/cms/previews/filings";
import FundingsPreview from "@/lib/cms/previews/fundings";
import NaicsLookupPreview from "@/lib/cms/previews/naics-lookup";
import NexusDbaFormationPreview from "@/lib/cms/previews/nexus-dba-formation";
import NexusNameSearchPreview from "@/lib/cms/previews/nexus-name-search";
import ProfilePreview from "@/lib/cms/previews/profile";
import ProfilePreviewDocuments from "@/lib/cms/previews/profile-documents";
import ProfilePreviewIndustrySpecific from "@/lib/cms/previews/profile-industryspecific";
import ProfilePreviewMisc from "@/lib/cms/previews/profile-misc";
import ProfilePreviewOnboarding from "@/lib/cms/previews/profile-onboarding";
import RoadmapSidebarCardPreview from "@/lib/cms/previews/roadmap-sidebar-card";
import TaskPreview from "@/lib/cms/previews/task";
import { useMountEffect } from "@/lib/utils/helpers";
import dynamic from "next/dynamic";

const CMS_CONFIG = {};
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-500 font-semibold text-xl">Loading...</p>
  </div>
);

const CMS = dynamic(
  // @ts-expect-error: No type definition available
  () =>
    import("netlify-cms-app").then((CMS) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-expect-error: No type definition available
      CMS.init({ CMS_CONFIG });
      // @ts-expect-error: No type definition available
      CMS.registerWidget("slug", SlugControl);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("tasks", TaskPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("funding-opportunities", FundingsPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("post-onboarding-content", ContentPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("archived-funding-opportunities", FundingsPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("certification-opportunities", CertificationsPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("archived-certification-opportunities", CertificationsPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("certification-checklist", CertificationsPreview);
      // @ts-expect-error: No type definition available
      CMS.registerEditorComponent(ContextEditor);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("contextual-information", ContextInfoPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("filings", FilingsPreview);

      // ----- Roadmap Sidebar Card -----
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("roadmap-sidebar-card", RoadmapSidebarCardPreview);

      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-info-poppy", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-info-oscar", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-info-dakota", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-numbers-poppy", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-numbers-oscar", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-numbers-dakota", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-documents-oscar", ProfilePreviewDocuments);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-documents-poppy", ProfilePreviewDocuments);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-notes-poppy", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-notes-oscar", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-notes-dakota", ProfilePreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-industries-poppy", ProfilePreviewIndustrySpecific);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-industries-oscar", ProfilePreviewIndustrySpecific);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-onboarding-poppy", ProfilePreviewOnboarding);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-onboarding-dakota", ProfilePreviewOnboarding);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("profile-misc", ProfilePreviewMisc);

      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("cannabisPriority-task", TaskPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("cannabisPriority-1", CannabisPriorityStatusPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("cannabisPriority-2", CannabisPriorityStatusPreview);

      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("nexus-name-search", NexusNameSearchPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("nexus-dba-formation", NexusDbaFormationPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("nexus-name-search-task", TaskPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("nexus-dba-formation-task", TaskPreview);

      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("naics-code-task", TaskPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("naics-code-lookup", NaicsLookupPreview);

      // ----- Cannabis License -----
      registerAsTask(CMS, ["applyForAnnualLicense-task", "applyForConditionalLicense-task"]);
      registerAsCannabisLicensePreview(CMS, [
        "cannabisLicense-1",
        "cannabisLicenseAnnual-2",
        "cannabisLicenseConditional-2",
      ]);

      // ----- Cannabis Priority Status -----
      registerAsContent(CMS, [
        "cannabis-minority-and-women-owned",
        "cannabis-social-equity",
        "cannabis-veteran-owned",
      ]);
    }),
  { ssr: false, loading: Loading }
);

const registerAsContent = (CMS: typeof import("netlify-cms-app"), names: string[]) => {
  for (const name of names) {
    // @ts-expect-error: No type definition available
    CMS.registerPreviewTemplate(name, ContentPreview);
  }
};

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

const Admin = () => {
  useMountEffect(() =>
    setInterval(() => {
      window.location.reload();
    }, 3600000)
  );

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
