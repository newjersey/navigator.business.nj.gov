import { Callout } from "@/components/Callout";
import { DocumentTile } from "@/components/DocumentTile";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  certificatePdfArray: number[];
  downloadFilename: string;
}

export const byteArrayToString = (byteArray: number[]): string => {
  //convert byte array to string
  if (byteArray.length === 0) {
    return "";
  }
  const uint8Array = new Uint8Array(byteArray);
  return new TextDecoder().decode(uint8Array);
};

export const TaxClearanceDownload = (props: Props): ReactElement => {
  const { Config } = useConfig();

  // move this to when the state is saved, don't need to reformat on every render
  const blob = new Blob([new Uint8Array(props.certificatePdfArray.map((signedByte) => signedByte & 0xff))], {
    type: "application/pdf",
  });
  let downloadLink = "test";
  if (typeof window !== "undefined") {
    const URL = window.URL || window.webkitURL;
    downloadLink = URL.createObjectURL(blob);
  }
  // console.log("rendering once", typeof window !== "undefined");
  // console.log("downloadLink", downloadLink);

  // useEffect(() => {

  // }, [props.certificatePdfArray]);

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
          // onClick={() => {
          //   console.log("clicked");
          // }}
          downloadLink={downloadLink}
          downloadFilename={props.downloadFilename}
          isWidthFull
          hasDownloadIcon
        />
      </div>
    </>
  );
};
