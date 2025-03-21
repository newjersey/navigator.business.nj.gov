import { ConfigType } from "@/contexts/configContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import type { PropsWithChildren, ReactNode } from "react";

export type CalloutTypes = "informational" | "conditional" | "warning" | "note";

interface Props {
  calloutType: CalloutTypes;
  showHeader?: string | boolean;
  showIcon?: string | boolean;
  headerText?: string;
  showIconInBody?: string | boolean;
}

interface CalloutMappingObj {
  containerStyling: string;
  headingStyling: string;
  iconStyling: string;
}

export const getStylingForCalloutType = (calloutType: string): CalloutMappingObj => {
  if (calloutType === "informational")
    return {
      containerStyling: "bg-accent-cool-lightest",
      headingStyling: "text-accent-cool-more-dark",
      iconStyling: "callout-informational-icon",
    };
  if (calloutType === "conditional")
    return {
      containerStyling: "bg-primary-extra-light",
      headingStyling: "text-primary-darker",
      iconStyling: "callout-conditional-icon",
    };
  if (calloutType === "warning")
    return {
      containerStyling: "bg-warning-extra-light",
      headingStyling: "text-accent-warm-darker",
      iconStyling: "callout-warning-icon",
    };
  if (calloutType === "note")
    return {
      containerStyling: "bg-base-lightest",
      headingStyling: "text-base-darkest",
      iconStyling: "callout-note-icon",
    };
  return {
    containerStyling: "",
    headingStyling: "",
    iconStyling: "",
  };
};

const getDefaultHeadingTextForCalloutType = (config: ConfigType, calloutType: string): string => {
  if (calloutType === "informational") return config.calloutDefaults.informationalHeadingDefaultText;
  if (calloutType === "note") return config.calloutDefaults.noteHeadingDefaultText;
  if (calloutType === "conditional") return config.calloutDefaults.conditionalHeadingDefaultText;
  if (calloutType === "warning") return config.calloutDefaults.warningHeadingDefaultText;
  return "";
};

export const Callout = (props: PropsWithChildren<Props>): ReactNode => {
  const { Config } = useConfig();
  const showIcon = Boolean(props.showIcon ?? false);
  const showHeader = Boolean(props.showHeader ?? true);
  const showIconInBody = Boolean(props.showIconInBody ?? false);
  let headingText = "";

  if (typeof props.headerText === "string" && props.headerText.length > 0) {
    headingText = props.headerText;
  } else {
    headingText = getDefaultHeadingTextForCalloutType(Config, props.calloutType);
  }

  return (
    <div
      className={`padding-205 radius-md margin-y-2 ${
        getStylingForCalloutType(props.calloutType).containerStyling
      }`}
    >
      {showHeader === true ? (
        <>
          <div className="flex">
            {showIcon && (
              <div
                data-testid={getStylingForCalloutType(props.calloutType).iconStyling}
                className={getStylingForCalloutType(props.calloutType).iconStyling}
                aria-hidden="true"
              />
            )}
            <span className={`text-bold ${getStylingForCalloutType(props.calloutType).headingStyling}`}>
              {headingText}
            </span>
          </div>
          {props.children && <div className="margin-top-105 text-primary-darker">{props.children}</div>}
        </>
      ) : (
        <div className="text-primary-darker flex">
          {showIconInBody && (
            <div
              data-testid={getStylingForCalloutType(props.calloutType).iconStyling}
              className={getStylingForCalloutType(props.calloutType).iconStyling}
              aria-hidden="true"
            />
          )}
          {props.children}
        </div>
      )}
    </div>
  );
};
