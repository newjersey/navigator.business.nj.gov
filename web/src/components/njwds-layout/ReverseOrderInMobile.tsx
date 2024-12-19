import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}
export const ReverseOrderInMobile = (props: Props): ReactElement<any> => (
  <div className={`display-flex flex-column-reverse mobile-lg:flex-row ${props.className}`}>
    {props.children}
  </div>
);
