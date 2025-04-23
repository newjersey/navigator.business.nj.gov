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
  hideLine?: boolean | false;
  hideTopSpace?: boolean | false;
  isFullWidth?: boolean | false;
}

export const ProfileField = (props: Props): ReactElement => {
  const { isFormFieldInvalid } = useFormContextFieldHelpers(props.fieldName, DataFormErrorMapContext);

  if (props.isVisible === false) {
    return <></>;
  }
  return (
    <>
      <div
        className={`add-spacing-on-ele-scroll ${props.isFullWidth ? `` : `text-field-width-default `} ${
          props.hideTopSpace ? `` : `margin-y-4`
        }`}
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
                boldDescription={props.boldDescription}
              />
            )}
            <div className={props.noLabel ? "margin-bottom-05" : ""}>{props.children}</div>
          </WithErrorBar>
        )}
      </div>

      {!props.hideLine && <hr aria-hidden={true} />}
    </>
  );
};
