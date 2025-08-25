import { TaxAccessStepOne } from "@/components/filings-calendar/tax-access/TaxAccessStepOne";
import { TaxAccessStepTwo } from "@/components/filings-calendar/tax-access/TaxAccessStepTwo";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { randomPublicFilingLegalStructure, randomTradeNameLegalStructure } from "@/test/factories";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";
import { ReactElement, useState } from "react";

const TaxAccessPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [errorPreview, setErrorPreview] = useState<"NONE" | "API" | "UNKNOWN">("NONE");

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <fieldset>
        <legend>Select an error type to preview:</legend>

        <div>
          <input
            type="radio"
            id="none"
            name="none"
            value="NONE"
            checked={errorPreview === "NONE"}
            onClick={(): void => setErrorPreview("NONE")}
          />
          <label htmlFor="none">None</label>
        </div>

        <div>
          <input
            type="radio"
            id="api"
            name="api"
            value="API"
            checked={errorPreview === "API"}
            onClick={(): void => setErrorPreview("API")}
          />
          <label htmlFor="api">API error</label>
        </div>

        <div>
          <input
            type="radio"
            id="unknown"
            name="unknown"
            value="UNKNOWN"
            checked={errorPreview === "UNKNOWN"}
            onClick={(): void => setErrorPreview("UNKNOWN")}
          />
          <label htmlFor="unknown">Unknown error</label>
        </div>
      </fieldset>

      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <TaxAccessStepOne moveToNextStep={(): void => {}} />

        <div>
          This is a preview of Step Two with a <span className="text-bold">public filing</span>{" "}
          legal structure:
        </div>

        <TaxAccessStepTwo
          moveToPrevStep={(): void => {}}
          onSuccess={(): void => {}}
          CMS_ONLY_fakeError={errorPreview}
          CMS_ONLY_fakeBusiness={generateBusiness({
            profileData: generateProfileData({
              businessPersona: "OWNING",
              legalStructureId: randomPublicFilingLegalStructure(),
            }),
          })}
        />

        <div>
          This is a preview of Step Two with a <span className="text-bold">trade name</span> legal
          structure:
        </div>

        <TaxAccessStepTwo
          moveToPrevStep={(): void => {}}
          onSuccess={(): void => {}}
          CMS_ONLY_fakeError={errorPreview}
          CMS_ONLY_fakeBusiness={generateBusiness({
            profileData: generateProfileData({
              businessPersona: "OWNING",
              legalStructureId: randomTradeNameLegalStructure(),
            }),
          })}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default TaxAccessPreview;
