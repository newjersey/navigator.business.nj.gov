import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { forwardRef, ReactElement, Ref } from "react";

export type PrimaryButtonColors =
  | "primary"
  | "secondary"
  | "accent-cool-lightest"
  | "accent-cool-darker"
  | "accent-cooler"
  | "info";

interface Props extends GenericButtonProps {
  isColor: PrimaryButtonColors;
}

const colors = {
  primary: "usa-button",
  secondary: "usa-button usa-button--secondary",
  "accent-cool-lightest": "usa-button btn-accent-cool-lightest",
  "accent-cool-darker": "usa-button btn-accent-cool-darker",
  "accent-cooler": "usa-button btn-accent-cooler",
  info: "usa-button btn-info",
};

export const PrimaryButton = forwardRef(function PrimaryButton(
  props: Props,
  ref: Ref<HTMLButtonElement>
): ReactElement {
  return <GenericButton {...props} className={colors[props.isColor]} ref={ref} />;
});
