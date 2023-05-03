import { CircularProgress } from "@mui/material";
import React, { forwardRef, ReactElement, useEffect, useRef, useState } from "react";
interface Props {
  style: "tertiary" | "light" | "narrow-light" | "unstyled";
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

// eslint-disable-next-line react/display-name
export const UnStyledButton = forwardRef(
  (props: Props, ref?: React.LegacyRef<HTMLButtonElement>): ReactElement => {
    let style = "";
    const disabledClass = "usa-button--disabled";
    const widthRef = useRef<HTMLInputElement | null>(null);
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();

    switch (props.style) {
      case "light":
        style =
          "usa-button bg-transparent text-normal text-base border-1px border-base-light hide-unhide-button padding-y-11px";
        break;
      case "tertiary":
        style = "usa-button usa-button--unstyled width-auto font-weight-inherit font-size-inherit";
        break;
      case "narrow-light":
        style =
          "usa-button usa-tag bg-transparent text-normal text-base border-1px border-base-light hide-unhide-button";
        break;
      case "unstyled":
        style = "usa-button bg-transparent";
        break;
    }
    const showDisabledClass = props.loading ? disabledClass : "";

    useEffect(() => {
      if (!props.loading && widthRef.current !== null) {
        setWidth(widthRef.current.clientWidth);
        setHeight(widthRef.current.clientHeight);
      }
    }, [height, width, props.loading, disabledClass]);

    const getRightMargin = (): string => {
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
      props.className,
      style,
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
        ref={ref}
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
  }
);
