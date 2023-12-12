import { ReactElement } from "react";

interface Props {
  children: ReactElement;
  className?: string;
}
export const ReverseOrderInMobile = (props: Props): ReactElement => (
  <div className={`flex flex-column-reverse mobile-lg:flex-row ${props.className}`}>{props.children}</div>
);
