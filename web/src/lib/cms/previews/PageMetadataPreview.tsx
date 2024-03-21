import { getFormattedMetadata } from "@/lib/domain-logic/getFormattedMetadata";
import { ReactElement } from "react";

const PageMetaDataPreview = (): ReactElement => {
  return (
    <div className="cms" style={{ margin: 40, pointerEvents: "none" }}>
      <div>{getFormattedMetadata("Business")}</div>
    </div>
  );
};

export default PageMetaDataPreview;
