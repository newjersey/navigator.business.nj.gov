import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { TaskWithLicenseTaskId } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const CigaretteLicensePreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const task = {
    ...usePageData<TaskWithLicenseTaskId>(props),
    name: "Name is controlled by Task Metadata",
  };

  const [, tab] = props.entry.toJS().slug.split("-");

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        {tab === "step1" && (
          <>
            <CigaretteLicense CMS_ONLY_stepIndex={0} task={task} />
          </>
        )}
        {tab === "shared" && (
          <>
            <CigaretteLicense task={task} />
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default CigaretteLicensePreview;
