import { CalloutLayout } from "@/components/njwds-extended/callout/CalloutLayout";
import { ConfigType } from "@/contexts/configContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import type { PropsWithChildren, ReactElement } from "react";

import {
  CALLOUT_STYLES,
  CalloutTypes,
  getIconItems,
  LargeCalloutProps,
} from "@/components/njwds-extended/callout/calloutHelpers";

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

export const LargeCallout = (props: PropsWithChildren<LargeCalloutProps>): ReactElement => {
  const { Config } = useConfig();
  const styling = CALLOUT_STYLES[props.calloutType];
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
      showHeader={showHeader}
      iconItems={iconItems}
    >
      {props.children}
    </CalloutLayout>
  );
};
