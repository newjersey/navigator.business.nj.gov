import React, { ReactElement, ReactNode } from "react";
import { CircularProgress } from "@mui/material";

interface Props {
  children: ReactNode;
  onClick: () => void;
  loading: boolean;
  className?: string;
  outline?: boolean;
  marginClass?: string;
  // All other props
  [x: string]: unknown;
}

export const LoadingButton = (props: Props): ReactElement => {
  const { children, onClick, loading, className, outline, marginClass, ...rest } = props;
  const disabledClass = outline ? "usa-button--outline-disabled" : "usa-button--disabled";
  const showButtonClass = outline ? "usa-button--outline" : "";
  const showInvisibleClass = loading ? "visibility-hidden" : "visibility-visible";
  const showDisabledClass = loading ? disabledClass : "";

  return (
    <button
      className={`usa-button position-relative ${showButtonClass} ${className} ${showDisabledClass}`}
      onClick={onClick}
      {...rest}
    >
      <span className={showInvisibleClass}>{children}</span>
      {loading && (
        <div className={`spinner-overlay ${marginClass || ""}`} data-testid="loading-spinner">
          <CircularProgress size={24} thickness={10} />
        </div>
      )}
    </button>
  );
};
