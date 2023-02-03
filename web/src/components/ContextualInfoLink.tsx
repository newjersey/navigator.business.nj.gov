import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { fetchContextualInfo } from "@/lib/async-content-fetchers/fetchContextualInfo";
import analytics from "@/lib/utils/analytics";
import React, { ReactElement, useContext, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ContextualInfoLink = (props: any): ReactElement => {
  const { contextualInfo, setContextualInfo } = useContext(ContextualInfoContext);
  const [cachedContent, setCachedContent] = useState<ContextualInfo>();

  const displayText = props.children[0].split("|")[0];
  const contextualInfoId = props.children[0].split("|")[1];

  const setContext = async (event: React.MouseEvent) => {
    event.preventDefault();
    analytics.event.contextual_link.click.view_sidebar();

    if (cachedContent) {
      setContextualInfo({
        ...contextualInfo,
        isVisible: true,
        markdown: cachedContent.markdown,
        header: cachedContent.header,
      });
    } else {
      const content = await fetchContextualInfo(contextualInfoId);
      setCachedContent(content);
      setContextualInfo({
        ...contextualInfo,
        isVisible: true,
        header: content.header,
        markdown: content.markdown,
      });
    }
  };

  return (
    <UnStyledButton style="tertiary" dataTestid={contextualInfoId} onClick={setContext}>
      <span className="dashed-underline line-height-body-5">
        <PureMarkdownContent>{displayText}</PureMarkdownContent>
      </span>
    </UnStyledButton>
  );
};
