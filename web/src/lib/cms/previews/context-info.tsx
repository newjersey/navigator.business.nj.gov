/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextInfoElement } from "@/components/ContextInfoElement";
import { ContextualInfo } from "@/contexts/contextualInfoContext";
import { useEffect, useRef } from "react";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const ContextInfoPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const contextualInfo: ContextualInfo = { markdown: body ?? "", ...data };

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <ContextInfoElement
        header={contextualInfo.header ?? ""}
        markdown={contextualInfo.markdown}
        isVisible={true}
      />
    </div>
  );
};

export default ContextInfoPreview;
