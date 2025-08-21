import { GovernmentContractingElement } from "@/components/tasks/anytime-action/government-contracting/GovernmentContractingElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { AnytimeActionTask } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const GovernmentContractingAnytimeActionPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionTask>(props);
  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <h2>
          To change the H1 Title and Metadata, update the government-contracting anytime action task
          file
        </h2>
        <div className="margin-bottom-10" />
        <GovernmentContractingElement
          anytimeActionHeaderText={anytimeAction.name}
          CMS_ONLY_stepIndex={0}
        />
        <div className="margin-bottom-10" />
        <GovernmentContractingElement
          anytimeActionHeaderText={anytimeAction.name}
          CMS_ONLY_stepIndex={1}
        />
        <div className="margin-bottom-10" />
        <GovernmentContractingElement
          anytimeActionHeaderText={anytimeAction.name}
          CMS_ONLY_stepIndex={2}
        />
        <div className="margin-bottom-10" />
        <GovernmentContractingElement
          anytimeActionHeaderText={anytimeAction.name}
          CMS_ONLY_stepIndex={3}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default GovernmentContractingAnytimeActionPreview;
