import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { ProfileLockedField } from "@/components/profile/ProfileLockedField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { ProfileContentField } from "@/lib/types/types";
import { ReactElement, ReactNode } from "react";

interface Props {
  fieldName: ProfileContentField;
  children: ReactNode;
  locked?: boolean;
  lockedValueFormatter?: (value: string) => string;
  isVisible?: boolean;
  displayAltDescription?: boolean;
  noLabel?: boolean;
  hideHeader?: boolean;
  boldAltDescription?: boolean;
  boldDescription?: boolean;
  compact?: boolean;
  fullWidth?: boolean;
  optionalText?: boolean;
}

export const ProfileField = (props: Props): ReactElement => {
  const { isFormFieldInvalid } = useFormContextFieldHelpers(props.fieldName, DataFormErrorMapContext);

  if (props.isVisible === false) {
    return <></>;
  }

  const classes: string = [
    props.compact ? "margin-y-2" : "margin-y-4",
    props.fullWidth ? "w-full" : "text-field-width-default",
    "add-spacing-on-ele-scroll",
  ].join(" ");

  return (
    <>
      <div className={classes} id={`question-${props.fieldName}`}>
        {props.locked ? (
          <ProfileLockedField fieldName={props.fieldName} valueFormatter={props.lockedValueFormatter} />
        ) : (
          <WithErrorBar hasError={isFormFieldInvalid} type={"ALWAYS"}>
            {!props.noLabel && (
              <FieldLabelProfile
                fieldName={props.fieldName}
                isAltDescriptionDisplayed={props.displayAltDescription}
                hideHeader={props.hideHeader}
                boldAltDescription={props.boldAltDescription}
                boldDescription={props.boldDescription}
                optionalText={props.optionalText}
              />
            )}
            <div className={props.noLabel ? "margin-bottom-05" : ""}>{props.children}</div>
          </WithErrorBar>
        )}
      </div>

      {!props.compact && <hr aria-hidden={true} />}
    </>
  );
};
