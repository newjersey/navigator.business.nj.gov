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
      // @ts-expect-error: No type definition available
      CMS.init({ CMS_CONFIG });
    }),
  { ssr: false, loading: Loading }
);

const Admin = () => <CMS />;

export default Admin;
