import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { forwardRef, ReactElement, Ref } from "react";

export type PrimaryButtonColors =
  | "primary"
  | "secondary"
  | "accent-cool-darker"
  | "accent-cooler"
  | "info"
  | "success-extra-light"
  | "white";

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
  info: "usa-button btn-info",
  "success-extra-light": "usa-button btn-success-extra-light",
  white: "usa-button text-info-darkest btn-white hover:drop-shadow-md",
};

export const PrimaryButton = forwardRef(function PrimaryButton(
  props: Props,
  ref: Ref<HTMLButtonElement>
): ReactElement {
  return <GenericButton {...props} className={`${colors[props.isColor]}`} ref={ref} />;
});
