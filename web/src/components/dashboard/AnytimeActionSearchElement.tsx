import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  secondaryText?: ReactNode;
}

export const AnytimeActionSearchElement = (props: Props): ReactElement => {
  return (
    <>
      <div className={`padding-left-1 text-wrap padding-right-205`} data-testid="option">
        {props.children}
      </div>

      {props.secondaryText && (
        <div className={`padding-left-1 font-body-2xs text-base text-wrap`}>
          {props.secondaryText}
        </div>
      )}
    </>
  );
};
