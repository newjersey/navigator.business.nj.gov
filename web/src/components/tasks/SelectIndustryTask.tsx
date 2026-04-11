import { Content } from "@/components/Content";
import { Industry } from "@/components/data-fields/Industry";
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
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getFlow } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useEffect, useState } from "react";

import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";

type Props = {
  task: Task;
  CMS_ONLY_showSuccessAlert?: boolean;
};

export const SelectIndustryTask = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const { business, updateQueue } = useUserData();
  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());
  const { Config } = useConfig();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

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
    analytics.event.select_industry_task.submit.select_industry();
    queueUpdateTaskProgress(props.task.id, "COMPLETED");
    await updateQueue.queueProfileData(profileData).update();
    setShowSuccessAlert(true);
  });

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
          <div className="">
            <TaskHeader task={props.task} />
            {(showSuccessAlert || props.CMS_ONLY_showSuccessAlert) && (
              <Alert variant="success" className="margin-top-6">
                <Content>{Config.selectIndustryTask.successAlert}</Content>
              </Alert>
            )}
          </div>

          <div>
            <Content>{Config.selectIndustryTask.content}</Content>
            <Industry />
            {!showSuccessAlert && <Content>{Config.selectIndustryTask.infoCallout}</Content>}
          </div>
          <CtaContainer>
            <ActionBarLayout>
              <LiveChatHelpButton
                analyticsEvent={analytics.event.select_industry_task.click.open_live_chat}
              />
              <PrimaryButton
                isColor="primary"
                onClick={onSubmit}
                dataTestId="cta-primary-1"
                isRightMarginRemoved={true}
              >
                <Content>{Config.selectIndustryTask.save}</Content>
              </PrimaryButton>
            </ActionBarLayout>
          </CtaContainer>
        </div>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
