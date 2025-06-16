import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileContentField } from "@/lib/types/types";
import { ReactElement } from "react";

export const NonEssentialQuestionForPersonas = (props: {
  questionId: ProfileContentField;
  displayAltDescription?: boolean;
}): ReactElement => {
  return (
    <div data-testid="non-essential-questions-wrapper">
      <ProfileField
        fieldName={props.questionId}
        isVisible
        hideHeader
        hideLine
        fullWidth
        boldAltDescription
        boldDescription
        optionalText
        displayAltDescription={props.displayAltDescription}
      >
        <RadioQuestion<boolean> fieldName={props.questionId} choices={[true, false]} />
      </ProfileField>
    </div>
  );
};
