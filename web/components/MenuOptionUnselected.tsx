import React, { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const MenuOptionUnselected = (props: Props): ReactElement => (
  <>
    <span className="padding-right-2">&nbsp;</span>
    {props.children}
  </>
);
