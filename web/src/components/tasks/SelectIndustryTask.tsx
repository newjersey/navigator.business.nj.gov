import { Content } from "@/components/Content";
import { Industry } from "@/components/data-fields/Industry";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { TaskHeader } from "@/components/TaskHeader";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getFlow } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useEffect, useState } from "react";

type Props = {
  task: Task;
};

export const SelectIndustryTask = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { business, updateQueue } = useUserData();
  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  useEffect(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, [business]);

  FormFuncWrapper(async () => {
    if (!updateQueue || !business) return;
    const profileDataHasNotChanged =
      JSON.stringify(profileData) === JSON.stringify(business.profileData);
    if (profileDataHasNotChanged) {
      return;
    }
    await updateQueue.queueProfileData(profileData).update();
  });

  // Split content at first horizontal line break, to allow inserting the industry dropdown in between
  const contentBeforeDropdown = props.task.contentMd.slice(
    0,
    Math.max(0, props.task.contentMd.indexOf("\n---\n")),
  );
  const contentAfterDropdown = props.task.contentMd.slice(
    Math.max(0, props.task.contentMd.indexOf("\n---\n") + 5),
  );

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: getFlow(profileData),
          },
          setProfileData,
          onBack: (): void => {},
        }}
      >
        <div className="flex flex-column space-between min-height-38rem">
          <div>
            <TaskHeader task={props.task} />
            <Content>{contentBeforeDropdown}</Content>
            <Industry />
            <HorizontalLine />
            <Content>{contentAfterDropdown}</Content>
          </div>
          <CtaContainer>
            <ActionBarLayout>
              <LiveChatHelpButton
                analyticsEvent={analytics.event.cigarette_license_help_button.click.open_live_chat}
              />
              <PrimaryButton
                isColor="primary"
                onClick={onSubmit}
                dataTestId="cta-primary-1"
                isRightMarginRemoved={true}
              >
                Save {/* TODO: move to cms config  */}
              </PrimaryButton>
            </ActionBarLayout>
          </CtaContainer>
        </div>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
