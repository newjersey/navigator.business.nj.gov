import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useState } from "react";

interface Props {
  onSave: () => void;
  task: Task;
}

export const NaicsCodeInput = (props: Props): ReactElement => {
  type NaicsErrorTypes = "length" | "invalid";
  const errorMessages: Record<NaicsErrorTypes, string> = {
    invalid: Config.determineNaicsCode.invalidValidationErrorText,
    length: Config.determineNaicsCode.lengthValidationErrorText,
  };
  const LENGTH = 6;
  const [naicsCode, setNaicsCode] = useState<string>("");
  const [isInvalid, setIsInvalid] = useState<NaicsErrorTypes | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const getCode = (code: string) =>
    (NaicsCodes as NaicsCodeObject[]).find((element) => element?.SixDigitCode?.toString() == code);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setNaicsCode(userData.profileData.naicsCode);
  }, userData);

  const saveNaicsCode = (): void => {
    if (!userData) return;

    if (naicsCode.length !== LENGTH) {
      setIsInvalid("length");
      return;
    }

    if (!getCode(naicsCode)) {
      setIsInvalid("invalid");
      return;
    }

    setIsInvalid(undefined);
    setIsLoading(true);
    update({
      ...userData,
      profileData: {
        ...userData.profileData,
        naicsCode: naicsCode,
      },
      taskProgress: {
        ...userData.taskProgress,
        [props.task.id]: "COMPLETED",
      },
    })
      .then(() => {
        setIsLoading(false);
        props.onSave();
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const handleChange = (value: string): void => {
    setNaicsCode(value);
    if (value.length === LENGTH) {
      if (!getCode(value)) {
        setIsInvalid("invalid");
      } else {
        setIsInvalid(undefined);
      }
    } else {
      setIsInvalid(undefined);
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
          error={isInvalid != undefined}
          handleChange={handleChange}
          validationText={errorMessages[isInvalid ?? "length"]}
        />
        <hr className="margin-y-2" />
        <div className="flex flex-row">
          <Button style="secondary" className="margin-left-auto" onClick={saveNaicsCode} loading={isLoading}>
            {Config.determineNaicsCode.saveButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
