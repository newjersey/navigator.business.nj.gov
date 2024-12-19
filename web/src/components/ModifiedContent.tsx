import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";
import { ReactElement } from "react";

interface ContentProps {
  children: string;
}

export const ModifiedContent = (props: ContentProps): ReactElement<any> => {
  const updatedContent = useContentModifiedByUserData(props.children ?? "");

  return <>{updatedContent}</>;
};
