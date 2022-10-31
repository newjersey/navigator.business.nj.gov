import { CircularProgress } from "@mui/material";
import React, { ReactElement, useEffect, useRef, useState } from "react";
interface Props {
  style:
    | "primary"
    | "secondary"
    | "secondary-blue"
    | "secondary-blue-narrow"
    | "light"
    | "narrow-accent-cool-lightest"
    | "tertiary"
    | "narrow-light"
    | "primary-big"
    | "secondary-big"
    | "accent-cool-darker-big";
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
  align?: "start" | "end" | "center";
  ariaLabel?: string;
  fullWidth?: boolean;
}

export const Button = (props: Props): ReactElement => {
  let style = "";
  let disabledClass = "";
  const widthRef = useRef<HTMLInputElement | null>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  switch (props.style) {
    case "primary":
      style = "usa-button padding-y-11px";
      disabledClass = "usa-button--disabled";
      break;
    case "secondary":
      style = "usa-button usa-button--outline padding-y-11px";
      disabledClass = "usa-button--outline-disabled";
      break;
    case "secondary-blue":
      style = "usa-button usa-button--secondary text-normal padding-y-11px";
      disabledClass = "usa-button--secondary-disabled";
      break;
    case "secondary-blue-narrow":
      style = "usa-button usa-button--secondary text-normal";
      disabledClass = "usa-button--secondary-disabled";
      break;
    case "light":
      style =
        "usa-button bg-transparent text-normal text-base border-1px border-base-light hide-unhide-button padding-y-11px";
      break;
    case "narrow-accent-cool-lightest":
      style = "usa-button btn-accent-cool-lightest text-normal padding-y-11px";
      break;

    case "tertiary":
      style = "usa-button usa-button--unstyled width-auto";
      break;
    case "narrow-light":
      style =
        "usa-button usa-tag bg-transparent text-normal text-base border-1px border-base-light hide-unhide-button";
      break;

    case "primary-big":
      style = "usa-button usa-button--big padding-y-14px";
      disabledClass = "usa-button--disabled";
      break;
    case "accent-cool-darker-big":
      style = "usa-button usa-button--big btn-accent-cool-darker padding-y-14px";
      disabledClass = "usa-button--disabled";
      break;
    case "secondary-big":
      style = "usa-button usa-button--big usa-button--outline padding-y-14px";
      disabledClass = "usa-button--outline-disabled";
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
    if (props.style === "tertiary") {
      return "margin-right-0";
    }
    return props.noRightMargin ? "margin-right-0" : "margin-right-2";
  };
  const heightAutoOnMobile = props.heightAutoOnMobile ? "height-auto" : "";
  const widthAutoOnMobile = props.widthAutoOnMobile ? "width-auto" : "";
  const noRightMargin = getRightMargin();
  const underline = props.underline ? "underline" : "";
  const smallText = props.smallText ? "font-body-2xs" : "";
  const textBold = props.textBold ? "text-bold" : "";
  const intercomButton = props.intercomButton ? "intercom-button" : "";
  const fullWidth = props.fullWidth ? "width-100" : "";

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
    fullWidth,
  ]
    .map((i) => {
      return i?.trim();
    })
    .filter((value: string | undefined) => {
      return value && value.length > 0;
    })
    .join(" ");

  return (
    <button
      className={className}
      onClick={props.onClick}
      {...(props.typeSubmit ? { type: "submit" } : { type: "button" })}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
      {...(props.ariaLabel ? { "aria-label": props.ariaLabel } : {})}
    >
      {props.loading ? (
        <div style={{ width: width, height: height }} data-testid="loading-spinner">
          <div className="padding-top-1px">
            <CircularProgress size={24} thickness={10} />
          </div>
        </div>
      ) : (
        <div
          ref={widthRef}
          className={`display-flex flex-row flex-justify-${props.align || "center"} flex-align-center ${
            underline || ""
          }`}
        >
          {props.children}
        </div>
      )}
    </button>
  );
};
