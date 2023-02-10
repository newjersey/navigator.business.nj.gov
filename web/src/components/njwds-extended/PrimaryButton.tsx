import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { ReactElement } from "react";
interface Props extends GenericButtonProps {
  isColor: "primary" | "secondary" | "accent-cool-lightest" | "accent-cool-darker";
}

const colors = {
  primary: "usa-button",
  secondary: "usa-button usa-button--secondary",
  "accent-cool-lightest": "usa-button btn-accent-cool-lightest",
  "accent-cool-darker": "usa-button btn-accent-cool-darker",
};

export const PrimaryButton = (props: Props): ReactElement => {
  return <GenericButton {...props} className={colors[props.isColor]} />;
};
