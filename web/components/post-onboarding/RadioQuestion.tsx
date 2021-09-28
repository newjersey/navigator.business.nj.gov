import React, { ReactElement, useEffect, useState } from "react";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { OnboardingData, PostOnboarding } from "@/lib/types/types";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { fetchPostOnboarding } from "@/lib/async-content-fetchers/fetchPostOnboarding";

interface Props {
  id: string;
  onboardingKey: keyof OnboardingData;
}

export const RadioQuestion = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const [onboardingQuestion, setOnboardingQuestion] = useState<PostOnboarding>({
    contentMd: "",
    question: "",
    radioNo: "",
    radioYes: "",
    radioNoContent: "",
  });

  useEffect(() => {
    fetchPostOnboarding(props.id).then((postOnboarding) => {
      setOnboardingQuestion(postOnboarding);
    });
  }, [props.id]);

  const handleRadioChange = async (event: React.ChangeEvent<{ name?: string; value: string }>) => {
    if (!userData) return;
    await update({
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        [props.onboardingKey]: event.target.value === "true",
      },
    });
  };

  return (
    <>
      {onboardingQuestion.question && (
        <>
          <div
            role="heading"
            aria-level={2}
            data-testid={props.id}
            className="h3-element-usa-prose-override margin-y-205"
          >
            {onboardingQuestion.question}
          </div>
          <FormControl variant="outlined" fullWidth>
            <RadioGroup
              aria-label={onboardingQuestion.question}
              name={props.id}
              value={userData?.onboardingData[props.onboardingKey] ?? ""}
              onChange={handleRadioChange}
              row
              data-testid="post-onboarding-radio-btn"
            >
              <FormControlLabel
                style={{ marginRight: "3rem" }}
                labelPlacement="end"
                data-testid="post-onboarding-radio-true"
                value={true}
                control={<Radio color="primary" />}
                label={onboardingQuestion.radioYes}
              />
              <FormControlLabel
                style={{ marginRight: "3rem" }}
                labelPlacement="end"
                data-testid="post-onboarding-radio-false"
                value={false}
                control={<Radio color="primary" />}
                label={onboardingQuestion.radioNo}
              />
            </RadioGroup>
          </FormControl>
          {userData?.onboardingData[props.onboardingKey] && (
            <div data-testid="post-onboarding-true-content">
              <Content>{onboardingQuestion.contentMd}</Content>
            </div>
          )}
          {userData?.onboardingData[props.onboardingKey] === false && (
            <div data-testid="post-onboarding-false-content">
              <Content>{onboardingQuestion.radioNoContent}</Content>
            </div>
          )}
        </>
      )}
    </>
  );
};
