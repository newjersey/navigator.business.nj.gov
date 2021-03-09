import { ReactElement } from "react";
import { Banner } from "./njwds/Banner";

interface Props {
  children: React.ReactNode;
  home?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  return (
    <>
      <Banner />
      {props.children}
    </>
  );
};
