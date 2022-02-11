/* eslint-disable @typescript-eslint/no-explicit-any */
import { Certification } from "@/lib/types/types";
import { CertificationElement } from "@/pages/certification/[certificationUrlSlug]";
import { useEffect, useRef } from "react";
type Props = {
  entry?: any;
  window: Window;
  document: Document;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const CertificationsPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const certification: Certification = { contentMd: body, ...data };

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <CertificationElement certification={certification} />
    </div>
  );
};

export default CertificationsPreview;
