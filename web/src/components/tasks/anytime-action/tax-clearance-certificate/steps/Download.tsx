import { DocumentTile } from "@/components/DocumentTile";
import { Callout } from "@/components/njwds-extended/callout/Callout";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  certificatePdfBlob: Blob;
  downloadFilename: string;
}

export const Download = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const downloadLink = URL.createObjectURL(props.certificatePdfBlob);

  return (
    <>
      <div className="margin-y-3 margin-x-6">
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
          downloadLink={downloadLink}
          downloadFilename={props.downloadFilename}
          isWidthFull
          hasDownloadIcon
        />
      </div>
    </>
  );
};
