import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { NaicsCodeDisplay } from "@/components/tasks/NaicsCodeDisplay";
import { NaicsCodeInput } from "@/components/tasks/NaicsCodeInput";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
}

export const NaicsCodeTask = (props: Props): ReactElement => {
  const [showInput, setShowInput] = useState<boolean>(true);
  const { business, updateQueue } = useUserData();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);

  useMountEffectWhenDefined(() => {
    if (!business) return;
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return;
    }
    setShowInput(!business.profileData.naicsCode);
  }, business);

  const shouldLockField = (): boolean => {
    return business?.profileData.naicsCode !== "" && business?.taxFilingData.state === "SUCCESS";
  };

  const setBackToEditing = ({ remove }: { remove: boolean }): void => {
    if (!business || !updateQueue) return;
    setShowInput(true);
    const newNaicsValue = remove ? emptyProfileData.naicsCode : business.profileData.naicsCode;
    updateQueue
      .queueTaskProgress({ [props.task.id]: "IN_PROGRESS" })
      .queueProfileData({ naicsCode: newNaicsValue })
      .update();
  };

  const onEdit = (): void => {
    return setBackToEditing({ remove: false });
  };

  const onRemove = (): void => {
    return setBackToEditing({ remove: true });
  };

  const onSave = (): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
      return;
    }
    setShowInput(false);
  };

  const preLookupContent = props.task.contentMd.split("${naicsCodeLookupComponent}")[0];
  const postLookupContent = props.task.contentMd.split("${naicsCodeLookupComponent}")[1];

  return (
    <div className="min-height-38rem">
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{preLookupContent}</Content>
      <div className="margin-y-4 bg-base-extra-light padding-3 radius-lg">
        {showInput ? (
          <NaicsCodeInput onSave={onSave} task={props.task} isAuthenticated={isAuthenticated} />
        ) : (
          <NaicsCodeDisplay
            onEdit={onEdit}
            onRemove={onRemove}
            code={business?.profileData.naicsCode || ""}
            lockField={shouldLockField()}
          />
        )}
      </div>
      <Content>{postLookupContent}</Content>
    </div>
  );
};
