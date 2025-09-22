import { Content } from "@/components/Content";
import {
  CALLOUT_STYLES,
  MiniCalloutProps,
} from "@/components/njwds-extended/callout/calloutHelpers";
import type { ReactElement } from "react";

export const MiniCallout = (props: MiniCalloutProps): ReactElement => {
  const styling = CALLOUT_STYLES[props.calloutType];

  return (
    <div
      className={`padding-205 radius-md margin-y-2 ${styling.backgroundColor} ${styling.textColor}`}
    >
      <div className="flex">
        <div className={styling.headerIcon} aria-hidden="true" data-testid="callout-icon" />
        <Content>{props.headerText}</Content>
      </div>
    </div>
  );
};
