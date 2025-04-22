import { Content } from "@/components/Content";
import { ReviewLineItem } from "@/components/tasks/review-screen-components/ReviewLineItem";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  value: boolean | undefined;
}

export const ReviewIsVeteranNonprofit = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const displayResponse = (): ReactElement => {
    if (props.value) {
      return (
        <Content>
          {Config.formation.fields.isVeteranNonprofit.reviewTextYes}
        </Content>
      );
    } else if (props.value === false) {
      return (
        <Content>
          {Config.formation.fields.isVeteranNonprofit.reviewTextNo}
        </Content>
      );
    } else {
      return (
        <ReviewLineItem
          label={Config.formation.fields.isVeteranNonprofit.label}
          value={""}
        />
      );
    }
  };
  return (
    <div className="margin-top-1" data-testid="isVeteranNonprofit">
      {displayResponse()}
    </div>
  );
};
