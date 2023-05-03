import { Content } from "@/components/Content";
import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  label: string;
  labelContextualInfo?: string;
  value: string | undefined;
  dataTestId?: string;
  marginOverride?: string;
  formatter?: (value: string) => string;
}

export const ReviewLineItem = (props: Props): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  return (
    <div
      className={`${isTabletAndUp ? "grid-row" : "display-block"} ${props.marginOverride || "margin-top-1"}`}
      data-testid={props.dataTestId}
    >
      <div className="text-bold grid-col flex-4">
        {props.labelContextualInfo ? (
          <ContextualInfoButton text={`${props.label}:`} id={props.labelContextualInfo} />
        ) : (
          `${props.label}:`
        )}
      </div>
      {props.value ? (
        <Content className={"grid-col flex-8 text-italic"}>
          {props.formatter ? props.formatter(props.value) : props.value}
        </Content>
      ) : (
        <div className={"grid-col flex-8"}>
          <ReviewNotEntered />
        </div>
      )}
    </div>
  );
};
