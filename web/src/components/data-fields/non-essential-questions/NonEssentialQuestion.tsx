import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import { convertTextToMarkdownBold } from "@/lib/utils/content-helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, {ReactElement, useContext, useEffect, useRef, useState} from "react";
import {useIntersectionOnElement} from "@/lib/utils/useIntersectionOnElement";
import analytics from "@/lib/utils/analytics";
import {setNonEssentialQuestionViewedDimension} from "@/lib/utils/analytics-helpers";

interface Props {
  essentialQuestionId: string;
}

export const NonEssentialQuestion = (props: Props): ReactElement => {
  const nonEssentialQuestionText = getNonEssentialQuestionText(props.essentialQuestionId);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const nonEssentialQuestion = useRef(null);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const nonEssentialQuestionInViewPort = useIntersectionOnElement(nonEssentialQuestion, "-50px");

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

    if (nonEssentialQuestionText) {
      setNonEssentialQuestionViewedDimension(nonEssentialQuestionText);
      analytics.event.non_essential_question.viewed.view_non_essential_question(nonEssentialQuestionText);
    }
    setHasBeenSeen(true)
  }, [nonEssentialQuestionInViewPort, hasBeenSeen, nonEssentialQuestionText]);


  return (
    <>
      {nonEssentialQuestionText && (
        <>
        <section ref={nonEssentialQuestion}>
          <div className={"margin-top-2"}>
            <div className={"text-bold"}>
<Content className={"margin-top-2"}>
{`${convertTextToMarkdownBold(nonEssentialQuestionText)} ${
  Config.profileDefaults.fields.nonEssentialQuestions.default.optionalText
}`}
        </Content>
            </div>
            <span className={"margin-left-05"}>
              {Config.profileDefaults.fields.nonEssentialQuestions.default.optionalText}
            </span>
          </div>
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
