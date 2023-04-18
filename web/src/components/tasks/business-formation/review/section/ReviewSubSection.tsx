import { ReactElement, ReactNode } from "react";

interface Props {
  header: string;
  marginOverride?: string;
  children: ReactNode;
}

export const ReviewSubSection = (props: Props): ReactElement => {
  return (
    <>
      <div className={`flex space-between ${props.marginOverride ?? "margin-top-4"}`}>
        <div className={"maxw-mobile-lg"}>
          <h3>{props.header}</h3>
        </div>
      </div>
      {props.children}
    </>
  );
};
