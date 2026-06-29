import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export const ContextualInfoLink = (props: Props): ReactElement => {
  const children = Array.isArray(props.children) ? props.children : [props.children];
  const contextualInfoContent = typeof children[0] === "string" ? children[0] : "";
  const [displayText, contextualInfoId = ""] = contextualInfoContent.split("|");

  return <ContextualInfoButton text={displayText} id={contextualInfoId} />;
};
