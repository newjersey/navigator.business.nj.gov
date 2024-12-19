import React, { forwardRef, ReactElement, useEffect, useRef, useState } from "react";

interface Props {
  className?: string;
  children: React.ReactNode;
  onClick?: (() => void) | ((event: React.MouseEvent) => Promise<void>) | ((event: React.MouseEvent) => void);
  dataTestid?: string;
  isUnderline?: boolean;
  isSmallerText?: boolean;
  isTextBold?: boolean;
  isIntercomEnabled?: boolean;
  ariaLabel?: string;
  isBgTransparent?: boolean;
}

// eslint-disable-next-line react/display-name
export const UnStyledButton = forwardRef(
  (props: Props, ref?: React.Ref<HTMLButtonElement>): ReactElement<any> => {
    const style = props.isBgTransparent
      ? "usa-button bg-transparent"
      : "usa-button usa-button--unstyled width-auto font-weight-inherit font-size-inherit";

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

    const underline = props.isUnderline ? "underline" : "";
    const smallText = props.isSmallerText ? "font-body-2xs" : "";
    const textBold = props.isTextBold ? "text-bold" : "";
    const intercomButton = props.isIntercomEnabled ? "intercom-button" : "";

    const className = [style, props.className, underline, smallText, textBold, intercomButton]
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
        {...(props.ariaLabel ? { "aria-label": props.ariaLabel } : {})}
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
