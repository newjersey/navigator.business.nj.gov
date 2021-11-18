import React, { ReactElement } from "react";
interface Props {
  style: "primary" | "secondary" | "tertiary" | "primary-big" | "secondary-big";
  children: React.ReactNode;
  onClick?: (() => void) | ((event: React.MouseEvent) => Promise<void>) | ((event: React.MouseEvent) => void);
  dataTestid?: string;
  typeSubmit?: boolean;
  noRightMargin?: boolean;
  disabled?: boolean;
  underline?: boolean;
  smallText?: boolean;
  textBold?: boolean;
}

export const Button = (props: Props): ReactElement => {
  let style = "";

  switch (props.style) {
    case "primary":
      style = "usa-button";
      break;
    case "secondary":
      style = "usa-button usa-button--outline";
      break;
    case "tertiary":
      style = "usa-button usa-button--unstyled";
      break;
  }

  return (
    <button
      className={`${style}${props.noRightMargin ? " margin-right-0" : ""}${
        props.underline ? " underline" : ""
      }${props.smallText ? " font-body-2xs" : ""}${props.textBold ? " text-bold" : ""}`}
      onClick={props.onClick}
      {...(props.disabled ? { disabled: true } : {})}
      {...(props.typeSubmit ? { type: "submit" } : {})}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
    >
      {props.children}
    </button>
  );
};
