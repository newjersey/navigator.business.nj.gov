import { AnytimeActionGovernmentContractingElement } from "@/components/tasks/anytime-action/AnytimeActionGovernmentContractingElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { AnytimeActionTask } from "@/lib/types/types";
import { ReactElement } from "react";

const GovernmentContractingAnytimeAction = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionTask>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <h2>
        To change the H1 Title and Metadata, update the government-contracting anytime action task
        file
      </h2>
      <div className="margin-bottom-10" />
      <AnytimeActionGovernmentContractingElement
        governmentContractingTask={anytimeAction}
        CMS_ONLY_stepIndex={0}
      />
      <div className="margin-bottom-10" />
      <AnytimeActionGovernmentContractingElement
        governmentContractingTask={anytimeAction}
        CMS_ONLY_stepIndex={1}
      />
      <div className="margin-bottom-10" />
      <AnytimeActionGovernmentContractingElement
        governmentContractingTask={anytimeAction}
        CMS_ONLY_stepIndex={2}
      />
      <div className="margin-bottom-10" />
      <AnytimeActionGovernmentContractingElement
        governmentContractingTask={anytimeAction}
        CMS_ONLY_stepIndex={3}
      />
    </div>
  );
};

export default GovernmentContractingAnytimeAction;
