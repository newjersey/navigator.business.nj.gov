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
  isColor: "primary" | "border-base-light" | "accent-cooler";
  className?: string;
  size?: "small" | "regular";
}

const colors = {
  primary: "usa-button usa-button--outline",
  "accent-cooler":
    "usa-button border-accent-cooler bg-transparent text-bold text-accent-cooler padding-x-1 border-2px hide-unhide-button-accent-cooler",
  "border-base-light":
    "usa-button border-base-light bg-transparent text-normal text-base padding-x-1 border-1px hide-unhide-button font-body-2xs",
};

export const SecondaryButton = (props: Props): ReactElement => {
  const classNames = `${colors[props.isColor]} ${props.className}`;
  return (
    <GenericButton {...props} isVerticalPaddingRemoved={props.size === "small"} className={classNames} />
  );
};
