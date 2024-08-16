import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { forwardRef, ReactElement, Ref } from "react";

export type PrimaryButtonColors =
  | "primary"
  | "secondary"
  | "accent-cool-darker"
  | "accent-cooler"
  | "accent-semi-cool"
  | "outline"
  | "success-extra-light"
  | "error"
  | "white"
  | "secondary-vivid-dark";

type OmitGenericButtonProps = Omit<
  GenericButtonProps,
  "size" | "id" | "isAriaControls" | "isAriaExpanded" | "isAriaHaspopup" | "className"
>;

interface Props extends OmitGenericButtonProps {
  isColor: PrimaryButtonColors;
}

const colors = {
  primary: "usa-button",
  secondary: "usa-button usa-button--secondary",
  "accent-cool-darker": "usa-button btn-accent-cool-darker",
  "accent-cooler": "usa-button btn-accent-cooler",
  error: "usa-button btn-error-dark",
  "accent-semi-cool": "usa-button btn-accent-semi-cool",
  "success-extra-light": "usa-button btn-success-extra-light",
  white: "usa-button text-info-darkest btn-white",
  outline: "usa-button usa-button--outline",
  "secondary-vivid-dark": "usa-button bg-secondary-vivid-dark",
};

export const PrimaryButton = forwardRef(function PrimaryButton(
  props: Props,
  ref: Ref<HTMLButtonElement>
): ReactElement {
  return <GenericButton {...props} className={`${colors[props.isColor]}`} ref={ref} />;
});
