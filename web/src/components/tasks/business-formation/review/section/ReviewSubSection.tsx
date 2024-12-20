import { Heading } from "@/components/njwds-extended/Heading";
import { ReactElement, ReactNode } from "react";

interface Props {
  header: string;
  marginOverride?: string;
  testId?: string;
  children: ReactNode;
}

export const ReviewSubSection = (props: Props): ReactElement<any> => {
  return (
    <>
      <div
        data-testid={props.testId}
        className={`flex space-between ${props.marginOverride ?? "margin-top-4"}`}
      >
        <div className={"maxw-mobile-lg"}>
          <Heading level={3}>{props.header}</Heading>
        </div>
      </div>
      {props.children}
    </>
  );
};
