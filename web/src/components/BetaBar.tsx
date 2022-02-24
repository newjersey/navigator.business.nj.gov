import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";

export const BetaBar = (): ReactElement => {
  return (
    <div className="display-flex flex-justify-center flex-align-center bg-beta font-sans-xs minh-3 margin-auto width-full padding-y-2">
      <span className="margin-left-2 margin-right-2">
        {Defaults.betaBar.betaMainText}
        <a className="usa-link" href={Defaults.betaBar.betaFormLink} target="_blank" rel="noreferrer">
          {Defaults.betaBar.betaFormText}
        </a>
      </span>
    </div>
  );
};
