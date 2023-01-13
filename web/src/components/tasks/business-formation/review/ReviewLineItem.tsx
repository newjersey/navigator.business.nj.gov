import { Content } from "@/components/Content";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  label: string;
  value: string;
  marginOverride?: string;
}

export const ReviewLineItem = (props: Props): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <div
      className={`${isTabletAndUp ? "display-flex" : "display-block"} ${
        props.marginOverride || "margin-top-1"
      }`}
    >
      <div className="text-bold width-11rem">
        <Content>{props.label}</Content>
      </div>
      <Content>{props.value}</Content>
    </div>
  );
};
