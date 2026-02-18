import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileContentField } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import analytics from "@/lib/utils/analytics";

export const NonEssentialQuestionForPersonas = (props: {
  questionId: ProfileContentField;
  displayAltDescription?: boolean;
}): ReactElement => {
  const nonEssentialQuestion = useRef(null);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const nonEssentialQuestionInViewPort = useIntersectionOnElement(nonEssentialQuestion, "-20px");
  const Config = getMergedConfig();
  const contentFromConfig = getProfileConfig({
    config: Config,
    fieldName: props.questionId,
  });
  const nonEssentialQuestionText = contentFromConfig.description;

  useEffect(() => {
    if (!(nonEssentialQuestionInViewPort && !hasBeenSeen)) {
      return;
    }

    if (nonEssentialQuestionText) {
      analytics.event.non_essential_question_view.view.non_essential_question_view(
        props.questionId,
      );
    }
    const timeoutId = setTimeout(() => {
      setHasBeenSeen(true);
    }, 0);
    return (): void => clearTimeout(timeoutId);
  }, [nonEssentialQuestionInViewPort, hasBeenSeen, nonEssentialQuestionText, props.questionId]);

  return (
    <section ref={nonEssentialQuestion} className="margin-top-3">
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
    </section>
  );
};
