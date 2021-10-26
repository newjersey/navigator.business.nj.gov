import React, { ReactElement } from "react";
import { Beta } from "@/display-content/Beta";

export const BetaBar = (): ReactElement => {
  return (
    <div className="bg-base-lightest font-sans-3xs minh-3">
      <div className="fdr fac fjc margin-auto width-full padding-y-2">
        <span className="usa-tag bg-accent-warm-lighter font-sans-3xs text-bold text-accent-warm-darker padding-y-05">
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
