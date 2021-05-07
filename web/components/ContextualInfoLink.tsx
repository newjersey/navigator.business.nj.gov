import React, { ReactElement, useContext, useState } from "react";
import { ContextualInfoContext } from "@/pages/_app";
import { fetchContextualInfo } from "@/lib/async-content-fetchers/fetchContextualInfo";

export const ContextualInfoLink = ({ children }: { children: string[] }): ReactElement => {
  const { setContextualInfoMd } = useContext(ContextualInfoContext);
  const [cachedContent, setCachedContent] = useState<string>("");

  const displayText = children[0].split("|")[0];
  const contextualInfoId = children[0].split("|")[1];

  const setContext = async (event: React.MouseEvent) => {
    event.preventDefault();
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
      <button className="usa-button--unstyled cursor-pointer" onClick={setContext}>
        <span className="dashed-underline border-primary line-height-body-5">{displayText}</span>
      </button>
    </>
  );
};
