import { NaicsCodeDisplay } from "@/components/tasks/NaicsCodeDisplay";
import { NaicsCodeInput } from "@/components/tasks/NaicsCodeInput";
import { ConfigContext } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateTask } from "@/test/factories";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

const NaicsLookupPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const task = generateTask({
    name: "Name is controlled by Task Metadata",
    contentMd: "Body content is controlled by Task Metadata",
  });

  const business = generateBusiness({
    profileData: generateProfileData({
      naicsCode: "",
      industryId: "cannabis",
    }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <NaicsCodeInput
          onSave={(): void => {}}
          task={task}
          isAuthenticated={IsAuthenticated.TRUE}
          CMS_ONLY_fakeBusiness={business}
          CMS_ONLY_displayInput={true}
        />

        <hr className="margin-y-6" />

        <NaicsCodeDisplay
          onEdit={(): void => {}}
          onRemove={(): void => {}}
          code={"441221"}
          lockField={false}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default NaicsLookupPreview;
