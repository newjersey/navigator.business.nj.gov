import { Content } from "@/components/Content";
import { TaxInput } from "@/components/tasks/TaxInput";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateTask } from "@/test/factories";
import { ReactElement } from "react";

const TaxInputPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const task = generateTask({
    name: "Name is controlled by Task Metadata",
    contentMd: "Body content is controlled by Task Metadata",
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Content>{config.tax.descriptionText}</Content>
        <TaxInput task={task} />

        <hr className="margin-y-6" />
      </div>
    </ConfigContext.Provider>
  );
};

export default TaxInputPreview;
