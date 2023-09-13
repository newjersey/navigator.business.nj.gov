import { Content } from "@/components/Content";
import { fetchPostOnboarding } from "@/lib/async-content-fetchers/fetchPostOnboarding";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { postOnboardingCheckboxes } from "@/lib/domain-logic/postOnboardingCheckboxes";
import { PostOnboarding } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useEffect, useMemo, useState } from "react";

interface Props {
  postOnboardingQuestionId: keyof typeof postOnboardingCheckboxes;
  onboardingKey: keyof ProfileData;
  taskId: string;
}

export const PostOnboardingRadioQuestion = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const [onboardingQuestion, setOnboardingQuestion] = useState<PostOnboarding>({
    contentMd: "",
    question: "",
    radioNo: "",
    radioYes: "",
    radioNoContent: "",
  });

  const checkboxes = postOnboardingCheckboxes[props.postOnboardingQuestionId];
  const selectedCheckboxes = useMemo(() => {
    return checkboxes.filter((key) => business?.taskItemChecklist[key] === true).join(",");
  }, [business?.taskItemChecklist, checkboxes]);

  useEffect(() => {
    if (!business || !updateQueue) return;
    if (business.profileData[props.onboardingKey] !== true) return;

    const allCheckboxesSelected = checkboxes.every((key) => {
      return business.taskItemChecklist[key];
    });

    if (allCheckboxesSelected) {
      updateQueue.queueTaskProgress({ [props.taskId]: "COMPLETED" }).update();
    } else {
      updateQueue.queueTaskProgress({ [props.taskId]: "IN_PROGRESS" }).update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCheckboxes]);

  useEffect(() => {
    fetchPostOnboarding(props.postOnboardingQuestionId).then((postOnboarding) => {
      setOnboardingQuestion(postOnboarding);
    });
  }, [props.postOnboardingQuestionId]);

  const handleRadioChange = async (
    event: React.ChangeEvent<{ name?: string; value: string }>
  ): Promise<void> => {
    if (!updateQueue || !business) {
      return;
    }

    if (event.target.value === "false") {
      const uncheckedCheckboxes = checkboxes.reduce((acc, checkboxId) => {
        return {
          ...acc,
          [checkboxId]: false,
        };
      }, {});

      updateQueue.queueTaskItemChecklist(uncheckedCheckboxes);
    }

    await updateQueue
      .queueProfileData({
        [props.onboardingKey]: event.target.value === "true",
      })
      .queueTaskProgress({
        [props.taskId]: event.target.value === "true" ? "IN_PROGRESS" : "COMPLETED",
      })
      .update();
  };

  return (
    <>
      {onboardingQuestion.question && (
        <>
          <div className="margin-top-205">
            <div
              role="heading"
              aria-level={2}
              data-testid={props.postOnboardingQuestionId}
              className="h4-styling "
            >
              {onboardingQuestion.question}
            </div>
          </div>
          <FormControl fullWidth>
            <RadioGroup
              aria-label={onboardingQuestion.question}
              name={props.postOnboardingQuestionId}
              value={business?.profileData[props.onboardingKey] ?? ""}
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
          {business?.profileData[props.onboardingKey] && (
            <div data-testid="post-onboarding-true-content">
              <hr className="margin-y-2" />
              <Content>{onboardingQuestion.contentMd}</Content>
            </div>
          )}
          {business?.profileData[props.onboardingKey] === false && (
            <div data-testid="post-onboarding-false-content">
              <hr className="margin-y-2" />
              <Content>{onboardingQuestion.radioNoContent}</Content>
            </div>
          )}
        </>
      )}
    </>
  );
};
