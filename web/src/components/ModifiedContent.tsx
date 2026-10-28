import type { ReactElement } from "react";
import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";

interface ContentProps {
  children: string;
}

export const ModifiedContent = (props: ContentProps): ReactElement => {
  const updatedContent = useContentModifiedByUserData(props.children ?? "");

  return <>{updatedContent}</>;
};
