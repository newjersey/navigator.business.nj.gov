import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { forwardRef, ReactElement, Ref } from "react";

export type PrimaryButtonColors =
  | "primary"
  | "secondary"
  | "accent-cool-darker"
  | "accent-cooler"
  | "info"
  | "success-extra-light";

interface Props extends GenericButtonProps {
  isColor: PrimaryButtonColors;
  isUnBolded?: boolean;
  isSmallerText?: boolean;
  isLargeButton?: boolean;
}

const colors = {
  primary: "usa-button",
  secondary: "usa-button usa-button--secondary",
  "accent-cool-darker": "usa-button btn-accent-cool-darker",
  "accent-cooler": "usa-button btn-accent-cooler",
  info: "usa-button btn-info",
  "success-extra-light": "usa-button btn-success-extra-light",
};

export const PrimaryButton = forwardRef(function PrimaryButton(
  props: Props,
  ref: Ref<HTMLButtonElement>
): ReactElement {
  return (
    <GenericButton
      {...props}
      className={`${colors[props.isColor]} 
      ${props.isUnBolded ? "text-normal" : ""}  
      ${props.isSmallerText ? "font-body-2xs" : ""} 
      ${props.isLargeButton ? "usa-button--big" : ""}`}
      ref={ref}
    />
  );
});
