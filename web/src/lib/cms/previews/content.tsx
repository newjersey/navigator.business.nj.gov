/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { useEffect, useRef } from "react";
type Props = {
  readonly entry?: any;
  readonly window: Window;
  readonly document: Document;
  readonly widgetsFor: (string: string) => any;
  readonly widgetFor: (string: string) => any;
  readonly getAsset: (string: string) => any;
};

const ContentPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Content>{body}</Content>
    </div>
  );
};

export default ContentPreview;
