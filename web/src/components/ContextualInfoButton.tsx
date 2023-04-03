import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { fetchContextualInfo } from "@/lib/async-content-fetchers/fetchContextualInfo";
import analytics from "@/lib/utils/analytics";
import React, { ReactElement, useContext, useState } from "react";

interface Props {
  text: string;
  id: string;
}

export const ContextualInfoButton = (props: Props): ReactElement => {
  const { contextualInfo, setContextualInfo } = useContext(ContextualInfoContext);
  const [cachedContent, setCachedContent] = useState<ContextualInfo>();

  const setContext = async (event: React.MouseEvent): Promise<void> => {
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
      const content = await fetchContextualInfo(props.id);
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
    <UnStyledButton style="tertiary" dataTestid={props.id} onClick={setContext}>
      <span className="dashed-underline line-height-body-5">
        <PureMarkdownContent>{props.text}</PureMarkdownContent>
      </span>
    </UnStyledButton>
  );
};
