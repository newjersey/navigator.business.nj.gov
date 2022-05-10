/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { RoadmapSidebarCard } from "@/components/roadmap/RoadmapSidebarCard";
import { RoadmapSidebarCardContent } from "@/lib/static/loadDisplayContent";
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

  const contentMd = body;
  const card: RoadmapSidebarCardContent = { ...data };

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <RoadmapSidebarCard
        color={card.color}
        shadowColor={card.shadowColor}
        headerText={card.header}
        imagePath={card.imgPath}
      >
        <Content>{contentMd}</Content>
      </RoadmapSidebarCard>
    </div>
  );
};

export default RoadmapSidebarCardPreview;
