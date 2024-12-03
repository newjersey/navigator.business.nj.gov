import { Icon } from "@/components/njwds/Icon";
import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  secondaryText?: string;
}

export const MenuOptionSelected = (props: Props): ReactElement => {
  return (
    <>
      <div className="flex flex-row">
        <div className="padding-right-05 flex fac">
          <Icon iconName="check" />
        </div>
        <div className="text-bold" data-testid="option">
          {props.children}
        </div>
      </div>

      {props.secondaryText && (
        <div className="font-body-3xs text-base-dark text-bold padding-left-205 text-wrap">
          {props.secondaryText}
        </div>
      )}
    </>
  );
};
