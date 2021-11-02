import React, { ReactElement } from "react";
import { Beta } from "@/display-content/Beta";
import { Tag } from "@/components/njwds-extended/Tag";

export const BetaBar = (): ReactElement => {
  return (
    <div className="display-flex flex-justify-center flex-align-center bg-base-lightest font-sans-xs minh-3 margin-auto width-full padding-y-2">
      <Tag tagVariant="accent-warm" className="text-bold">
        {Beta.betaIconText}
      </Tag>
      <span className="margin-left-05">
        {Beta.betaMainText}
        <a className="usa-link" href={Beta.betaFormLink} target="_blank" rel="noreferrer">
          {Beta.betaFormText}
        </a>
      </span>
    </div>
  );
};
