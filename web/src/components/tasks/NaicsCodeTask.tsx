import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { NaicsCodeDisplay } from "@/components/tasks/NaicsCodeDisplay";
import { NaicsCodeInput } from "@/components/tasks/NaicsCodeInput";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { AuthAlertContext } from "@/contexts/authAlertContext";
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
  const { userData, updateQueue } = useUserData();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    if (isAuthenticated === IsAuthenticated.FALSE) return;
    setShowInput(!userData.profileData.naicsCode);
  }, userData);

  const setBackToEditing = ({ remove }: { remove: boolean }) => {
    if (!userData || !updateQueue) return;
    setShowInput(true);
    const newNaicsValue = remove ? emptyProfileData.naicsCode : userData.profileData.naicsCode;
    updateQueue
      .queueTaskProgress({ [props.task.id]: "IN_PROGRESS" })
      .queueProfileData({ naicsCode: newNaicsValue })
      .update();
  };

  const onEdit = () => setBackToEditing({ remove: false });
  const onRemove = () => setBackToEditing({ remove: true });

  const onSave = () => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setRegistrationModalIsVisible(true);
      return;
    }
    setShowInput(false);
  };

  const preLookupContent = props.task.contentMd.split("${naicsCodeLookupComponent}")[0];
  const postLookupContent = props.task.contentMd.split("${naicsCodeLookupComponent}")[1];

  return (
    <div className="minh-38">
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{preLookupContent}</Content>
      {showInput && (
        <div className="margin-y-4 bg-base-extra-light padding-2 radius-lg">
          <NaicsCodeInput onSave={onSave} task={props.task} isAuthenticated={isAuthenticated} />
        </div>
      )}
      {!showInput && (
        <div className="margin-y-4 bg-base-extra-light padding-2 radius-lg">
          <NaicsCodeDisplay
            onEdit={onEdit}
            onRemove={onRemove}
            code={userData?.profileData.naicsCode || ""}
          />
        </div>
      )}
      <Content>{postLookupContent}</Content>
    </div>
  );
};
