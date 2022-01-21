import { CircularProgress } from "@mui/material";
import React, { ReactElement, useEffect, useRef, useState } from "react";
interface Props {
  style:
    | "primary"
    | "secondary"
    | "tertiary"
    | "primary-big"
    | "secondary-big"
    | "secondary-input-field-height"
    | "primary-input-field-height";
  children: React.ReactNode;
  onClick?: (() => void) | ((event: React.MouseEvent) => Promise<void>) | ((event: React.MouseEvent) => void);
  dataTestid?: string;
  typeSubmit?: boolean;
  noRightMargin?: boolean;
  underline?: boolean;
  smallText?: boolean;
  textBold?: boolean;
  loading?: boolean;
  widthAutoOnMobile?: boolean;
}

export const Button = (props: Props): ReactElement => {
  let style = "";
  let disabledClass = "";
  let btnHeight = "";
  const widthRef = useRef<HTMLInputElement | null>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  switch (props.style) {
    case "primary":
      style = "usa-button";
      disabledClass = "usa-button--disabled";
      btnHeight = "height-5";
      break;
    case "primary-input-field-height":
      style = "usa-button padding-y-205";
      disabledClass = "usa-button--disabled padding-y-205";
      btnHeight = "height-7";
      break;
    case "secondary":
      style = "usa-button usa-button--outline";
      disabledClass = "usa-button--outline-disabled";
      btnHeight = "height-5";
      break;
    case "secondary-input-field-height":
      style = "usa-button usa-button--outline padding-y-205";
      disabledClass = "usa-button--outline-disabled padding-y-205";
      btnHeight = "height-7";
      break;
    case "tertiary":
      style = "usa-button usa-button--unstyled";
      break;
  }
  const showDisabledClass = props.loading ? disabledClass : "";

  useEffect(() => {
    if (!props.loading && widthRef.current !== null) {
      setWidth(widthRef.current.clientWidth);
      setHeight(widthRef.current.clientHeight);
    }
  }, [height, width, props.loading, disabledClass]);

  return (
    <button
      className={`${style} ${btnHeight}${props.noRightMargin ? " margin-right-0" : ""}${
        props.underline ? " underline" : ""
      }${props.smallText ? " font-body-2xs" : ""}${props.textBold ? " text-bold" : ""}${
        props.widthAutoOnMobile ? " width-auto" : ""
      } ${showDisabledClass}`}
      onClick={props.onClick}
      {...(props.typeSubmit ? { type: "submit" } : { type: "button" })}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
    >
      {props.loading ? (
        <div style={{ width: width, height: height }} data-testid="loading-spinner">
          <div className="margin-top-neg-1">
            <CircularProgress size={24} thickness={10} />
          </div>
        </div>
      ) : (
        <div ref={widthRef}>{props.children}</div>
      )}
    </button>
  );
};
