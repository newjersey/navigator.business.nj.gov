import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { ReactElement } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ContextualInfoLink = (props: any): ReactElement => {
  // React 19 compatibility: children might be a string or an array
  const childrenText = Array.isArray(props.children) ? props.children[0] : props.children;
  const displayText = childrenText.split("|")[0];
  const contextualInfoId = childrenText.split("|")[1];

  return <ContextualInfoButton text={displayText} id={contextualInfoId} />;
};
