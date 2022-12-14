import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IndustrySpecificDataAddOnFields, ProfileContentField } from "@/lib/types/types";
import { ReactElement, useContext } from "react";

export interface Props {
  fieldName: Exclude<ProfileContentField, IndustrySpecificDataAddOnFields>;
  valueFormatter?: (value: string) => string;
}

export const LockedProfileField = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  let valueToDisplay = state.profileData[props.fieldName] as string;
  if (props.valueFormatter) {
    valueToDisplay = props.valueFormatter(state.profileData[props.fieldName] as string);
  }

  return (
    <div className="margin-bottom-4">
      <FieldLabelProfile fieldName={props.fieldName} locked={true} />
      <div>{valueToDisplay}</div>
    </div>
  );
};
