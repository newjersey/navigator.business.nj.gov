import { type ForwardedRef, forwardRef, type ReactElement, type ReactNode } from "react";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { modifyContent } from "@/lib/domain-logic/modifyContent";

export interface AlertProps {
  variant: AlertVariant;
  noIcon?: boolean;
  heading?: string;
  rounded?: boolean;
  dataTestid?: string;
  className?: string;
  noAlertRole?: boolean;
}

interface Props extends AlertProps {
  children: ReactNode;
}

export const AlertVariants = ["info", "success", "warning", "error", "note"] as const;

export type AlertVariant = (typeof AlertVariants)[number];

const composeAriaGroupLabel = (content: string, alertMappedName: string): string => {
  return modifyContent({
    content,
    condition: () => true,
    modificationMap: {
      alertVariant: alertMappedName,
    },
  });
};

const Alert = forwardRef((props: Props, ref: ForwardedRef<HTMLDivElement>): ReactElement => {
  const { variant, children, noIcon, heading, rounded, dataTestid } = props;
  const variantClass = variant ? `usa-alert--${variant}` : "";
  const noIconClass = noIcon ? " usa-alert--no-icon" : "";
  const roundedClass = rounded ? " radius-md" : "";
  const defaultClassNames = "usa-alert margin-y-2 usa-alert--slim";
  const className = [
    defaultClassNames,
    roundedClass,
    variantClass,
    noIconClass,
    props.className ?? "",
  ]
    .map((i) => {
      return i?.trim();
    })
    .filter((value: string | undefined) => {
      return value && value.length > 0;
    })
    .join(" ");

  const { Config } = useConfig();

  const AlertVariantsAriaMapping = {
    info: Config.calloutAlerts.info,
    success: Config.calloutAlerts.success,
    warning: Config.calloutAlerts.warning,
    error: Config.calloutAlerts.error,
    note: Config.calloutAlerts.note,
  };

  // Only label the alert role: ARIA doesn't allow aria-label on a plain <div>.
  const alertRoleProps = props.noAlertRole
    ? {}
    : {
        role: "alert",
        "aria-label": composeAriaGroupLabel(
          Config.calloutAlerts.calloutAlertGroupTitle,
          AlertVariantsAriaMapping[props.variant],
        ),
      };

  return (
    <div
      className={className}
      {...(dataTestid
        ? { "data-testid": dataTestid }
        : { "data-testid": `alert-${props.variant}` })}
      {...alertRoleProps}
      ref={ref}
      tabIndex={-1}
    >
      <div className="usa-alert__body">
        {heading && (
          <Heading level={3} className="margin-bottom-0">
            {heading}
          </Heading>
        )}
        <div className="usa-alert__text">{children}</div>
      </div>
    </div>
  );
});

Alert.displayName = "Alert";

export { Alert };
