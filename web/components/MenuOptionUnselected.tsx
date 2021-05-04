import React, { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  secondaryText?: string;
}

export const MenuOptionUnselected = (props: Props): ReactElement => (
  <div className="fdc">
    <div>
      <span className="padding-right-2">&nbsp;</span>
      {props.children}
    </div>
    {props.secondaryText && (
      <div className="font-body-3xs text-base-dark">
        <span className="padding-right-2">&nbsp;</span>
        {props.secondaryText}
      </div>
    )}
  </div>
);
