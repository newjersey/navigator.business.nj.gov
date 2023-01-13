import { Content } from "@/components/Content";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { TaxDisplay } from "@/components/tasks/TaxDisplay";
import { TaxInput } from "@/components/tasks/TaxInput";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
}

export const TaxTask = (props: Props): ReactElement => {
  const [showInput, setShowInput] = useState<boolean>(true);
  const { userData, updateQueue } = useUserData();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();

  useMountEffectWhenDefined(() => {
    if (!userData || !updateQueue) {
      return;
    }
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return;
    }
    setShowInput(userData.profileData.taxId?.length != 12);
    if (
      userData.profileData.taxId &&
      userData.profileData.taxId?.length > 0 &&
      userData.profileData.taxId?.length < 12
    ) {
      updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
    }
  }, userData && updateQueue);

  const onRemove = () => {
    if (!userData || !updateQueue) {
      return;
    }
    setShowInput(true);
    const newTaxValue = emptyProfileData.taxId;
    updateQueue
      .queueTaskProgress({ [props.task.id]: "IN_PROGRESS" })
      .queueProfileData({ taxId: newTaxValue, encryptedTaxId: undefined })
      .update();
  };

  const onSave = () => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setRegistrationModalIsVisible(true);
      return;
    }
    setShowInput(false);
  };

  const preInputContent = props.task.contentMd.split("${taxInputComponent}")[0];
  const postInputContent = props.task.contentMd.split("${taxInputComponent}")[1];

  const hasTradeNameLegalStructure = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).hasTradeName;
  };

  return (
    <div className="minh-38">
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{preInputContent}</Content>
      <div className="margin-left-5 margin-top-1">
        <Content>{Config.tax.descriptionText}</Content>
        {hasTradeNameLegalStructure() && (
          <div data-testid="tax-disclaimer">
            <Content className="margin-top-2">
              {Config.profileDefaults.fields.taxId.default.disclaimerMd}
            </Content>
          </div>
        )}
        {showInput && <TaxInput isAuthenticated={isAuthenticated} onSave={onSave} task={props.task} />}
        {!showInput && <TaxDisplay onRemove={onRemove} taxId={userData?.profileData.taxId || ""} />}
      </div>
      <Content>{postInputContent}</Content>
      <TaskCTA link={props.task.callToActionLink} text={props.task.callToActionText} />
    </div>
  );
};
