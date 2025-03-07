import { AnytimeActionTaxClearanceCertificateElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateElement";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateAnytimeActionTask } from "@/test/factories";
import { ReactElement } from "react";

const AnytimeActionTaxClearancePreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const taxClearanceAnytimeAction = generateAnytimeActionTask({
    name: "Name is controlled by Task Metadata",
  });

  const [, tab] = props.entry.toJS().slug.split("-");

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <div className={"margin-bottom-4"}>
          The H1 can only be updated in the tax clearance file located within the anytime action tasks admin
          collection
        </div>
        {tab === "step1" && (
          <>
            <AnytimeActionTaxClearanceCertificateElement
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={0}
            />
          </>
        )}
        {tab === "step2" && (
          <>
            <AnytimeActionTaxClearanceCertificateElement
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={1}
            />
          </>
        )}
        {tab === "step3" && (
          <>
            <AnytimeActionTaxClearanceCertificateElement
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={2}
            />
          </>
        )}
        {tab === "shared" && (
          <>
            <AnytimeActionTaxClearanceCertificateElement
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={1}
            />
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default AnytimeActionTaxClearancePreview;
