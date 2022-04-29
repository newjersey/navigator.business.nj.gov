import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  isWidePage?: boolean;
}

export const SingleColumnContainer = (props: Props): ReactElement => {
  return (
    <div
      className={`${
        props.isWidePage ? "grid-container-widescreen desktop:padding-x-7" : "grid-container width-100"
      }`}
    >
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-12 usa-prose">{props.children}</div>
      </div>
    </div>
  );
};
