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
    | "primary-input-field-height"
    | "narrow-light";
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
  heightAutoOnMobile?: boolean;
  intercomButton?: boolean;
  className?: string;
}

export const Button = (props: Props): ReactElement => {
  let style = "";
  let disabledClass = "";
  const widthRef = useRef<HTMLInputElement | null>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  switch (props.style) {
    case "primary":
      style = "usa-button padding-y-1";
      disabledClass = "usa-button--disabled";
      break;
    case "primary-input-field-height":
      style = "usa-button padding-y-2";
      disabledClass = "usa-button--disabled padding-y-2";
      break;
    case "secondary":
      style = "usa-button usa-button--outline padding-y-1";
      disabledClass = "usa-button--outline-disabled";
      break;
    case "secondary-input-field-height":
      style = "usa-button usa-button--outline padding-y-2";
      disabledClass = "usa-button--outline-disabled padding-y-2";
      break;
    case "tertiary":
      style = "usa-button usa-button--unstyled";
      break;
    case "narrow-light":
      style =
        "usa-button usa-tag bg-transparent text-normal text-base border-1px border-base-light hide-unhide-button";
      break;
  }
  const showDisabledClass = props.loading ? disabledClass : "";

  useEffect(() => {
    if (!props.loading && widthRef.current !== null) {
      setWidth(widthRef.current.clientWidth);
      setHeight(widthRef.current.clientHeight);
    }
  }, [height, width, props.loading, disabledClass]);

  const getRightMargin = () => {
    if (props.style === "tertiary") return "margin-right-0";
    return props.noRightMargin ? "margin-right-0" : "margin-right-2";
  };
  const heightAutoOnMobile = props.heightAutoOnMobile ? "height-auto" : "";
  const widthAutoOnMobile = props.widthAutoOnMobile ? "width-auto" : "";
  const noRightMargin = getRightMargin();
  const underline = props.underline ? "underline" : "";
  const smallText = props.smallText ? "font-body-2xs" : "";
  const textBold = props.textBold ? "textBold" : "";
  const intercomButton = props.intercomButton ? "intercom-button" : "";

  const className = [
    style,
    props.className,
    heightAutoOnMobile,
    widthAutoOnMobile,
    noRightMargin,
    underline,
    smallText,
    textBold,
    intercomButton,
    showDisabledClass,
  ]
    .map((i) => i?.trim())
    .filter((value: string | undefined) => value && value.length > 0)
    .join(" ");

  return (
    <button
      className={className}
      onClick={props.onClick}
      {...(props.typeSubmit ? { type: "submit" } : { type: "button" })}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
    >
      {props.loading ? (
        <div style={{ width: width, height: height }} data-testid="loading-spinner">
          <CircularProgress size={24} thickness={10} />
        </div>
      ) : (
        <div ref={widthRef}>{props.children}</div>
      )}
    </button>
  );
};
