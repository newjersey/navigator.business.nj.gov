import { Callout } from "@/components/Callout";
import { DocumentTile } from "@/components/DocumentTile";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const TaxClearanceDownload = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <div className="margin-y-3 margin-x-6" data-testid="download-page">
        <div className="fdc fac ">
          <div className={"margin-top-3 margin-bottom-5"}>
            <img src={`/img/trophy-illustration.svg`} alt="" />
          </div>
          <div className="margin-bottom-3">
            <Heading level={2}>{Config.taxClearanceCertificateDownload.headerTwoLabel}</Heading>
          </div>
        </div>
        <Callout calloutType="warning" showIcon>
          {Config.taxClearanceCertificateDownload.calloutText}
        </Callout>
        <DocumentTile
          label={Config.taxClearanceCertificateDownload.buttonText}
          icon="formation-icon-blue"
          isCentered
          isRounded
          hasExtraPadding
          // TODO: downloading of PDF will be handled in a separate ticket
          onClick={() => {}}
          isWidthFull
          hasDownloadIcon
        />
      </div>
    </>
  );
};
