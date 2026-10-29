import { type RefObject, useEffect, useRef } from "react";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";

export const usePreviewRef = (props: PreviewProps): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
  }, [ref]);

  return ref;
};
