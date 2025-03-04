import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ReactElement, useContext } from "react";

import { ProfileContentField } from "@/contexts/profileFormContext";

export interface Props {
  fieldName: ProfileContentField;
  valueFormatter?: (value: string) => string;
}

export const ProfileLockedField = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  let valueToDisplay = state.profileData[props.fieldName] as string;

  if (props.fieldName === "municipality") {
    valueToDisplay = state.profileData[props.fieldName]?.displayName as string;
  }

  if (props.valueFormatter) {
    valueToDisplay = props.valueFormatter(state.profileData[props.fieldName] as string);
  }

  return (
    <div className="margin-bottom-4" data-testid={`locked-${props.fieldName}`}>
      <FieldLabelProfile fieldName={props.fieldName} locked={true} />
      <div>{valueToDisplay}</div>
    </div>
  );
};
