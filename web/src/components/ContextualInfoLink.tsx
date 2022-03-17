import { Button } from "@/components/njwds-extended/Button";
import { fetchContextualInfo } from "@/lib/async-content-fetchers/fetchContextualInfo";
import analytics from "@/lib/utils/analytics";
import { ContextualInfoContext } from "@/pages/_app";
import React, { ReactElement, useContext, useState } from "react";

export const ContextualInfoLink = ({ children }: { children: string[] }): ReactElement => {
  const { contextualInfo, setContextualInfo } = useContext(ContextualInfoContext);
  const [cachedContent, setCachedContent] = useState<string>("");

  const displayText = children[0].split("|")[0];
  const contextualInfoId = children[0].split("|")[1];

  const setContext = async (event: React.MouseEvent) => {
    event.preventDefault();
    analytics.event.contextual_link.click.view_sidebar();

    if (cachedContent) {
      setContextualInfo({ ...contextualInfo, isVisible: true, markdown: cachedContent });
    } else {
      const content = await fetchContextualInfo(contextualInfoId);
      setCachedContent(content);
      setContextualInfo({ ...contextualInfo, isVisible: true, markdown: content });
    }
  };

  return (
    <Button style="tertiary" dataTestid={contextualInfoId} onClick={setContext}>
      <span className="dashed-underline border-primary line-height-body-5">{displayText}</span>
    </Button>
  );
};
