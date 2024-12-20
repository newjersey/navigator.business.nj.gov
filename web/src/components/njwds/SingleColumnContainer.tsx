import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  isSmallerWidth?: boolean;
}

export const SingleColumnContainer = (props: Props): ReactElement<any> => {
  return (
    <div
      className={`${
        props.isSmallerWidth ? "grid-container width-100" : "grid-container-widescreen desktop:padding-x-7"
      }`}
    >
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-12 usa-prose">{props.children}</div>
      </div>
    </div>
  );
};
