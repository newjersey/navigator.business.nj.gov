import { ReactElement } from "react";
import { Banner } from "@/components/njwds/Banner";
import { BetaBar } from "@/components/BetaBar";
import { InnovFooter } from "@/components/InnovFooter";
import { LegalMessage } from "@/components/LegalMessage";


interface Props {
  children: React.ReactNode;
  home?: boolean;
  showLegalMessage?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  return (
    <>
      <Banner />
      <BetaBar />
      <div className="fit-screen-content">
      {props.children}
      </div>
      {props.showLegalMessage && <LegalMessage/>}  
      <InnovFooter /> 
  
    </>
  );
};
