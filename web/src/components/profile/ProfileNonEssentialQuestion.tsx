import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import { NonEssentialQuestionResponse } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  essentialQuestionId: string;
}

export const ProfileNonEssentialQuestion = (props: Props): ReactElement => {
  const nonEssentialQuestionText = getNonEssentialQuestionText(props.essentialQuestionId);

  const { state, setProfileData } = useContext(ProfileDataContext);

  const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    setProfileData({
      ...state.profileData,
      nonEssentialQuestions: {
        ...state.profileData.nonEssentialQuestions,
        [props.essentialQuestionId]: event.target.value as NonEssentialQuestionResponse,
      },
    });
  };

  return (
    <>
      {nonEssentialQuestionText && (
        <>
          <div className={"margin-top-2"}>{nonEssentialQuestionText}</div>
          <FormControl fullWidth>
            <RadioGroup
              aria-label={nonEssentialQuestionText}
              name={props.essentialQuestionId}
              value={state.profileData.nonEssentialQuestions?.[props.essentialQuestionId] ?? "NO"}
              onChange={handleChange}
              row
              data-testid={`${props.essentialQuestionId}-essential-question`}
            >
              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                data-testid={`${props.essentialQuestionId}-radio-yes`}
                value={"YES"}
                control={<Radio color="primary" />}
                label={"Yes"}
              />
              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                data-testid={`${props.essentialQuestionId}-radio-no`}
                value={"NO"}
                control={<Radio color="primary" />}
                label={"No"}
              />
            </RadioGroup>
          </FormControl>
        </>
      )}{" "}
    </>
  );
};
