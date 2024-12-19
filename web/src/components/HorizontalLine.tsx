import { ReactElement } from "react";

interface Props {
  ariaHidden?: boolean;
}
export const HorizontalLine = (props: Props): ReactElement<any> => {
  return (
    <div>
      <hr className="margin-y-2" aria-hidden={props?.ariaHidden} />
    </div>
  );
};
