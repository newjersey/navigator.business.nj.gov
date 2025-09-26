import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import analytics from "@/lib/utils/analytics";
import { convertTextToMarkdownBold } from "@/lib/utils/content-helpers";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useRef, useState } from "react";

interface Props {
  essentialQuestionId: string;
}

export const NonEssentialQuestion = (props: Props): ReactElement => {
  const nonEssentialQuestionText = getNonEssentialQuestionText(props.essentialQuestionId);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const nonEssentialQuestion = useRef(null);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const nonEssentialQuestionInViewPort = useIntersectionOnElement(nonEssentialQuestion, "-20px");

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: string }>): void => {
    setProfileData({
      ...state.profileData,
      nonEssentialRadioAnswers: {
        ...state.profileData.nonEssentialRadioAnswers,
        [props.essentialQuestionId]: event.target.value === "true",
      },
    });
  };

  useEffect(() => {
    if (!(nonEssentialQuestionInViewPort && !hasBeenSeen)) {
      return;
    }

    if (props.essentialQuestionId) {
      analytics.event.non_essential_question_view.view.non_essential_question_view(
        props.essentialQuestionId,
      );
    }
    setHasBeenSeen(true);
  }, [
    nonEssentialQuestionInViewPort,
    hasBeenSeen,
    nonEssentialQuestionText,
    props.essentialQuestionId,
  ]);

  return (
    <>
      {nonEssentialQuestionText && (
        <>
          <section ref={nonEssentialQuestion} className="margin-top-3">
            <Content>
              {`${convertTextToMarkdownBold(nonEssentialQuestionText)} ${
                Config.profileDefaults.fields.nonEssentialQuestions.default.optionalText
              }`}
            </Content>
            <FormControl fullWidth>
              <RadioGroup
                aria-label={nonEssentialQuestionText}
                name={props.essentialQuestionId}
                value={state.profileData.nonEssentialRadioAnswers?.[props.essentialQuestionId]}
                onChange={handleChange}
                row
                data-testid={`${props.essentialQuestionId}-essential-question`}
              >
                <FormControlLabel
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  data-testid={`${props.essentialQuestionId}-radio-yes`}
                  value={true}
                  control={<Radio color="primary" />}
                  label={
                    Config.profileDefaults.fields.nonEssentialQuestions.default.radioButtonTrueText
                  }
                />
                <FormControlLabel
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  data-testid={`${props.essentialQuestionId}-radio-no`}
                  value={false}
                  control={<Radio color="primary" />}
                  label={
                    Config.profileDefaults.fields.nonEssentialQuestions.default.radioButtonFalseText
                  }
                />
              </RadioGroup>
            </FormControl>
          </section>
        </>
      )}
    </>
  );
};
