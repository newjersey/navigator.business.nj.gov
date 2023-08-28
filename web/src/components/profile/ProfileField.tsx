import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { LockedProfileField } from "@/components/onboarding/LockedProfileField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { profileFormContext } from "@/contexts/profileFormContext";
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
}

export const ProfileField = (props: Props): ReactElement => {
  const { isFormFieldInValid } = useFormContextFieldHelpers(props.fieldName, profileFormContext);

  if (props.isVisible === false) {
    return <></>;
  }
  return (
    <>
      <div className="margin-y-4" id={`question-${props.fieldName}`}>
        {props.locked ? (
          <LockedProfileField fieldName={props.fieldName} valueFormatter={props.lockedValueFormatter} />
        ) : (
          <WithErrorBar hasError={isFormFieldInValid} type={"ALWAYS"}>
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
