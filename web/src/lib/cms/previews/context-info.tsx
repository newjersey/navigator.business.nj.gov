/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextInfoElement } from "@/components/ContextualInfoPanel";
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

  const { body } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <ContextInfoElement markdown={body ?? ""} isVisible={true} />
    </div>
  );
};

export default ContextInfoPreview;
