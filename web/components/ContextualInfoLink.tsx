import React, { ReactElement, useContext, useState } from "react";
import { ContextualInfoContext } from "@/pages/_app";
import { fetchContextualInfo } from "@/lib/async-content-fetchers/fetchContextualInfo";
import analytics from "@/lib/utils/analytics";

export const ContextualInfoLink = ({ children }: { children: string[] }): ReactElement => {
  const { setContextualInfoMd } = useContext(ContextualInfoContext);
  const [cachedContent, setCachedContent] = useState<string>("");

  const displayText = children[0].split("|")[0];
  const contextualInfoId = children[0].split("|")[1];

  const setContext = async (event: React.MouseEvent) => {
    event.preventDefault();
    analytics.event.contextual_link.click.view_sidebar();

    if (cachedContent) {
      setContextualInfoMd(cachedContent);
    } else {
      const contextualInfoMd = await fetchContextualInfo(contextualInfoId);
      setCachedContent(contextualInfoMd);
      setContextualInfoMd(contextualInfoMd);
    }
  };

  return (
    <>
      <button
        className="usa-button--unstyled cursor-pointer weight-inherit style-inherit"
        data-contextual-info-id={contextualInfoId}
        onClick={setContext}
      >
        <span className="dashed-underline border-primary line-height-body-5">{displayText}</span>
      </button>
    </>
  );
};
