import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

export const BetaBar = (): ReactElement => {
  return (
    <div className="display-flex flex-justify-center flex-align-center bg-beta font-sans-xs minh-3 margin-auto width-full padding-y-2">
      <span className="margin-left-2 margin-right-2">
        {Config.betaBar.betaMainText}
        <a className="usa-link" href={Config.betaBar.betaFormLink} target="_blank" rel="noreferrer">
          {Config.betaBar.betaFormText}
        </a>
      </span>
    </div>
  );
};
