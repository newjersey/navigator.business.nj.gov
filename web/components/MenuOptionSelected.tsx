import { Icon } from "./njwds/Icon";
import React, { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const MenuOptionSelected = (props: Props): ReactElement => (
  <>
    <span className="padding-right-05">
      <Icon>check</Icon>
    </span>
    <span className="text-bold">{props.children}</span>
  </>
);
