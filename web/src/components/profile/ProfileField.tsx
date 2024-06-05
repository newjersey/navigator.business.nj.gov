import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { ProfileLockedField } from "@/components/profile/ProfileLockedField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileFormContext } from "@/contexts/profileFormContext";
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
  isHrVisible?: boolean;
}

export const ProfileField = (props: Props): ReactElement => {
  const { isFormFieldInvalid } = useFormContextFieldHelpers(props.fieldName, ProfileFormContext);

  if (props.isVisible === false) {
    return <></>;
  }
  return (
    <>
      <div
        className="margin-y-4 text-field-width-default add-spacing-on-ele-scroll"
        id={`question-${props.fieldName}`}
      >
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
              />
            )}
            <div className={props.noLabel ? "margin-bottom-05" : ""}>{props.children}</div>
          </WithErrorBar>
        )}
      </div>

      <hr aria-hidden={true} />
    </>
  );
};
