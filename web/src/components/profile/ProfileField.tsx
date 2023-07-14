import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { LockedProfileField } from "@/components/onboarding/LockedProfileField";
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
}

export const ProfileField = (props: Props): ReactElement => {
  if (props.isVisible === false) {
    return <></>;
  }
  return (
    <>
      <div className="margin-y-4" id={`question-${props.fieldName}`}>
        {props.locked ? (
          <LockedProfileField fieldName={props.fieldName} valueFormatter={props.lockedValueFormatter} />
        ) : (
          <>
            {!props.noLabel && (
              <FieldLabelProfile
                fieldName={props.fieldName}
                isAltDescriptionDisplayed={props.displayAltDescription}
                hideHeader={props.hideHeader}
              />
            )}
            <div className={props.noLabel ? "margin-bottom-05" : ""}>{props.children}</div>
          </>
        )}
      </div>
      <hr aria-hidden={true} />
    </>
  );
};
