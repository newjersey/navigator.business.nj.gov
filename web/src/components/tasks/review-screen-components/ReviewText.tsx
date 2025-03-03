import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewNotEntered } from "@/components/tasks/review-screen-components/ReviewNotEntered";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  isExpandable?: boolean;
  text?: string;
  dataTestId?: string;
}

export const ReviewText = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <>
      {props.isExpandable && props.text ? (
        <ExpandCollapseString
          text={props.text}
          dataTestId={props.dataTestId}
          viewMoreText={Config.formation.general.viewMoreButtonText}
          viewLessText={Config.formation.general.viewLessButtonText}
          lines={2}
        />
      ) : (
        <div
          className={`${isTabletAndUp ? "display-flex" : "display-block"}`}
          {...(props.dataTestId ? { "data-testid": props.dataTestId } : {})}
        >
          <div>{props.text || <ReviewNotEntered />}</div>
        </div>
      )}
    </>
  );
};
