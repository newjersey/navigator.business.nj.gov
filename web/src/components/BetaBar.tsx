import { Beta } from "@/display-defaults/Beta";
import React, { ReactElement } from "react";

export const BetaBar = (): ReactElement => {
  return (
    <div className="display-flex flex-justify-center flex-align-center bg-beta font-sans-xs minh-3 margin-auto width-full padding-y-2">
      <span>
        {Beta.betaMainText}
        <a className="usa-link" href={Beta.betaFormLink} target="_blank" rel="noreferrer">
          {Beta.betaFormText}
        </a>
      </span>
    </div>
  );
};
