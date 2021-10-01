import { ReactElement, ReactNode } from "react";

interface Props {
  variant?: AlertVariant;
  children: ReactNode;
  slim?: boolean;
  noIcon?: boolean;
  className?: string;
  heading?: string;
  rounded?: boolean;
  // All other props
  [x: string]: unknown;
}

export type AlertVariant = "info" | "success" | "warning" | "error";

export const Alert = (props: Props): ReactElement => {
  const { variant, children, slim, noIcon, className, heading, rounded, ...rest } = props;
  const variantClass = `usa-alert--${variant}` || "";
  const slimClass = slim ? "usa-alert--slim" : "";
  const noIconClass = noIcon ? "usa-alert--no-icon" : "";
  const roundedClass = rounded ? "radius-md" : "";
  const alertRole = variant === "error" ? { role: "alert" } : {};

  return (
    <div
      className={`usa-alert ${roundedClass} ${variantClass} ${slimClass} ${noIconClass} ${className || ""}`}
      {...alertRole}
      {...rest}
    >
      <div className="usa-alert__body">
        {heading && <h3 className="margin-y-0">{heading}</h3>}
        <div className="usa-alert__text">{children}</div>
      </div>
    </div>
  );
};
