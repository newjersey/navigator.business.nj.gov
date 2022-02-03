import { SlugControl } from "@/lib/cms/fields/slugfield";
import OpportunitiesPreview from "@/lib/cms/previews/opportunities";
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
      CMS.registerPreviewTemplate("funding-opportunities", OpportunitiesPreview);
      // @ts-expect-error: No type definition available
      CMS.registerPreviewTemplate("archived-funding-opportunities", OpportunitiesPreview);
    }),
  { ssr: false, loading: Loading }
);

const Admin = () => (
  <>
    <CMS />
  </>
);

export default Admin;
