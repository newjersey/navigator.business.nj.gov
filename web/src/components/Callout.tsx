import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export type CalloutTypes = "informational" | "conditional" | "warning" | "note";

interface Props {
  calloutType: CalloutTypes;
  header?: string;
  children: string;
  icon?: boolean;
}

interface CalloutMappingObj {
  containerStyling: string;
  headingStyling: string;
  iconStyling: string;
}

export const calloutComponentMapping: Record<string, CalloutMappingObj> = {
  informational: {
    containerStyling: "bg-accent-cool-lightest",
    headingStyling: "text-accent-cool-more-dark",
    iconStyling: "callout-informational-icon",
  },
  conditional: {
    containerStyling: "bg-primary-extra-light",
    headingStyling: "text-primary-darker",
    iconStyling: "callout-conditional-icon",
  },
  warning: {
    containerStyling: "bg-warning-extra-light",
    headingStyling: "text-accent-warm-darker",
    iconStyling: "callout-warning-icon",
  },
  note: {
    containerStyling: "bg-base-lightest",
    headingStyling: "text-base-darkest",
    iconStyling: "callout-note-icon",
  },
};

export const Callout = (props: Props): ReactElement => {
  const { Config } = useConfig();
  let headingText = "";

  if (props.calloutType === "informational")
    headingText = Config.calloutDefaults.informationalHeadingDefaultText;
  if (props.calloutType === "note") headingText = Config.calloutDefaults.noteHeadingDefaultText;
  if (props.calloutType === "conditional") headingText = Config.calloutDefaults.conditionalHeadingDefaultText;
  if (props.calloutType === "warning") headingText = Config.calloutDefaults.warningHeadingDefaultText;

  return (
    <div
      className={`padding-205 radius-md margin-bottom-2 ${
        calloutComponentMapping[props.calloutType].containerStyling
      }`}
    >
      <div className="flex">
        {props.icon && (
          <div
            data-testid={calloutComponentMapping[props.calloutType].iconStyling}
            className={calloutComponentMapping[props.calloutType].iconStyling}
            aria-hidden="true"
          />
        )}
        <span className={`text-bold ${calloutComponentMapping[props.calloutType].headingStyling}`}>
          {props.header ?? headingText}
        </span>
      </div>
      <div className="margin-top-105 text-primary-darker">{props.children}</div>
    </div>
  );
};
