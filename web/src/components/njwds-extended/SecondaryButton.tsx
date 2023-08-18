import { GenericButton, GenericButtonProps } from "@/components/njwds-extended/GenericButton";
import { ReactElement } from "react";
interface Props extends GenericButtonProps {
  isColor: "primary";
}

const colors = {
  primary: "usa-button usa-button--outline"
};

export const SecondaryButton = (props: Props): ReactElement => {
  return <GenericButton {...props} className={colors[props.isColor]} />;
};
