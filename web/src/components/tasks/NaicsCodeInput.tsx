import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useState } from "react";

interface Props {
  readonly onSave: () => void;
  readonly task: Task;
}

export const NaicsCodeInput = (props: Props): ReactElement => {
  const LENGTH = 6;
  const [naicsCode, setNaicsCode] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<boolean>(false);
  const { userData, update } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setNaicsCode(userData.profileData.naicsCode);
  }, userData);

  const saveNaicsCode = async (): Promise<void> => {
    if (!userData) return;

    if (naicsCode.length !== LENGTH) {
      setIsInvalid(true);
      return;
    }

    setIsInvalid(false);
    await update({
      ...userData,
      profileData: {
        ...userData.profileData,
        naicsCode: naicsCode,
      },
      taskProgress: {
        ...userData.taskProgress,
        [props.task.id]: "COMPLETED",
      },
    });
    props.onSave();
  };

  const handleChange = (value: string): void => {
    setNaicsCode(value);
    if (value.length === LENGTH) {
      setIsInvalid(false);
    }
  };

  return (
    <>
      <h2 className="text-normal">{Config.determineNaicsCode.findCodeHeader}</h2>
      <Content>{Config.determineNaicsCode.findCodeBodyText}</Content>
      <ul>
        <li>
          <Content>{Config.determineNaicsCode.sicCodeLink}</Content>
        </li>
        <li>
          <Content>{Config.determineNaicsCode.naicsLink}</Content>
        </li>
      </ul>
      <div className="padding-left-4">
        <Content>{Config.determineNaicsCode.inputLabel}</Content>
        <GenericTextField
          fieldName="naicsCode"
          numericProps={{ maxLength: LENGTH }}
          value={naicsCode}
          placeholder={Config.determineNaicsCode.inputPlaceholder}
          fieldOptions={{
            inputProps: { style: { backgroundColor: "white" } },
            sx: {
              maxWidth: "350px",
            },
          }}
          error={isInvalid}
          handleChange={handleChange}
          validationText={Config.determineNaicsCode.validationErrorText}
        />
        <hr className="margin-y-2" />
        <div className="flex flex-row">
          <Button style="secondary" className="margin-left-auto" onClick={saveNaicsCode}>
            {Config.determineNaicsCode.saveButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
