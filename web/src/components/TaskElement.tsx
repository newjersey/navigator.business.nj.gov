import { Content } from "@/components/Content";
import { DeferredLocationQuestion } from "@/components/DeferredLocationQuestion";
import { HorizontalLine } from "@/components/HorizontalLine";
import { PostOnboardingRadioQuestion } from "@/components/post-onboarding/PostOnboardingRadioQuestion";
import { TaskFooterCtas } from "@/components/TaskFooterCtas";
import { TaskHeader } from "@/components/TaskHeader";
import { fetchPostOnboarding } from "@/lib/async-content-fetchers/fetchPostOnboarding";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { postOnboardingCheckboxes } from "@/lib/domain-logic/postOnboardingCheckboxes";
import { PostOnboarding, Task } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { LookupTaskAgencyById } from "@businessnjgovnavigator/shared";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useEffect, useState } from "react";

interface Props {
  task: Task;
  children?: ReactNode | ReactNode[];
  CMS_ONLY_fakeBusiness?: Business;
}

export const TaskElement = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const hasPostOnboardingQuestion = !!props.task.postOnboardingQuestion;
  const shouldShowDeferredQuestion = props.task.requiresLocation;
  let hasDeferredLocationQuestion = false;
  const [postOnboardingQuestion, setPostOnboardingQuestion] = useState<PostOnboarding | undefined>(undefined);

  const deferredLocationQuestion = {
    before: "",
    innerContent: "",
    after: "",
  };

  const postOnboardingQuestionContent = {
    before: "",
    innerContent: "",
    after: "",
  };

  const renderPostOnboardingQuestion = (): ReactElement => {
    if (!postOnboardingQuestion || !props.task.postOnboardingQuestion) {
      return <></>;
    }

    return rswitch(props.task.postOnboardingQuestion, {
      "construction-renovation": (
        <PostOnboardingRadioQuestion
          postOnboardingQuestion={postOnboardingQuestion}
          onboardingKey="constructionRenovationPlan"
          taskId={props.task.id}
        />
      ),
      default: <></>,
    });
  };

  useEffect(() => {
    if (
      !props.task.postOnboardingQuestion ||
      !Object.keys(postOnboardingCheckboxes).includes(props.task.postOnboardingQuestion)
    ) {
      return;
    }

    fetchPostOnboarding(props.task.postOnboardingQuestion).then((postOnboarding) => {
      setPostOnboardingQuestion(postOnboarding);
    });
  }, [hasPostOnboardingQuestion, props.task.id, props.task.postOnboardingQuestion]);

  if (props.task.contentMd) {
    const [beforePostOnboarding, afterPostOnboarding] =
      props.task.contentMd.split("{postOnboardingQuestion}");
    postOnboardingQuestionContent.before = beforePostOnboarding;
    postOnboardingQuestionContent.after = afterPostOnboarding;
    hasDeferredLocationQuestion =
      props.task.contentMd.includes("${beginLocationDependentSection}") &&
      props.task.contentMd.includes("${endLocationDependentSection}");

    const [beforeDeferredLocation, rest] = props.task.contentMd.split("${beginLocationDependentSection}");
    deferredLocationQuestion.before = beforeDeferredLocation;
    deferredLocationQuestion.after = rest;
    if (rest) {
      const [innerContentDeferredLocation, afterDeferredLocation] = rest.split(
        "${endLocationDependentSection}"
      );
      deferredLocationQuestion.innerContent = innerContentDeferredLocation;
      deferredLocationQuestion.after = afterDeferredLocation;
    }
  }

  const getAgencyText = (): string => {
    const agency = props.task.agencyId ? LookupTaskAgencyById(props.task.agencyId).name : "";
    const context = props.task.agencyAdditionalContext ?? "";
    if (agency && context) {
      return `${agency}, ${context}`;
    } else if (agency) {
      return agency;
    } else if (context) {
      return context;
    }
    return "";
  };

  return (
    <div id="taskElement" className="flex flex-column space-between minh-38">
      <div>
        <TaskHeader task={props.task} />
        {props.children}
        <Content>{props.task.summaryDescriptionMd || ""}</Content>

        {hasDeferredLocationQuestion && (
          <>
            <Content>{deferredLocationQuestion.before}</Content>
            {shouldShowDeferredQuestion && (
              <DeferredLocationQuestion
                innerContent={deferredLocationQuestion.innerContent}
                CMS_ONLY_fakeBusiness={props.CMS_ONLY_fakeBusiness}
              />
            )}
            <Content>{deferredLocationQuestion.after}</Content>
          </>
        )}

        {hasPostOnboardingQuestion && (
          <>
            <Content>{postOnboardingQuestionContent.before}</Content>
            {renderPostOnboardingQuestion()}
            {postOnboardingQuestionContent.after && <Content>{postOnboardingQuestionContent.after}</Content>}
          </>
        )}

        {!hasPostOnboardingQuestion && !hasDeferredLocationQuestion && (
          <>
            <Content>{props.task.contentMd}</Content>
          </>
        )}

        {(props.task.agencyId || props.task.formName || props.task.agencyAdditionalContext) && (
          <HorizontalLine />
        )}

        {(props.task.agencyId || props.task.agencyAdditionalContext) && (
          <div>
            <span className="h5-styling">{`${Config.taskDefaults.issuingAgencyText}: `}</span>
            <span className="h6-styling">{getAgencyText()}</span>
          </div>
        )}
        {props.task.formName && (
          <div>
            <span className="h5-styling">{`${Config.taskDefaults.formNameText}: `}</span>
            <span className="h6-styling">{props.task.formName}</span>
          </div>
        )}
      </div>
      <TaskFooterCtas
        postOnboardingQuestion={postOnboardingQuestion}
        task={props.task}
        onboardingKey="constructionRenovationPlan"
      />
    </div>
  );
};
