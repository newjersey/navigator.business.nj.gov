import { ReactElement } from "react";

interface Props {
  ariaHidden?: boolean;
  customMargin?: string;
}
export const HorizontalLine = (props: Props): ReactElement => {
  return (
    <div>
      <hr className={props.customMargin ?? "margin-y-2"} aria-hidden={props?.ariaHidden} />
    </div>
  );
};
