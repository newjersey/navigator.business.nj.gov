import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PrimaryButtonDropdown } from "@/components/njwds-extended/PrimaryButtonDropdown";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { CallToActionHyperlink, PostOnboarding, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { ProfileData } from "@businessnjgovnavigator/shared/index";
import { ReactElement } from "react";

interface Props {
  postOnboardingQuestion: PostOnboarding | undefined;
  task?: Task | undefined;
  onboardingKey?: keyof ProfileData | undefined;
}

export const TaskCtaLinks = (props: Props): ReactElement => {
  const ctaButtons: CallToActionHyperlink[] = [];
  const { Config } = useConfig();
  const { business } = useUserData();

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
    props.onboardingKey && business?.profileData[props.onboardingKey] === true;

  if (hasPostOnboarding && hasAnsweredYesToPostOnboarding) {
    if (link1 && text1) {
      ctaButtons.push({
        text: text1,
        destination: link1,
        onClick: () => {
          analytics.event.task_primary_call_to_action.click.open_external_website(
            text1 || Config.taskDefaults.defaultCallToActionText,
            link1 as string
          );
          openInNewTab(link1);
        },
      });
    }
    if (link2 && text2) {
      ctaButtons.push({
        text: text2,
        destination: link2,
        onClick: () => {
          analytics.event.task_primary_call_to_action.click.open_external_website(
            text2 || Config.taskDefaults.defaultCallToActionText,
            link2 as string
          );
          openInNewTab(link2);
        },
      });
    }
  } else if (hasTaskCta) {
    ctaButtons.push({
      text: taskCtaText,
      destination: taskCtaDestination,
      onClick: () => {
        analytics.event.task_primary_call_to_action.click.open_external_website(
          taskCtaText || Config.taskDefaults.defaultCallToActionText,
          taskCtaDestination as string
        );
        openInNewTab(taskCtaDestination);
      },
    });
  }

  if (ctaButtons.length === 1) {
    const [ctaHyperlink] = ctaButtons;
    return <SingleCtaLink link={ctaHyperlink.destination} text={ctaHyperlink.text} />;
  }

  if (ctaButtons.length > 1 && props.postOnboardingQuestion?.callToActionYesDropdownText) {
    return (
      <CtaContainer>
        <ActionBarLayout>
          <PrimaryButtonDropdown dropdownOptions={ctaButtons} isRightMarginRemoved>
            {props.postOnboardingQuestion.callToActionYesDropdownText}
          </PrimaryButtonDropdown>
        </ActionBarLayout>
      </CtaContainer>
    );
  }

  return <></>;
};
