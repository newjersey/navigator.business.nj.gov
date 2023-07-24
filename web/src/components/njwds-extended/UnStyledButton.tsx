import React, { forwardRef, ReactElement, useEffect, useRef, useState } from "react";

interface Props {
  style: "default" | "transparentBgColor";
  className?: string;
  children: React.ReactNode;
  onClick?: (() => void) | ((event: React.MouseEvent) => Promise<void>) | ((event: React.MouseEvent) => void);
  dataTestid?: string;
  isRightMarginRemoved?: boolean;
  isUnderline?: boolean;
  isSmallerText?: boolean;
  isTextBold?: boolean;
  isIntercomEnabled?: boolean;
  isAriaLabelApplied?: string;
}

// eslint-disable-next-line react/display-name
export const UnStyledButton = forwardRef(
  (props: Props, ref?: React.LegacyRef<HTMLButtonElement>): ReactElement => {
    const style =
      props.style === "default"
        ? "usa-button usa-button--unstyled width-auto font-weight-inherit font-size-inherit"
        : "usa-button bg-transparent";
    const disabledClass = "usa-button--disabled";
    const widthRef = useRef<HTMLInputElement | null>(null);
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();

    useEffect(() => {
      if (widthRef.current !== null) {
        setWidth(widthRef.current.clientWidth);
        setHeight(widthRef.current.clientHeight);
      }
    }, [height, width, disabledClass]);

    const noRightMargin =
      props.isRightMarginRemoved || props.style === "default" ? "margin-right-0" : "margin-right-2";
    const underline = props.isUnderline ? "underline" : "";
    const smallText = props.isSmallerText ? "font-body-2xs" : "";
    const textBold = props.isTextBold ? "text-bold" : "";
    const intercomButton = props.isIntercomEnabled ? "intercom-button" : "";

    const className = [style, props.className, noRightMargin, underline, smallText, textBold, intercomButton]
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
        type={"button"}
        ref={ref}
        onClick={props.onClick}
        {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
        {...(props.isAriaLabelApplied ? { "aria-label": props.isAriaLabelApplied } : {})}
      >
        <div
          ref={widthRef}
          className={`display-flex flex-row flex-justify-center
             flex-align-center ${underline || ""}`}
        >
          {props.children}
        </div>
      </button>
    );
  }
);
