import {
  CALLOUT_STYLES,
  MiniCalloutProps,
} from "@/components/njwds-extended/callout/calloutHelpers";
import { CalloutLayout } from "@/components/njwds-extended/callout/CalloutLayout";
import type { ReactElement } from "react";

export const MiniCallout = (props: MiniCalloutProps): ReactElement => {
  const styling = CALLOUT_STYLES[props.calloutType];

  return <CalloutLayout styling={styling} headingText={props.headerText} showIcon showHeader />;
};
