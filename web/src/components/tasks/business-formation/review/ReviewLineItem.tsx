import { Content } from "@/components/Content";
import { ReactElement } from "react";

interface Props {
  label: string;
  value: string;
}

export const ReviewLineItem = (props: Props): ReactElement => {
  return (
    <div className="display-block tablet:display-flex margin-top-1">
      <div className="text-bold width-11rem">
        <Content>{props.label}</Content>
      </div>
      <Content>{props.value}</Content>
    </div>
  );
};
