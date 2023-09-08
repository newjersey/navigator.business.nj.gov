import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  willPracticeLaw: boolean | undefined;
}

export const ReviewWillPracticeLaw = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const displayResponse = (): ReactElement => {
    if (props.willPracticeLaw === undefined) {
      return <ReviewNotEntered />;
    } else {
      return <>{props.willPracticeLaw ? "Yes" : "No"}</>;
    }
  };
  return (
    <ReviewSubSection header={Config.formation.fields.willPracticeLaw.label} marginOverride="margin-top-0">
      {displayResponse()}
    </ReviewSubSection>
  );
};
