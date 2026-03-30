import { Content } from "@/components/Content";
import { Industry } from "@/components/data-fields/Industry";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { TaskHeader } from "@/components/TaskHeader";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import analytics from "@/lib/utils/analytics";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

type Props = {
  task: Task;
};

export const SelectIndustryTask = (props: Props): ReactElement => {
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  // Split content at first horizontal line break, to allow inserting the industry dropdown in between
  const contentBeforeDropdown = props.task.contentMd.slice(
    0,
    Math.max(0, props.task.contentMd.indexOf("\n---\n")),
  );
  const contentAfterDropdown = props.task.contentMd.slice(
    Math.max(0, props.task.contentMd.indexOf("\n---\n") + 5),
  );

  return (
    <>
      <TaskHeader task={props.task} />
      <DataFormErrorMapContext.Provider value={formContextState}>
        <Content>{contentBeforeDropdown}</Content>
        <Industry />
        <HorizontalLine />
        <Content>{contentAfterDropdown}</Content>
        {/* TODO: why is there a gap between this container and the bottom? */}
        <CtaContainer>
          <ActionBarLayout>
            <LiveChatHelpButton
              analyticsEvent={analytics.event.cigarette_license_help_button.click.open_live_chat}
            />
            <SecondaryButton
              isColor="primary"
              onClick={() => {
                analytics.event.cigarette_license.click.switch_to_step_one(); // TODO: update to correct analytics event
              }}
              dataTestId="back"
            >
              Back {/* TODO: move to cms config  */}
            </SecondaryButton>
            <PrimaryButton
              isColor="primary"
              onClick={() => {
                analytics.event.cigarette_license.click.step_two_continue_button(); // TODO: update to correct analytics event
                // TODO: save
              }}
              dataTestId="cta-primary-1"
              isRightMarginRemoved={true}
            >
              Save {/* TODO: move to cms config  */}
            </PrimaryButton>
          </ActionBarLayout>
        </CtaContainer>
      </DataFormErrorMapContext.Provider>
    </>
  );
};
