import React, { ReactElement } from "react";
import { Beta } from "@/display-content/Beta";

export const BetaBar = (): ReactElement => {
  return (
    <div className="beta-bar">
      <div className="fdr fac fjc margin-auto width-full padding-y-2">
        <span className="usa-tag bg-base-yellow font-size-75 text-bold text-accent-warm">
          {Beta.betaIconText}
        </span>
        <span className="margin-x-05">
          {Beta.betaMainText}
          <a className="usa-link" href={Beta.betaFormLink} target="_blank" rel="noreferrer">
            {Beta.betaFormText}
          </a>
        </span>
      </div>
    </div>
  );
};
