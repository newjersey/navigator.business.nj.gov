import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ContactDep } from "@/components/tasks/environment-questionnaire/results/ContactDep";
import { PersonalizedSupport } from "@/components/tasks/environment-questionnaire/results/PersonalizedSupport";
import { SeeYourResponses } from "@/components/tasks/environment-questionnaire/results/SeeYourResponses";
import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import analytics from "@/lib/utils/analytics";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement, useContext } from "react";

export const EnvPermitsResults = (): ReactElement => {
  const envContext = useContext(EnvPermitContext);

  const Config = getMergedConfig();

  const isLowApplicability = (): boolean => {
    return envContext.applicableMediaAreas().length === 0;
  };

  const applicableMediaAreasText = (): string => {
    const mediaAreas = envContext.applicableMediaAreas();
    const countOfMediaAreas = mediaAreas.length;
    if (countOfMediaAreas === 1) {
      return Config.envResultsPage.summary.mediaAreaText[mediaAreas[0]];
    } else if (countOfMediaAreas === 2) {
      return `${Config.envResultsPage.summary.mediaAreaText[mediaAreas[0]]} and ${
        Config.envResultsPage.summary.mediaAreaText[mediaAreas[1]]
      }`;
    } else {
      const mediaAreaTexts = mediaAreas.map(
        (mediaArea) => Config.envResultsPage.summary.mediaAreaText[mediaArea],
      );
      const lastMediaAreaText = mediaAreaTexts[mediaAreaTexts.length - 1];
      const remainingMediaAreaTexts = mediaAreaTexts.slice(0, -1);
      return `${remainingMediaAreaTexts.join(", ")}, and ${lastMediaAreaText}`;
    }
  };

  const highApplicability = (): ReactElement => {
    analytics.event.gen_guidance_stepper_permits_required_displayed.appears.general_guidance_permits_req_displayed();
    return (
      <>
        <div>
          {Config.envResultsPage.summary.partOne}
          <span data-testid={"applicable-media-areas"} className={"text-bold margin-x-05"}>
            {applicableMediaAreasText()}
          </span>
          {Config.envResultsPage.summary.partTwo}
        </div>
        <div className="margin-y-1">
          {Config.envResultsPage.summary.partThree}
          <UnStyledButton
            isUnderline
            className="margin-left-05"
            onClick={() => {
              analytics.event.gen_guidance_stepper_env_req_edits.click.general_guidance_env_req_edits();
              envContext.onClickForEdit();
            }}
          >
            {Config.envResultsPage.summary.partFour}
          </UnStyledButton>
        </div>
        <hr />
        <PersonalizedSupport />
        <ContactDep />
        <SeeYourResponses />
      </>
    );
  };

  const lowApplicability = (): ReactElement => {
    analytics.event.gen_guidance_stepper_no_permits_displayed.appears.general_guidance_no_permits_displayed();
    return (
      <>
        <div className={"padding-y-1"}>
          <div>
            <span className={"text-bold margin-bottom-1"}>
              {Config.envResultsPage.lowApplicability.summaryLineOne}
            </span>
            <Content>{Config.envResultsPage.lowApplicability.summaryLineTwo}</Content>
          </div>
        </div>
        <LargeCallout calloutType={"quickReference"}>
          <span>
            {Config.envResultsPage.lowApplicability.callout}
            <UnStyledButton
              className={"margin-left-05"}
              isUnderline
              onClick={() => {
                analytics.event.gen_guidance_stepper_env_req_edits.click.general_guidance_env_req_edits();
                envContext.onClickForEdit();
              }}
            >
              {Config.envResultsPage.lowApplicability.calloutRedo}
            </UnStyledButton>
          </span>
        </LargeCallout>
      </>
    );
  };

  return (
    <>
      <h2>{Config.envResultsPage.title}</h2>
      <Alert variant={"success"}>
        <span className={"margin-right-05"}>{Config.envResultsPage.editInfo}</span>
        <UnStyledButton
          isUnderline
          onClick={() => {
            analytics.event.gen_guidance_stepper_env_req_edits.click.general_guidance_env_req_edits();
            envContext.onClickForEdit();
          }}
        >
          {Config.envResultsPage.editText}
        </UnStyledButton>
      </Alert>
      {isLowApplicability() ? lowApplicability() : highApplicability()}
    </>
  );
};
