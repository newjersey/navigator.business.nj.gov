import { Content } from "@/components/Content";
import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  value: boolean | undefined;
}

export const ReviewIsVeteranNonprofit = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  const displayResponse = (): ReactElement<any> => {
    if (props.value) {
      return <Content>{Config.formation.fields.isVeteranNonprofit.reviewTextYes}</Content>;
    } else if (props.value === false) {
      return <Content>{Config.formation.fields.isVeteranNonprofit.reviewTextNo}</Content>;
    } else {
      return <ReviewLineItem label={Config.formation.fields.isVeteranNonprofit.label} value={""} />;
    }
  };
  return (
    <div className="margin-top-1" data-testid="isVeteranNonprofit">
      {displayResponse()}
    </div>
  );
};
