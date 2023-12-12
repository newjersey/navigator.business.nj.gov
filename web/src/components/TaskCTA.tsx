/* eslint-disable unicorn/filename-case */
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  link?: string;
  text?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const TaskCTA = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const isMobileAndUp = useMediaQuery(MediaQueries.mobileAndUp);

  if (props.onClick) {
    return (
      <div
        className={`bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg ${
          isMobileAndUp ? "flex flex-column flex-align-end" : ""
        }`}
      >
        <div>
          <ReverseOrderInMobile>
            <>
              {props.children}
              <PrimaryButton isColor="primary" isRightMarginRemoved={true} onClick={props.onClick}>
                {props.text || Config.taskDefaults.defaultCallToActionText}
              </PrimaryButton>
            </>
          </ReverseOrderInMobile>
        </div>
      </div>
    );
  }
  if (props.link) {
    return (
      <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
        {props.children}
        <a href={props.link} target="_blank" rel="noreferrer noopener">
          <PrimaryButton
            isColor="primary"
            isRightMarginRemoved={true}
            onClick={(): void =>
              analytics.event.task_primary_call_to_action.click.open_external_website(
                props.text || Config.taskDefaults.defaultCallToActionText,
                props.link as string
              )
            }
          >
            {props.text || Config.taskDefaults.defaultCallToActionText}
          </PrimaryButton>
        </a>
      </div>
    );
  } else {
    return <></>;
  }
};
