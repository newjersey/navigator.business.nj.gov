import { CircularProgress } from "@mui/material";
import React, { ReactElement, useEffect, useRef, useState } from "react";
export interface GenericButtonProps {
  className?: string;
  children?: React.ReactNode;
  onClick?: (() => void) | ((event: React.MouseEvent) => Promise<void>) | ((event: React.MouseEvent) => void);
  dataTestId?: string;
  isSubmitButton?: boolean;
  isRightMarginRemoved?: boolean;
  isSmallerText?: boolean;
  isLoading?: boolean;
  isNotFullWidthOnMobile?: boolean;
  intercomButton?: boolean;
  isFullWidthOnDesktop?: boolean;
  isVerticalPaddingRemoved?: boolean;
  isUnBolded?: boolean;
  isTextAlignedLeft?: boolean;
  isLargeButton?: boolean;
}

export const GenericButton = (props: GenericButtonProps): ReactElement => {
  const isUnBolded = props.isUnBolded ? "text-normal" : "";
  const disabledClass = "usa-button--disabled";
  const showDisabledClass = props.isLoading ? disabledClass : "";
  const noRightMargin = props.isRightMarginRemoved ? "margin-right-0" : "margin-right-2";
  const fullWidth = props.isFullWidthOnDesktop ? "width-100" : "";
  const isNotFullWidthOnMobile = props.isNotFullWidthOnMobile ? "width-auto" : "";
  const isVerticalPaddingRemoved = props.isVerticalPaddingRemoved ? "padding-y-0" : "padding-y-11px";
  const isLargeButton = props.isLargeButton ? "usa-button--big" : "";
  const isSmallerText = props.isSmallerText ? "font-body-2xs" : "";
  const intercomButton = props.intercomButton ? "intercom-button" : "";

  const widthRef = useRef<HTMLInputElement | null>(null);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    if (!props.isLoading && widthRef.current !== null) {
      setWidth(widthRef.current.clientWidth);
      setHeight(widthRef.current.clientHeight);
    }
  }, [height, width, props.isLoading, widthRef]);

  const className = [
    props.className,
    isLargeButton,
    isUnBolded,
    isNotFullWidthOnMobile,
    noRightMargin,
    isSmallerText,
    intercomButton,
    showDisabledClass,
    fullWidth,
    isVerticalPaddingRemoved,
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
      {...(props.isSubmitButton ? { type: "submit" } : { type: "button" })}
      {...(props.dataTestId ? { "data-testid": props.dataTestId } : {})}
    >
      {props.isLoading ? (
        <div style={{ width: width, height: height }} data-testid="loading-spinner">
          <div className="padding-top-1px">
            <CircularProgress size={24} thickness={10} />
          </div>
        </div>
      ) : (
        <div
          ref={widthRef}
          className={`display-flex flex-row flex-align-center ${
            props.isTextAlignedLeft ? "flex-justify-start" : "flex-justify-center"
          }`}
        >
          {props.children}
        </div>
      )}
    </button>
  );
};
