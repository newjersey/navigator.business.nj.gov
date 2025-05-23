import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import { convertTextToMarkdownBold } from "@/lib/utils/content-helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  essentialQuestionId: string;
}

export const NonEssentialQuestion = (props: Props): ReactElement => {
  const nonEssentialQuestionText = getNonEssentialQuestionText(props.essentialQuestionId);
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: string }>): void => {
    setProfileData({
      ...state.profileData,
      nonEssentialRadioAnswers: {
        ...state.profileData.nonEssentialRadioAnswers,
        [props.essentialQuestionId]: event.target.value === "true",
      },
    });
  };

  return (
    <>
      {nonEssentialQuestionText && (
        <>
          <Content className={"margin-top-2"}>
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
        </>
      )}
    </>
  );
};
