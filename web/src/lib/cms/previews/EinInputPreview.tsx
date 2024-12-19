import { Content } from "@/components/Content";
import { EinDisplay } from "@/components/tasks/EinDisplay";
import { EinInput } from "@/components/tasks/EinInput";
import { ConfigContext } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateTask } from "@/test/factories";
import { ReactElement } from "react";

const EinInputPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const task = generateTask({
    name: "Name is controlled by Task Metadata",
    contentMd: "Body content is controlled by Task Metadata",
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Content>{config.ein.descriptionText}</Content>
        <EinInput task={task} isAuthenticated={IsAuthenticated.TRUE} onSave={(): void => {}} />

        <hr className="margin-y-6" />

        <Content>{config.ein.descriptionText}</Content>
        <EinDisplay onEdit={(): void => {}} onRemove={(): void => {}} employerId="123456789" />
      </div>
    </ConfigContext.Provider>
  );
};

export default EinInputPreview;
