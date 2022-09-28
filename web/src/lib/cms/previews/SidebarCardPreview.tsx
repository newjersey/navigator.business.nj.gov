/* eslint-disable @typescript-eslint/no-explicit-any */
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import { SidebarCardContent } from "@/lib/types/types";
import { useEffect, useRef } from "react";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const RoadmapSidebarCardPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const card: SidebarCardContent = { ...data, contentMd: body };

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <SidebarCard card={card} />
    </div>
  );
};

export default RoadmapSidebarCardPreview;
