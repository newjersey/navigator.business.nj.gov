import { OnboardingField } from "@/components/onboarding/OnboardingField";
import { ReactElement } from "react";

interface Props {
  handleChangeOverride?: (value: string) => void;
}

export const ProfileNotes = (props: Props): ReactElement => {
  return (
    <OnboardingField
      fieldName={"notes"}
      fieldOptions={{ multiline: true, minRows: 4, inputProps: { maxLength: "500" } }}
      handleChange={props.handleChangeOverride}
    />
  );
};
