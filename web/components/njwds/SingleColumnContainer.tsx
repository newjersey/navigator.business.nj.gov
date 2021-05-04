import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
}

export const SingleColumnContainer = (props: Props): ReactElement => {
  return (
    <div className="grid-container width-100">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-12 usa-prose">{props.children}</div>
      </div>
    </div>
  );
};
