import { Callout } from "@/components/Callout";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";

export const TaxClearanceDownload = () => {
  const { Config } = useConfig();

  return (
    <>
      <div className="margin-y-3 margin-x-10" data-testid="download-page">
        <div className="fdc fac ">
          <div className={"margin-top-3 margin-bottom-5"}>
            <img src={`/img/trophy-illustration.svg`} alt="" />
          </div>
          <div className="margin-bottom-5">
            <Heading level={2}>{Config.taxClearanceCertificateDownload.headerTwoLabel}</Heading>
          </div>
        </div>
        <Callout calloutType="warning" showIcon>
          {Config.taxClearanceCertificateDownload.calloutText}
        </Callout>
      </div>
    </>
  );
};
