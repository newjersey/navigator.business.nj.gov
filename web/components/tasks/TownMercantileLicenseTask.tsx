import React, { ReactElement, useEffect, useState } from "react";
import { TaskHeader } from "@/components/TaskHeader";
import { Content } from "@/components/Content";
import { getModifiedTaskContent } from "@/lib/utils/helpers";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import { TaskCTA } from "@/components/TaskCTA";
import { PostOnboarding, Task } from "@/lib/types/types";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { fetchPostOnboarding } from "@/lib/async-content-fetchers/fetchPostOnboarding";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";

interface Props {
  task: Task;
}

export const TownMercantileLicenseTask = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { roadmap } = useRoadmap();
  const [onboardingQuestion, setOnboardingQuestion] = useState<PostOnboarding>({
    contentMd: "",
    question: "",
    radioNo: "",
    radioYes: "",
    radioNoContent: "",
  });

  useEffect(() => {
    if (props.task.id == "check-local-requirements") {
      fetchPostOnboarding("construction-content").then((postOnboarding) => {
        setOnboardingQuestion(postOnboarding);
      });
    }
  }, [props.task.id]);

  const handleConstructionRenovationStatusChange = async (
    event: React.ChangeEvent<{ name?: string; value: string }>
  ) => {
    if (!userData) return;
    await update({
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        constructionRenovationPlan: event.target.value === "true",
      },
    });
  };

  return (
    <>
      <TaskHeader task={props.task} />
      <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
      {onboardingQuestion.question && (
        <>
          <h3 data-testid="construction-radio-question">{onboardingQuestion.question}</h3>
          <FormControl variant="outlined" fullWidth>
            <RadioGroup
              aria-label="Do you need a building permit?"
              name="check-local-requirements"
              value={userData?.onboardingData.constructionRenovationPlan ?? ""}
              onChange={handleConstructionRenovationStatusChange}
              row
              data-testid="construction-renovation-radio-btn"
            >
              <FormControlLabel
                style={{ marginRight: "3rem" }}
                labelPlacement="end"
                data-testid="construction-radio-true"
                value={true}
                control={<Radio color="primary" />}
                label={onboardingQuestion.radioYes}
              />
              <FormControlLabel
                style={{ marginRight: "3rem" }}
                labelPlacement="end"
                data-testid="construction-radio-false"
                value={false}
                control={<Radio color="primary" />}
                label={onboardingQuestion.radioNo}
              />
            </RadioGroup>
          </FormControl>
          {userData?.onboardingData.constructionRenovationPlan && (
            <div data-testid="construction-renovation-content">
              <Content>{onboardingQuestion.contentMd}</Content>
            </div>
          )}
          {userData?.onboardingData.constructionRenovationPlan === false && (
            <div data-testid="construction-renovation-no-action-content">
              <Content>{onboardingQuestion.radioNoContent}</Content>
            </div>
          )}
        </>
      )}
      <TaskCTA
        link={getModifiedTaskContent(roadmap, props.task, "callToActionLink")}
        text={getModifiedTaskContent(roadmap, props.task, "callToActionText")}
      />
    </>
  );
};
