import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { StepInfo } from "@/components/starter-kits/StepInfo";
import { Roadmap, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

interface Props {
  stepsTitle: string;
  roadmap: Roadmap;
  onCtaClick: () => void;
  ctaText: string;
}

export const StepSection = (props: Props): ReactElement<any> => {
  const getTaskNamesForStep = (tasks: Task[], step: number): string[] => {
    return tasks.filter((task) => task.stepNumber === step).map((task) => task.name);
  };

  return (
    <section className="display-flex flex-column gap-4 margin-x-2 desktop:margin-x-neg-4 bg-cool-extra-light radius-lg margin-bottom-3 padding-x-2 padding-y-5 desktop:padding-y-10 desktop:padding-x-5">
      <div className="padding-x-2 display-flex flex-column flex-justify gap-5 flex-align-center">
        <div className="border-top-1 border-secondary-vivid-dark width-8" />
        <Heading level={2}>{props.stepsTitle}</Heading>
      </div>
      <div className="display-flex flex-column desktop:flex-row gap-4 padding-x-2 desktop:padding-x-0">
        {props.roadmap.steps.map((step) => (
          <StepInfo
            step={step}
            taskNames={getTaskNamesForStep(props.roadmap.tasks, step.stepNumber)}
            key={step.stepNumber}
          />
        ))}
      </div>
      <div className="flex-align-self-stretch desktop:flex-align-self-center tablet:flex-align-self-center">
        <PrimaryButton
          isColor={"secondary-vivid-dark"}
          onClick={() => {
            analytics.event.starter_kit_landing.click.get_my_starter_kit_button_footer();
            props.onCtaClick();
          }}
          isRightMarginRemoved={true}
          isLargeButton={true}
        >
          {props.ctaText}
        </PrimaryButton>
      </div>
    </section>
  );
};
