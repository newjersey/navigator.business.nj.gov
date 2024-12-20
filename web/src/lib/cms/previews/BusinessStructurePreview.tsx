import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateTask } from "@/test/factories";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const BusinessStructurePreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const task = generateTask({
    name: "Name is controlled by Task Metadata",
    contentMd: "Body content is controlled by Task Metadata\n\n---",
  });

  const missingLegalStructure = generateBusiness({
    profileData: generateProfileData({ legalStructureId: undefined }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <BusinessStructureTask task={task} CMS_ONLY_fakeBusiness={generateBusiness({})} />
        <hr className="margin-y-6" />
        <BusinessStructureTask task={task} CMS_ONLY_fakeBusiness={missingLegalStructure} />
      </div>
    </ConfigContext.Provider>
  );
};

export default BusinessStructurePreview;
