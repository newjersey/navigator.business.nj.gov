import React, { ReactElement, ReactNode } from "react";

interface Props {
  variant: AlertVariant;
  children: ReactNode;
  noIcon?: boolean;
  heading?: string;
  rounded?: boolean;
  dataTestid?: string;
}

export type AlertVariant = "info" | "success" | "warning" | "error";

export const Alert = (props: Props): ReactElement => {
  const { variant, children, noIcon, heading, rounded, dataTestid } = props;
  const variantClass = ` usa-alert--${variant}` || "";
  const noIconClass = noIcon ? " usa-alert--no-icon" : "";
  const roundedClass = rounded ? " radius-md" : "";
  const alertRole = variant === "error" ? { role: "alert" } : {};

  return (
    <div
      className={`usa-alert margin-y-2 usa-alert--slim${roundedClass}${variantClass}${noIconClass}`}
      {...alertRole}
      {...(dataTestid ? { "data-testid": dataTestid } : {})}
    >
      <div className="usa-alert__body">
        {heading && <h3 className="margin-bottom-0 margin-top-neg-05">{heading}</h3>}
        <div className="usa-alert__text">{children}</div>
      </div>
    </div>
  );
};
