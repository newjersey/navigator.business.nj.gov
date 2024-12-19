import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { CallToActionHyperlink, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { ProfileData } from "@businessnjgovnavigator/shared/index";
import { ReactElement } from "react";

interface Props {
  task?: Task | undefined;
  onboardingKey?: keyof ProfileData | undefined;
}

export const TaskCtaLinks = (props: Props): ReactElement<any> => {
  const ctaButtons: CallToActionHyperlink[] = [];
  const { Config } = useConfig();

  const taskCtaDestination = props.task?.callToActionLink;
  let taskCtaText = props.task?.callToActionText ?? "";

  if (taskCtaText.length === 0) {
    taskCtaText = Config.taskDefaults.defaultCallToActionText;
  }

  const hasTaskCta = taskCtaDestination;

  if (hasTaskCta) {
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

  return <></>;
};
