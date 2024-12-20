import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskHeader } from "@/components/TaskHeader";
import { EinDisplay } from "@/components/tasks/EinDisplay";
import { EinInput } from "@/components/tasks/EinInput";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
}

export const EinTask = (props: Props): ReactElement<any> => {
  const [showInput, setShowInput] = useState<boolean>(true);
  const { business, updateQueue } = useUserData();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { Config } = useConfig();

  useMountEffectWhenDefined(() => {
    if (!business) return;
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return;
    }
    setShowInput(!business.profileData.employerId);
  }, business);

  const setBackToEditing = ({ remove }: { remove: boolean }): void => {
    if (!business || !updateQueue) return;
    setShowInput(true);
    const newEinValue = remove ? emptyProfileData.employerId : business.profileData.employerId;
    updateQueue
      .queueTaskProgress({ [props.task.id]: "IN_PROGRESS" })
      .queueProfileData({ employerId: newEinValue })
      .update();
  };

  const onEdit = (): void => {
    setBackToEditing({ remove: false });
  };

  const onRemove = (): void => {
    setBackToEditing({ remove: true });
  };

  const onSave = (): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
      return;
    }
    setShowInput(false);
  };

  const preInputContent = props.task.contentMd.split("${einInputComponent}")[0];
  const postInputContent = props.task.contentMd.split("${einInputComponent}")[1];

  return (
    <div className="min-height-38rem">
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{props.task.summaryDescriptionMd}</Content>
      <HorizontalLine />
      <Content>{preInputContent}</Content>
      <div className="margin-left-3ch margin-top-1">
        <Content>{Config.ein.descriptionText}</Content>
        {showInput && <EinInput isAuthenticated={isAuthenticated} onSave={onSave} task={props.task} />}
        {!showInput && (
          <EinDisplay
            onEdit={onEdit}
            onRemove={onRemove}
            employerId={business?.profileData.employerId || ""}
          />
        )}
      </div>
      <Content>{postInputContent}</Content>
    </div>
  );
};
