/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filing } from "@/lib/types/types";
import { FilingElement } from "@/pages/filings/[filingUrlSlug]";
import { useEffect, useRef } from "react";
type Props = {
  entry?: any;
  window: Window;
  document: Document;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const FilingsPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const filing: Filing = { contentMd: body ?? "", ...data };

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <FilingElement filing={filing} dueDate={"01/01/2024"} preview />
    </div>
  );
};

export default FilingsPreview;
