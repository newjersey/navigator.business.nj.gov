import { Content } from "@/components/Content";
import { fetchPostOnboarding } from "@/lib/async-content-fetchers/fetchPostOnboarding";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PostOnboarding } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  id: string;
  onboardingKey: keyof ProfileData;
}

export const RadioQuestion = (props: Props): ReactElement => {
  const { updateQueue } = useUserData();
  const userData = updateQueue?.current();
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

  const handleRadioChange = async (
    event: React.ChangeEvent<{ name?: string; value: string }>
  ): Promise<void> => {
    if (!updateQueue) {
      return;
    }
    await updateQueue
      .queueProfileData({
        [props.onboardingKey]: event.target.value === "true",
      })
      .update();
  };

  return (
    <>
      {onboardingQuestion.question && (
        <>
          <div className="margin-top-205">
            <div role="heading" aria-level={2} data-testid={props.id} className="h4-styling ">
              {onboardingQuestion.question}
            </div>
          </div>
          <FormControl fullWidth>
            <RadioGroup
              aria-label={onboardingQuestion.question}
              name={props.id}
              value={userData?.profileData[props.onboardingKey] ?? ""}
              onChange={handleRadioChange}
              row
              data-testid="post-onboarding-radio-btn"
            >
              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                data-testid="post-onboarding-radio-true"
                value={true}
                control={<Radio color="primary" />}
                label={onboardingQuestion.radioYes}
              />
              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                data-testid="post-onboarding-radio-false"
                value={false}
                control={<Radio color="primary" />}
                label={onboardingQuestion.radioNo}
              />
            </RadioGroup>
          </FormControl>
          {userData?.profileData[props.onboardingKey] && (
            <div data-testid="post-onboarding-true-content">
              <Content>{onboardingQuestion.contentMd}</Content>
            </div>
          )}
          {userData?.profileData[props.onboardingKey] === false && (
            <div data-testid="post-onboarding-false-content">
              <Content>{onboardingQuestion.radioNoContent}</Content>
            </div>
          )}
        </>
      )}
    </>
  );
};
