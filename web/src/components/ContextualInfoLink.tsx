import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { ReactElement } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ContextualInfoLink = (props: any): ReactElement<any> => {
  const displayText = props.children[0].split("|")[0];
  const contextualInfoId = props.children[0].split("|")[1];

  return <ContextualInfoButton text={displayText} id={contextualInfoId} />;
};
