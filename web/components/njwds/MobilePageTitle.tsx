import React, { ReactElement } from "react";
import { useMediaQuery } from "@material-ui/core";
import { MediaQueries } from "@/lib/PageSizes";

interface Props {
  children?: ReactElement;
}

export const MobilePageTitle = (props: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  return (
    <>
      {!isLargeScreen && props.children && (
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <div className="usa-logo">
              <em className="usa-logo__text">{props.children}</em>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
