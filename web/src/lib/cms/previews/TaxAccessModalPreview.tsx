import { TaxAccessStepOne } from "@/components/filings-calendar/tax-access-modal/TaxAccessStepOne";
import { TaxAccessStepTwo } from "@/components/filings-calendar/tax-access-modal/TaxAccessStepTwo";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { randomPublicFilingLegalStructure, randomTradeNameLegalStructure } from "@/test/factories";
import { generateBusiness, generateProfileData, generateUserData } from "@businessnjgovnavigator/shared/test";
import { ReactElement, useState } from "react";

const TaxAccessModalPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [step1ModalOpen, setStep1ModalOpen] = useState(false);
  const [step2PublicFilingModalOpen, setStep2PublicFilingModalOpen] = useState(false);
  const [step2TradeNameModalOpen, setStep2TradeNameModalOpen] = useState(false);
  const [errorPreview, setErrorPreview] = useState<"NONE" | "API" | "UNKNOWN">("NONE");
  const userData = generateUserData({});

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div>
        <button className="margin-2" onClick={(): void => setStep1ModalOpen(true)}>
          Open Tax Modal Step 1 (Business structure)
        </button>
      </div>

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

      <div>
        <button className="margin-2" onClick={(): void => setStep2PublicFilingModalOpen(true)}>
          Open Tax Modal Step 2 (with Business Name)
        </button>
      </div>

      <div>
        <button className="margin-2" onClick={(): void => setStep2TradeNameModalOpen(true)}>
          Open Tax Modal Step 2 (with Responsible Owner Name)
        </button>
      </div>

      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <TaxAccessStepOne
          isOpen={step1ModalOpen}
          close={(): void => setStep1ModalOpen(false)}
          moveToNextStep={(): void => {}}
        />

        <TaxAccessStepTwo
          isOpen={step2PublicFilingModalOpen}
          close={(): void => setStep2PublicFilingModalOpen(false)}
          moveToPrevStep={(): void => {}}
          onSuccess={(): void => {}}
          CMS_ONLY_fakeError={errorPreview}
          CMS_ONLY_fakeBusiness={generateBusiness(userData, {
            profileData: generateProfileData({
              businessPersona: "OWNING",
              legalStructureId: randomPublicFilingLegalStructure(),
            }),
          })}
        />

        <TaxAccessStepTwo
          isOpen={step2TradeNameModalOpen}
          close={(): void => setStep2TradeNameModalOpen(false)}
          moveToPrevStep={(): void => {}}
          onSuccess={(): void => {}}
          CMS_ONLY_fakeError={errorPreview}
          CMS_ONLY_fakeBusiness={generateBusiness(userData, {
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

export default TaxAccessModalPreview;
