import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { ProfileLockedField } from "@/components/profile/ProfileLockedField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { ProfileContentField } from "@businessnjgovnavigator/shared/types";
import { ReactElement, ReactNode } from "react";

interface Props {
  boldAltDescription?: boolean;
  boldDescription?: boolean;
  children: ReactNode;
  displayAltDescription?: boolean;
  fieldName: ProfileContentField;
  fullWidth?: boolean;
  hideHeader?: boolean;
  hideLine?: boolean;
  isVisible?: boolean;
  locked?: boolean;
  lockedValueFormatter?: (value: string) => string;
  noLabel?: boolean;
  optionalText?: boolean;
  ignoreContextualInfo?: boolean;
}

export const ProfileField = (props: Props): ReactElement => {
  const { isFormFieldInvalid } = useFormContextFieldHelpers(
    props.fieldName,
    DataFormErrorMapContext,
  );

  if (props.isVisible === false) {
    return <></>;
  }

  const classes: string = [
    props.hideLine ? "margin-y-2" : "margin-y-4",
    props.fullWidth ? "w-full" : "text-field-width-default",
  ].join(" ");

  return (
    <>
      <ScrollableFormFieldWrapper fieldName={props.fieldName}>
        <div className={classes}>
          {props.locked ? (
            <ProfileLockedField
              fieldName={props.fieldName}
              valueFormatter={props.lockedValueFormatter}
            />
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
                  ignoreContextualInfo={props.ignoreContextualInfo}
                />
              )}
              <div className={props.noLabel ? "margin-bottom-05" : ""}>{props.children}</div>
            </WithErrorBar>
          )}
        </div>
      </ScrollableFormFieldWrapper>

      {!props.hideLine && <hr aria-hidden={true} />}
    </>
  );
};
