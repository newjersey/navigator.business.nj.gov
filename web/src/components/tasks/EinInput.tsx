import { GenericTextField } from "@/components/GenericTextField";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
  isAuthenticated: IsAuthenticated;
  onSave: () => void;
}

export const EinInput = (props: Props): ReactElement<any> => {
  const LENGTH = 9;
  const { Config } = useConfig();
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [employerId, setEmployerId] = useState<string>("");
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { business, updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  useMountEffectWhenDefined(() => {
    if (!business) return;
    setEmployerId(business.profileData.employerId || "");
  }, business);

  const handleChange = (value: string): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
      return;
    }
    setEmployerId(value);
  };

  const save = async (): Promise<void> => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
      return;
    }

    if (!business || !updateQueue) return;

    if (employerId.length !== LENGTH) {
      setIsInvalid(true);
      return;
    }

    setIsInvalid(false);
    setIsLoading(true);

    queueUpdateTaskProgress(props.task.id, "COMPLETED");
    updateQueue
      .queueProfileData({ employerId })
      .update()
      .then(() => {
        setIsLoading(false);
        props.onSave();
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="display-flex flex-column mobile-lg:flex-row">
      <GenericTextField
        fieldName="employerId"
        error={isInvalid}
        validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: LENGTH.toString(),
        })}
        numericProps={{ minLength: LENGTH, maxLength: LENGTH }}
        visualFilter={displayAsEin}
        handleChange={handleChange}
        value={employerId}
        inputWidth="full"
        ariaLabel="Save your EIN"
      />
      <div className="mobile-lg:margin-left-1 mobile-lg:margin-top-05">
        <SecondaryButton
          isColor="primary"
          onClick={save}
          isLoading={isLoading}
          isSubmitButton={true}
          isRightMarginRemoved={true}
        >
          <span className="padding-x-3 no-wrap">{Config.ein.saveButtonText}</span>
        </SecondaryButton>
      </div>
    </div>
  );
};
