import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { ReactElement } from "react";

type OmitGenericButtonProps = Omit<
  GenericButtonProps,
  | "isUnBolded"
  | "isSmallerText"
  | "isLargeButton"
  | "isAriaControls"
  | "isAriaExpanded"
  | "isAriaHaspopup"
  | "className"
>;

interface Props extends OmitGenericButtonProps {
  isColor: "primary" | "border-base-light" | "accent-cooler" | "border-dark-red";
  className?: string;
  size?: "small" | "regular";
}

const colors = {
  primary: "usa-button usa-button--outline",
  "accent-cooler":
    "usa-button border-accent-cooler bg-transparent text-accent-cooler border-2px padding-x-205 padding-y-2 hide-unhide-button-accent-cooler",
  "border-base-light":
    "usa-button border-base-light bg-transparent text-normal text-base padding-x-1 border-1px hide-unhide-button font-body-2xs",
  "border-dark-red":
    "usa-button border-accent-hot-darker bg-transparent text-accent-hot-darker border-2px padding-x-205 padding-y-2 hide-unhide-button-accent-cooler",
};

export const SecondaryButton = (props: Props): ReactElement => {
  const classNames = `${colors[props.isColor]} ${props.className}`;
  return (
    <GenericButton
      {...props}
      isVerticalPaddingRemoved={props.size === "small"}
      id={props.id}
      className={classNames}
    />
  );
};
