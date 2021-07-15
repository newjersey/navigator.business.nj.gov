import React, { ReactElement, ReactNode } from "react";
import { CircularProgress } from "@material-ui/core";

interface Props {
  children: ReactNode;
  onClick: () => void;
  loading: boolean;
  className: string;
  outline?: boolean;
  // All other props
  [x: string]: unknown;
}

export const LoadingButton = (props: Props): ReactElement => {
  const { children, onClick, loading, className, outline, ...rest } = props;
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
        <span className="spinner-overlay" data-testid="loading-spinner">
          <CircularProgress size={14} />
        </span>
      )}
    </button>
  );
};
