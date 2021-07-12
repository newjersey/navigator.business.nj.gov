import { ReactElement } from "react";
import { Banner } from "@/components/njwds/Banner";
import { BetaBar } from "@/components/BetaBar";
import { InnovFooter } from "@/components/InnovFooter";

interface Props {
  children: React.ReactNode;
  home?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  return (
    <>
      <Banner />
      <BetaBar />
      {props.children}
      <InnovFooter />
    </>
  );
};
