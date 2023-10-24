import { PrimaryButtonDropdown } from "@/components/njwds-extended/PrimaryButtonDropdown";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskFooter } from "@/components/TaskFooter";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { CallToActionHyperlink, PostOnboarding, Task } from "@/lib/types/types";
import { openInNewTab } from "@/lib/utils/helpers";
import { ProfileData } from "@businessnjgovnavigator/shared/index";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  postOnboardingQuestion: PostOnboarding | undefined;
  task?: Task | undefined;
  CMS_ONLY_forceDisplay?: boolean | undefined;
  onboardingKey?: keyof ProfileData | undefined;
}

export const TaskFooterCtas = (props: Props): ReactElement => {
  const ctaButtons: CallToActionHyperlink[] = [];
  const { Config } = useConfig();
  const { business } = useUserData();
  const router = useRouter();

  const taskCtaDestination = props.task?.callToActionLink;
  let taskCtaText = props.task?.callToActionText ?? "";

  if (taskCtaText.length === 0) {
    taskCtaText = Config.taskDefaults.defaultCallToActionText;
  }

  const link1 = props.postOnboardingQuestion?.callToActionYesLink1;
  const text1 = props.postOnboardingQuestion?.callToActionYesText1;
  const link2 = props.postOnboardingQuestion?.callToActionYesLink2;
  const text2 = props.postOnboardingQuestion?.callToActionYesText2;

  const hasTaskCta = taskCtaDestination;
  const hasPostOnboarding = !!props.postOnboardingQuestion;

  const hasAnsweredYesToPostOnboarding =
    (props.onboardingKey && business?.profileData[props.onboardingKey] === true) ||
    props.CMS_ONLY_forceDisplay;

  if (hasPostOnboarding && hasAnsweredYesToPostOnboarding) {
    if (link1 && text1) {
      ctaButtons.push({
        text: text1,
        destination: link1,
        onClick: () => {
          if (props.CMS_ONLY_forceDisplay) {
            openInNewTab(link1);
          } else {
            router.push(link1);
          }
        },
      });
    }
    if (link2 && text2) {
      ctaButtons.push({
        text: text2,
        destination: link2,
        onClick: () => {
          if (props.CMS_ONLY_forceDisplay) {
            openInNewTab(link2);
          } else {
            router.push(link2);
          }
        },
      });
    }
  } else if (hasTaskCta) {
    ctaButtons.push({
      text: taskCtaText,
      destination: taskCtaDestination,
      onClick: () => {
        if (props.CMS_ONLY_forceDisplay) {
          openInNewTab(taskCtaDestination);
        } else {
          router.push(taskCtaDestination);
        }
      },
    });
  }

  if (ctaButtons.length === 1) {
    const [ctaHyperlink] = ctaButtons;
    return (
      <div data-testid="cta-area">
        <TaskCTA link={ctaHyperlink.destination} text={ctaHyperlink.text} />
      </div>
    );
  }

  if (ctaButtons.length > 1 && props.postOnboardingQuestion?.callToActionYesDropdownText) {
    return (
      <TaskFooter data-testid="cta-area">
        <PrimaryButtonDropdown dropdownOptions={ctaButtons}>
          {props.postOnboardingQuestion.callToActionYesDropdownText}
        </PrimaryButtonDropdown>
      </TaskFooter>
    );
  }

  return <></>;
};
