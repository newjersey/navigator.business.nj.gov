import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
}

export const AnytimeActionElement = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <div className="min-height-38rem">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-y-4 margin-x-4 margin-bottom-2">
          <h1>{props.anytimeAction.name}</h1>
        </div>
      </div>
      {props.anytimeAction.summaryDescriptionMd?.length > 0 && (
        <>
          <Content>{props.anytimeAction.summaryDescriptionMd}</Content>
          <HorizontalLine />
        </>
      )}
      <Content>{props.anytimeAction.contentMd}</Content>
      {props.anytimeAction?.issuingAgency && (
        <>
          <HorizontalLine />
          <span className="h5-styling" data-testid="form-id-header">
            {Config.filingDefaults.issuingAgencyText} &nbsp;
          </span>
          <span className="h6-styling">{props.anytimeAction.issuingAgency}</span>
        </>
      )}
      {props.anytimeAction.callToActionLink && props.anytimeAction.callToActionText && (
        <SingleCtaLink
          link={props.anytimeAction.callToActionLink}
          text={props.anytimeAction.callToActionText}
        />
      )}
    </div>
  );
};
