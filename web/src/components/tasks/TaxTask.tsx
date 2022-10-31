import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext, useState } from "react";
import { TaxDisplay } from "./TaxDisplay";
import { TaxInput } from "./TaxInput";

interface Props {
  task: Task;
}

export const TaxTask = (props: Props): ReactElement => {
  const [showInput, setShowInput] = useState<boolean>(true);
  const { userData, updateQueue } = useUserData();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return;
    }
    setShowInput(!userData.profileData.taxId);
  }, userData);

  const setBackToEditing = ({ remove }: { remove: boolean }) => {
    if (!userData || !updateQueue) {
      return;
    }
    setShowInput(true);
    const newTaxValue = remove ? emptyProfileData.taxId : userData.profileData.taxId;
    updateQueue
      .queueTaskProgress({ [props.task.id]: "IN_PROGRESS" })
      .queueProfileData({ taxId: newTaxValue })
      .update();
  };

  const onEdit = () => {
    return setBackToEditing({ remove: false });
  };
  const onRemove = () => {
    return setBackToEditing({ remove: true });
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

  return (
    <div className="minh-38">
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{preInputContent}</Content>
      <div className="margin-left-5 margin-top-1">
        <Content>{Config.tax.descriptionText}</Content>
        {showInput && <TaxInput isAuthenticated={isAuthenticated} onSave={onSave} task={props.task} />}
        {!showInput && (
          <TaxDisplay onEdit={onEdit} onRemove={onRemove} taxId={userData?.profileData.taxId || ""} />
        )}
      </div>
      <Content>{postInputContent}</Content>
    </div>
  );
};
