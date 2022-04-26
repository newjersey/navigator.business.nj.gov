/* eslint-disable @typescript-eslint/no-explicit-any */
import { Funding } from "@/lib/types/types";
import { FundingElement } from "@/pages/funding/[fundingUrlSlug]";
import { useEffect, useRef } from "react";
type Props = {
  readonly entry?: any;
  readonly window: Window;
  readonly document: Document;
  readonly widgetsFor: (string: string) => any;
  readonly widgetFor: (string: string) => any;
  readonly getAsset: (string: string) => any;
};

const FundingsPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const funding: Funding = { contentMd: body ?? "", ...data };

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <FundingElement funding={funding} />
    </div>
  );
};

export default FundingsPreview;
