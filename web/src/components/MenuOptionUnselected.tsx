import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  secondaryText?: ReactNode;
}

export const MenuOptionUnselected = (props: Props): ReactElement => {
  return (
    <>
      <div className="padding-left-205 text-wrap" data-testid="option">
        {props.children}
      </div>

      {props.secondaryText && (
        <div className="font-body-3xs text-base-dark padding-left-205 text-wrap">{props.secondaryText}</div>
      )}
    </>
  );
};
