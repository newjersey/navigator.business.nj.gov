import ContextEditor from "@/lib/cms/editors/context-info";
import { SlugControl } from "@/lib/cms/fields/slugfield";
import CertificationsPreview from "@/lib/cms/previews/certifications";
import ContentPreview from "@/lib/cms/previews/content";
import ContextInfoPreview from "@/lib/cms/previews/context-info";
import FilingsPreview from "@/lib/cms/previews/filings";
import FundingsPreview from "@/lib/cms/previews/fundings";
import ProfilePreview from "@/lib/cms/previews/profile";
import ProfilePreviewDocuments from "@/lib/cms/previews/profile-documents";
import ProfilePreviewIndustrySpecific from "@/lib/cms/previews/profile-industryspecific";
import ProfilePreviewMisc from "@/lib/cms/previews/profile-misc";
import ProfilePreviewOnboarding from "@/lib/cms/previews/profile-onboarding";
import RoadmapSidebarCardPreview from "@/lib/cms/previews/roadmap-sidebar-card";
import TaskPreview from "@/lib/cms/previews/task";
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

      // ----- Cannabis License -----
      registerAsContent(CMS, [
        "annual-general-requirements",
        "conditional-general-requirements",
        "diversely-owned-requirements",
        "impact-zone-requirements",
        "microbusiness-requirements",
        "social-equity-requirements",
        "annual-bottom-of-task",
        "conditional-bottom-of-task",
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

const Admin = () => (
  <>
    <CMS />
  </>
);

export async function getStaticProps() {
  return {
    props: { noAuth: true },
  };
}

export default Admin;
