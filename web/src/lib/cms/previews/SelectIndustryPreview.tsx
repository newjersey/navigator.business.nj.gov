import { SelectIndustryTask } from "@/components/tasks/SelectIndustryTask";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { TaskWithLicenseTaskId } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const SelectIndustryPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const task = {
    ...usePageData<TaskWithLicenseTaskId>(props),
    name: "Name is controlled by Task Metadata",
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <SelectIndustryTask task={task} CMS_ONLY_showSuccessAlert={true} />
      </div>
    </ConfigContext.Provider>
  );
};

export default SelectIndustryPreview;
