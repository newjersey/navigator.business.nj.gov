import { useConfig } from "@/lib/data-hooks/useConfig";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import type { PropsWithChildren, ReactElement } from "react";

import {
  CALLOUT_STYLES,
  CalloutTypes,
  getIconItems,
  LargeCalloutProps,
} from "@/components/njwds-extended/callout/calloutHelpers";
import { IconTextList } from "@/components/njwds-extended/callout/CalloutIcons";

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

  const headingText =
    typeof props.headerText === "string" && props.headerText.length > 0
      ? props.headerText
      : getDefaultHeadingText(Config, props.calloutType);

  const iconItems = getIconItems(props);

  if (props.showHeader && headingText) {
    return (
      <div
        className={`padding-205 radius-md margin-y-2 ${styling.backgroundColor} ${styling.textColor}`}
      >
        <span className="text-bold">{headingText}</span>
        {(props.children || (iconItems && iconItems.length > 0)) && (
          <div className="margin-top-105">
            <div>{props.children}</div>
            <IconTextList items={iconItems} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`padding-205 radius-md margin-y-2 ${styling.backgroundColor}`}>
      <div className="text-primary-darker">
        <div className="flex">{props.children}</div>
        <IconTextList items={iconItems} />
      </div>
    </div>
  );
};
