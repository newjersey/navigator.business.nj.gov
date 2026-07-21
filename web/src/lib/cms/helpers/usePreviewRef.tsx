import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { RefObject, useEffect, useRef } from "react";

export const usePreviewRef = (props: PreviewProps): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const iframeHead = ref?.current?.ownerDocument.head;
    if (!iframeHead) return;

    // Preserve Emotion's runtime <style> tags (used by MUI) before replacing the head,
    // since the replacement would otherwise wipe out dynamically injected CSS
    const emotionStyles = [...iframeHead.querySelectorAll("style[data-emotion]")];

    iframeHead.replaceWith(props.window.parent.document.head.cloneNode(true));

    const newHead = ref?.current?.ownerDocument.head;
    if (newHead) {
      for (const style of emotionStyles) {
        newHead.append(style);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return ref;
};
