import { CircularProgress } from "@mui/material";
import React, { forwardRef, ReactElement, Ref, useEffect, useRef, useState } from "react";

export interface GenericButtonProps {
  children?: React.ReactNode;
  id?: string;
  isAriaControls?: string;
  isAriaExpanded?: boolean;
  isAriaHaspopup?: boolean;

  onClick?: (() => void) | ((event: React.MouseEvent) => Promise<void>) | ((event: React.MouseEvent) => void);
  dataTestId?: string;
  className?: string;
  isIntercomEnabled?: boolean;
  isSubmitButton?: boolean;

  isLoading?: boolean;
  isRightMarginRemoved?: boolean;
  isNotFullWidthOnMobile?: boolean;
  isFullWidthOnDesktop?: boolean;
  isVerticalPaddingRemoved?: boolean;
  isUnBolded?: boolean;
  isSmallerText?: boolean;
  isLargeButton?: boolean;
}

export const GenericButton = forwardRef(function GenericButton(
  props: GenericButtonProps,
  ref?: Ref<HTMLButtonElement> | undefined
): ReactElement<any> {
  const disabledClass = "usa-button--disabled";
  const showDisabledClass = props.isLoading ? disabledClass : "";
  const noRightMargin = props.isRightMarginRemoved ? "margin-right-0" : "margin-right-2";
  const fullWidth = props.isFullWidthOnDesktop ? "width-100 flex fjc" : "";
  const isNotFullWidthOnMobile = props.isNotFullWidthOnMobile ? "width-auto" : "";
  const isVerticalPaddingRemoved = props.isVerticalPaddingRemoved ? "padding-y-0" : "padding-y-11px";
  const intercomButton = props.isIntercomEnabled ? "intercom-button" : "";
  const isUnBolded = props.isUnBolded ? "text-normal" : "";
  const isSmallerText = props.isSmallerText ? "font-body-2xs" : "";
  const isLargeButton = props.isLargeButton ? "usa-button--big" : "";

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
    isNotFullWidthOnMobile,
    noRightMargin,
    intercomButton,
    showDisabledClass,
    fullWidth,
    isVerticalPaddingRemoved,
    isUnBolded,
    isSmallerText,
    isLargeButton,
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
      ref={ref}
      {...(props.isSubmitButton ? { type: "submit" } : { type: "button" })}
      {...(props.dataTestId ? { "data-testid": props.dataTestId } : {})}
      {...(props.id ? { id: props.id } : {})}
      {...(props.isAriaControls ? { "aria-controls": props.isAriaControls } : {})}
      {...(props.isAriaExpanded ? { "aria-expanded": props.isAriaExpanded } : {})}
      {...(props.isAriaHaspopup ? { "aria-haspopup": props.isAriaHaspopup } : {})}
    >
      {props.isLoading ? (
        <div style={{ width: width, height: height }} data-testid="loading-spinner">
          <div className="padding-top-1px">
            <CircularProgress size={24} thickness={10} />
          </div>
        </div>
      ) : (
        <div ref={widthRef} className={`display-flex flex-row flex-align-center flex-justify-center`}>
          {props.children}
        </div>
      )}
    </button>
  );
});
