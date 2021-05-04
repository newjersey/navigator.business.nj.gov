import { Icon } from "./njwds/Icon";
import React, { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  secondaryText?: string;
}

export const MenuOptionSelected = (props: Props): ReactElement => (
  <div className="fdc">
    <div>
      <span className="padding-right-05">
        <Icon>check</Icon>
      </span>
      <span className="text-bold">{props.children}</span>
    </div>
    {props.secondaryText && (
      <div className="font-body-3xs text-base-dark">
        <span className="padding-right-2">&nbsp;</span>
        <span className="text-bold">{props.secondaryText}</span>
      </div>
    )}
  </div>
);
