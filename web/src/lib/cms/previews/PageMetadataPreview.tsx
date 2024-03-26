import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { ReactElement } from "react";

const PageMetaDataPreview = (): ReactElement => {
  return (
    <div className="cms" style={{ margin: 40, pointerEvents: "none" }}>
      <div>{getNextSeoTitle("Business")}</div>
    </div>
  );
};

export default PageMetaDataPreview;
