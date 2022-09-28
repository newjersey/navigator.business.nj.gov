import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { ConfigContext } from "@/contexts/configContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { templateEval } from "@/lib/utils/helpers";
import { generateTask } from "@/test/factories";

const CannabisPriorityStatusPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { tab } = getMetadataFromSlug(props.entry.toJS().slug);

  const priorityStatusTypes = {
    type1: config.cannabisPriorityStatus.minorityWomenOrVeteran,
    type2: config.cannabisPriorityStatus.impactZone,
    type3: config.cannabisPriorityStatus.socialEquity,
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <CannabisPriorityStatusTask
          task={generateTask({ name: "Name is controlled by Task Metadata" })}
          CMS_ONLY_tab={tab}
        />

        {tab === "1" && (
          <>
            <hr className="margin-y-4" />
            <h2>Priority Status Types</h2>

            <Alert variant="info">
              <Content>{templateEval(config.cannabisPriorityStatus.phrase1, priorityStatusTypes)}</Content>
            </Alert>

            <Alert variant="info">
              <Content>{templateEval(config.cannabisPriorityStatus.phrase2, priorityStatusTypes)}</Content>
            </Alert>

            <Alert variant="info">
              <Content>{templateEval(config.cannabisPriorityStatus.phrase3, priorityStatusTypes)}</Content>
            </Alert>
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default CannabisPriorityStatusPreview;
