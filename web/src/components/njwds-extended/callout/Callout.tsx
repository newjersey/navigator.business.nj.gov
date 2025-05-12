import { CalloutLayout, CalloutStyling } from "@/components/njwds-extended/callout/CalloutLayout";
import { ConfigType } from "@/contexts/configContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import type { PropsWithChildren, ReactElement } from "react";

import { getIconItems, IconProps } from "@/components/njwds-extended/callout/calloutHelpers";

export type CalloutTypes = "informational" | "conditional" | "warning" | "quickReference";

export interface CalloutProps extends IconProps {
  calloutType: CalloutTypes;
  showHeader?: string | boolean;
  showIcon?: string | boolean;
  headerText?: string;
}

const CALLOUT_STYLES: Record<CalloutTypes, CalloutStyling> = {
  informational: {
    backgroundColor: "bg-accent-cool-lightest",
    textColor: "text-accent-cool-more-dark",
    headerIcon: "callout-informational-icon",
  },
  conditional: {
    backgroundColor: "bg-primary-extra-light",
    textColor: "text-primary-darker",
    headerIcon: "callout-conditional-icon",
  },
  warning: {
    backgroundColor: "bg-warning-extra-light",
    textColor: "text-accent-warm-darker",
    headerIcon: "callout-warning-icon",
  },
  quickReference: {
    backgroundColor: "bg-base-lightest",
    textColor: "text-primary-darker",
    headerIcon: "",
  },
};

const HEADING_TEXT_KEYS: Record<CalloutTypes, keyof ConfigType["calloutDefaults"]> = {
  informational: "informationalHeadingDefaultText",
  conditional: "conditionalHeadingDefaultText",
  warning: "warningHeadingDefaultText",
  quickReference: "quickReferenceHeadingDefaultText",
};

const getDefaultHeadingText = (config: ConfigType, calloutType: CalloutTypes): string => {
  const key = HEADING_TEXT_KEYS[calloutType];
  return key ? config.calloutDefaults[key] : "";
};

export const Callout = (props: PropsWithChildren<CalloutProps>): ReactElement => {
  const { Config } = useConfig();
  const styling = CALLOUT_STYLES[props.calloutType];
  const showIcon = Boolean(props.showIcon) && props.calloutType !== "quickReference";
  const showHeader = Boolean(props.showHeader ?? false);

  const headingText =
    typeof props.headerText === "string" && props.headerText.length > 0
      ? props.headerText
      : getDefaultHeadingText(Config, props.calloutType);

  const iconItems = getIconItems(props);

  return (
    <CalloutLayout
      styling={styling}
      headingText={headingText}
      showIcon={showIcon}
      showHeader={showHeader}
      iconItems={iconItems}
    >
      {props.children}
    </CalloutLayout>
  );
};
