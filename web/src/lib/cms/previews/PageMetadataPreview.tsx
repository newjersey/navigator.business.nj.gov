import type { ReactElement } from "react";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";

const PageMetaDataPreview = (): ReactElement => {
  return (
    <div className="cms" style={{ margin: 40, pointerEvents: "none" }}>
      <div>{getNextSeoTitle("Business")}</div>
    </div>
  );
};

export default PageMetaDataPreview;
