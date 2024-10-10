import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { modifyContent } from "@/lib/domain-logic/modifyContent";
import { ReactElement, ReactNode } from "react";

export interface AlertProps {
  variant: AlertVariant;
  noIcon?: boolean;
  heading?: string;
  rounded?: boolean;
  dataTestid?: string;
  className?: string;
}

interface Props extends AlertProps {
  children: ReactNode;
}

export const AlertVariants = ["info", "success", "warning", "error", "note"] as const;

export type AlertVariant = (typeof AlertVariants)[number];

const composeAriaGroupLable = (content: string, alertMappedName: string): string => {
  return modifyContent({
    content,
    condition: () => true,
    modificationMap: {
      alertVariant: alertMappedName,
    },
  });
};

export const Alert = (props: Props): ReactElement => {
  const { variant, children, noIcon, heading, rounded, dataTestid } = props;
  const variantClass = variant ? `usa-alert--${variant}` : "";
  const noIconClass = noIcon ? " usa-alert--no-icon" : "";
  const roundedClass = rounded ? " radius-md" : "";
  const defaultClassNames = "usa-alert margin-y-2 usa-alert--slim";
  const className = [defaultClassNames, roundedClass, variantClass, noIconClass, props.className ?? ""]
    .map((i) => {
      return i?.trim();
    })
    .filter((value: string | undefined) => {
      return value && value.length > 0;
    })
    .join(" ");

  const { Config } = useConfig();

  const AlertVariantsAriaMapping = {
    info: Config.calloutAlerts.infoOverride,
    success: Config.calloutAlerts.successOverride,
    warning: Config.calloutAlerts.warningOverride,
    error: Config.calloutAlerts.errorOverride,
    note: Config.calloutAlerts.noteOverride,
  };

  return (
    <div
      className={className}
      {...(dataTestid ? { "data-testid": dataTestid } : {})}
      aria-label={composeAriaGroupLable(
        Config.calloutAlerts.calloutAlertGroupTitle,
        AlertVariantsAriaMapping[props.variant]
      )}
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
};
