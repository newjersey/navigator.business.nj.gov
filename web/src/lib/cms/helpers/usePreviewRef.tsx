import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { RefObject, useEffect, useRef } from "react";

export const usePreviewRef = (props: PreviewProps): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return ref;
};
