import { ProfileNumericField } from "@/components/profile/ProfileNumericField";
import { ReactElement, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  disabled?: boolean;
  handleChangeOverride?: (value: string) => void;
}

export const ProfileEntityId = (props: Props): ReactElement => {
  const fieldName = "entityId";

  return (
    <>
      <ProfileNumericField
        fieldName={fieldName}
        maxLength={10}
        disabled={props.disabled}
        handleChange={props.handleChangeOverride}
      />
      {props.children}
    </>
  );
};
