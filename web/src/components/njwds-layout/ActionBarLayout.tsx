import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  stackOnLeft?: ReactNode;
  alignLeft?: boolean;
  disableReverseOrderInMobile?: boolean;
}
export const ActionBarLayout = (props: Props): ReactElement => {
  return (
    <div
      className={`mobile-lg:display-flex ${
        props.stackOnLeft || props.alignLeft ? "mobile-lg:flex-justify" : "mobile-lg:flex-justify-end"
      } `}
    >
      {props.stackOnLeft && (
        <div className="margin-bottom-2 mobile-lg:margin-bottom-0">{props.stackOnLeft}</div>
      )}

      {props.disableReverseOrderInMobile ? (
        <>{props.children}</>
      ) : (
        <ReverseOrderInMobile className="mobile-lg:flex-justify-end">{props.children}</ReverseOrderInMobile>
      )}
    </div>
  );
};
