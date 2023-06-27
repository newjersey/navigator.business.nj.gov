import { Content } from "@/components/Content";
import { DeferredLocationQuestion } from "@/components/DeferredLocationQuestion";
import { RadioQuestion } from "@/components/post-onboarding/RadioQuestion";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { Task } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LookupTaskAgencyById } from "@businessnjgovnavigator/shared/taskAgency";
import {
  generateMunicipality,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode } from "react";

interface Props {
  task: Task;
  children?: ReactNode | ReactNode[];
  overrides?: {
    skipDeferredLocationPrompt: boolean;
  };
}

export const TaskElement = (props: Props): ReactElement => {
  const hasPostOnboardingQuestion = !!props.task.postOnboardingQuestion;
  const shouldShowDeferredQuestion = props.task.requiresLocation;
  let hasDeferredLocationQuestion = false;

  const deferredLocationQuestion = {
    before: "",
    innerContent: "",
    after: "",
  };

  const postOnboardingQuestion = {
    before: "",
    innerContent: "",
    after: "",
  };

  const getPostOnboardingQuestion = (task: Task): ReactElement => {
    if (!task.postOnboardingQuestion) {
      return <></>;
    }
    return rswitch(task.postOnboardingQuestion, {
      "construction-renovation": (
        <RadioQuestion id="construction-renovation" onboardingKey="constructionRenovationPlan" />
      ),
      default: <></>,
    });
  };

  if (props.task.contentMd) {
    const [beforePostOnboarding, afterPostOnboarding] =
      props.task.contentMd.split("{postOnboardingQuestion}");
    postOnboardingQuestion.before = beforePostOnboarding;
    postOnboardingQuestion.after = afterPostOnboarding;
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

  const getFakeUserDataWithMunicipality = (): UserData => {
    return generateUserData({
      profileData: generateProfileData({
        municipality: generateMunicipality({}),
      }),
    });
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
              <>
                {props.overrides?.skipDeferredLocationPrompt && (
                  <DeferredLocationQuestion
                    innerContent={deferredLocationQuestion.innerContent}
                    CMS_ONLY_fakeUserData={getFakeUserDataWithMunicipality()}
                  />
                )}
                {!props.overrides?.skipDeferredLocationPrompt && (
                  <DeferredLocationQuestion innerContent={deferredLocationQuestion.innerContent} />
                )}
              </>
            )}
            <Content>{deferredLocationQuestion.after}</Content>
          </>
        )}

        {hasPostOnboardingQuestion && (
          <>
            <Content>{postOnboardingQuestion.before}</Content>
            {getPostOnboardingQuestion(props.task)}
            {postOnboardingQuestion.after && <Content>{postOnboardingQuestion.after}</Content>}
          </>
        )}

        {!hasPostOnboardingQuestion && !hasDeferredLocationQuestion && (
          <>
            <Content>{props.task.contentMd}</Content>
          </>
        )}

        {(props.task.agencyId || props.task.formName || props.task.agencyAdditionalContext) && (
          <hr className="margin-y-3" />
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
      <TaskCTA link={props.task.callToActionLink} text={props.task.callToActionText} />
    </div>
  );
};
