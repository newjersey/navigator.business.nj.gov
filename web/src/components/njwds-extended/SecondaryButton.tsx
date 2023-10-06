import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { ReactElement } from "react";

type OmitGenericButtonProps = Omit<
  GenericButtonProps,
  | "isUnBolded"
  | "isSmallerText"
  | "isLargeButton"
  | "id"
  | "isAriaControls"
  | "isAriaExpanded"
  | "isAriaHaspopup"
  | "className"
>;

interface Props extends OmitGenericButtonProps {
  isColor: "primary" | "border-base-light";
  size?: "small" | "regular";
}

const colors = {
  primary: "usa-button usa-button--outline",
  "border-base-light":
    "usa-button border-base-light bg-transparent text-normal text-base padding-x-1 border-1px hide-unhide-button font-body-2xs",
};

export const SecondaryButton = (props: Props): ReactElement => {
  return (
    <GenericButton
      {...props}
      isVerticalPaddingRemoved={props.size === "small"}
      className={colors[props.isColor]}
    />
  );
};
