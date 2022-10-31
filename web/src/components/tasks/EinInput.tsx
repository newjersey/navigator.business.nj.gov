import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { FormControl } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  task: Task;
  isAuthenticated: IsAuthenticated;
  onSave: () => void;
}

export const EinInput = (props: Props): ReactElement => {
  const LENGTH = 9;
  const { Config } = useConfig();
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [employerId, setEmployerId] = useState<string>("");
  const { userData, updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  let saveButtonText = Config.ein.saveButtonText;
  if (props.isAuthenticated === IsAuthenticated.FALSE) {
    saveButtonText = `Register & ${saveButtonText}`;
  }

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setEmployerId(userData.profileData.employerId || "");
  }, userData);

  const handleChange = (value: string): void => {
    setEmployerId(value);
  };

  const save = async (): Promise<void> => {
    if (!userData || !updateQueue) {
      return;
    }

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
    <div>
      <div className="flex flex-row width-100">
        <GenericTextField
          className="width-100"
          fieldName="employerId"
          error={isInvalid}
          validationText={templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
            length: LENGTH.toString(),
          })}
          numericProps={{ minLength: LENGTH, maxLength: LENGTH }}
          placeholder={Config.ein.placeholderText}
          visualFilter={displayAsEin}
          handleChange={handleChange}
          value={employerId}
          formInputFull
          ariaLabel="Save your EIN"
        />
        <FormControl margin="dense">
          <Button
            className="margin-top-1 margin-left-1"
            style="secondary"
            onClick={save}
            loading={isLoading}
            typeSubmit
          >
            <span className="padding-x-3" style={{ whiteSpace: "nowrap" }}>
              {saveButtonText}
            </span>
          </Button>
        </FormControl>
      </div>
    </div>
  );
};
