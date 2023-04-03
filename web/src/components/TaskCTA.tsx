/* eslint-disable unicorn/filename-case */
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, ReactNode } from "react";

interface Props {
  link?: string;
  text?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const TaskCTA = (props: Props): ReactElement => {
  if (!props.link) {
    return <></>;
  }

  if (props.onClick) {
    return (
      <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
        {props.children}
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          onClick={(): void => {
            analytics.event.task_primary_call_to_action.click.open_external_website();
            if (props.onClick) {
              props.onClick();
            }
          }}
        >
          {props.text || Config.taskDefaults.defaultCallToActionText}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4 radius-bottom-lg">
      {props.children}
      <a href={props.link} target="_blank" rel="noreferrer noopener">
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          onClick={analytics.event.task_primary_call_to_action.click.open_external_website}
        >
          {props.text || Config.taskDefaults.defaultCallToActionText}
        </PrimaryButton>
      </a>
    </div>
  );
};
