import { GenericTextField } from "@/components/GenericTextField";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { Task } from "@/lib/types/types";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { FormControl, useMediaQuery } from "@mui/material";
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
  const isMobileLg = useMediaQuery(MediaQueries.isXSMobile);

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
      <div className="display-flex flex-column mobile-lg:flex-row">
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
        <FormControl margin={isMobileLg ? "none" : "dense"}>
          <div className="mobile-lg:margin-left-1 mobile-lg:margin-top-1">
            <SecondaryButton isColor="primary" onClick={save} isLoading={isLoading} isSubmitButton={true}>
              <span className="padding-x-3 no-wrap">{saveButtonText}</span>
            </SecondaryButton>
          </div>
        </FormControl>
      </div>
    </div>
  );
};
