import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";
import type { ReactElement } from "react";
import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateTask } from "@/test/factories";

const BusinessStructurePreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const isRadioOptionsPreview = props.entry.toJS().slug === "business-structure-radio-options";

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
        {!isRadioOptionsPreview && (
          <>
            <BusinessStructureTask
              task={task}
              CMS_ONLY_fakeBusiness={generateBusiness({})}
              CMS_ONLY_hideUnlockedBy
            />
            <hr className="margin-y-6" />
          </>
        )}
        <BusinessStructureTask
          task={task}
          CMS_ONLY_fakeBusiness={missingLegalStructure}
          CMS_ONLY_expandOtherStructures
          CMS_ONLY_hideUnlockedBy
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default BusinessStructurePreview;
