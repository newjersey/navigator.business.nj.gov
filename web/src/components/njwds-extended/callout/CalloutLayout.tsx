import { CalloutStyling, IconTextProps } from "@/components/njwds-extended/callout/calloutHelpers";
import { IconTextList } from "@/components/njwds-extended/callout/CalloutIcons";
import type { ReactElement, ReactNode } from "react";

export interface CalloutLayoutProps {
  styling: CalloutStyling;
  headingText?: string;
  showIcon?: boolean;
  showHeader: boolean;
  iconItems?: IconTextProps[];
  children?: ReactNode;
}

export const CalloutLayout = (props: CalloutLayoutProps): ReactElement => {
  if (props.showHeader && props.headingText) {
    return (
      <div
        className={`padding-205 radius-md margin-y-2 ${props.styling.backgroundColor} ${props.styling.textColor}`}
      >
        <div className="flex">
          {props.showIcon && (
            <div
              className={props.styling.headerIcon}
              aria-hidden="true"
              data-testid="callout-icon"
            />
          )}
          <span className="text-bold">{props.headingText}</span>
        </div>
        {(props.children || (props.iconItems && props.iconItems.length > 0)) && (
          <div className="margin-top-105">
            <div>{props.children}</div>
            <IconTextList items={props.iconItems} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`padding-205 radius-md margin-y-2 ${props.styling.backgroundColor}`}>
      <div className="text-primary-darker">
        <div className="flex">{props.children}</div>
        <IconTextList items={props.iconItems} />
      </div>
    </div>
  );
};
