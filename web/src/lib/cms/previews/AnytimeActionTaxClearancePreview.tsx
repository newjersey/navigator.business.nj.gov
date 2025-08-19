import { Heading } from "@/components/njwds-extended/Heading";
import { AnytimeActionTaxClearanceCertificate } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificate";
import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateAnytimeActionTask } from "@/test/factories";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { emptyTaxClearanceCertificateData } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import { ReactElement } from "react";

const AnytimeActionTaxClearancePreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const taxClearanceAnytimeAction = generateAnytimeActionTask({
    name: "Name is controlled by Task Metadata",
  });

  const [, tab] = props.entry.toJS().slug.split("-");

  const taxClearanceFields = Object.keys(emptyTaxClearanceCertificateData);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <div className={"margin-bottom-4"}>
          The H1 can only be updated in the tax clearance file located within the anytime action
          tasks admin collection
        </div>
        {tab === "step1" && (
          <>
            <AnytimeActionTaxClearanceCertificate
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={0}
            />
          </>
        )}
        {tab === "step2" && (
          <>
            <AnytimeActionTaxClearanceCertificate
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={1}
            />
          </>
        )}
        {tab === "step3" && (
          <>
            <Heading level={2}>Generic Taxation API Error</Heading>
            <AnytimeActionTaxClearanceCertificateAlert
              fieldErrors={[]}
              responseErrorType={"INELIGIBLE_TAX_CLEARANCE_FORM"}
              setStepIndex={() => {}}
            />
            <Heading level={2}>Anytime Action Step 3</Heading>
            <AnytimeActionTaxClearanceCertificate
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={2}
            />
          </>
        )}
        {tab === "shared" && (
          <>
            <Heading level={2}>Singular Field Error</Heading>
            <AnytimeActionTaxClearanceCertificateAlert
              fieldErrors={[taxClearanceFields[0]]}
              setStepIndex={() => {}}
            />
            <Heading level={2}>Multiple Field Errors</Heading>
            <AnytimeActionTaxClearanceCertificateAlert
              fieldErrors={taxClearanceFields}
              setStepIndex={() => {}}
            />
            <Heading level={2}>Anytime Action Task Screen</Heading>
            <AnytimeActionTaxClearanceCertificate
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_stepIndex={1}
            />
          </>
        )}
        {tab === "download" && (
          <>
            <AnytimeActionTaxClearanceCertificate
              anytimeAction={taxClearanceAnytimeAction}
              CMS_ONLY_certificatePdfBlob={new Blob()}
            />
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default AnytimeActionTaxClearancePreview;
