import React, { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  secondaryText?: ReactNode;
}

export const MenuOptionUnselected = (props: Props): ReactElement => (
  <div className="fdc">
    <div>
      <span className="padding-left-205">{props.children}</span>
    </div>
    {props.secondaryText && (
      <div className="font-body-3xs text-base-dark">
        <span className="padding-left-205 text-wrap display-inline-block">{props.secondaryText}</span>
      </div>
    )}
  </div>
);
