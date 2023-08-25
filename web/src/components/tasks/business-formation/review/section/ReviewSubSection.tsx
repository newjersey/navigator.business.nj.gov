import { ReactElement, ReactNode } from "react";

interface Props {
  header: string;
  marginOverride?: string;
  testId?: string;
  children: ReactNode;
}

export const ReviewSubSection = (props: Props): ReactElement => {
  return (
    <>
      <div
        data-testid={props.testId}
        className={`flex space-between ${props.marginOverride ?? "margin-top-4"}`}
      >
        <div className={"maxw-mobile-lg"}>
          <h3>{props.header}</h3>
        </div>
      </div>
      {props.children}
    </>
  );
};
