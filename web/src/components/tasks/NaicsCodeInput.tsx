import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useMemo, useState } from "react";

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
  const [industryCodes, setIndustryCodes] = useState<string[]>([]);
  const [isInvalid, setIsInvalid] = useState<NaicsErrorTypes | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayInput, setDisplayInput] = useState<boolean>(false);

  const { userData, update } = useUserData();

  const getCode = (code: string) =>
    (NaicsCodes as NaicsCodeObject[]).find((element) => element?.SixDigitCode?.toString() == code);

  const getDescriptions = (codes: string[]) =>
    (NaicsCodes as NaicsCodeObject[]).filter((element) =>
      codes.includes(element?.SixDigitCode?.toString() ?? "")
    );

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setNaicsCode(userData.profileData.naicsCode);
    const naicsCodes =
      LookupIndustryById(userData.profileData.industryId)
        .naicsCodes?.split(",")
        .filter((value) => value.length > 0) ?? [];
    setIndustryCodes(naicsCodes);
    if (naicsCodes.length == 0) setDisplayInput(true);
  }, userData);

  const saveNaicsCode = (): void => {
    if (!userData) return;

    if (naicsCode?.length !== LENGTH) {
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

  const setInProgress = () => {
    if (!userData) return;
    update({
      ...userData,
      taskProgress: {
        ...userData.taskProgress,
        [props.task.id]: "IN_PROGRESS",
      },
    });
  };

  const descriptions = useMemo(() => getDescriptions(industryCodes ?? []), [industryCodes]);
  return (
    <>
      <h2 className="text-normal">{Config.determineNaicsCode.findCodeHeader}</h2>
      {industryCodes.length > 0 ? (
        <>
          <Content>{Config.determineNaicsCode.suggestedCodeBodyText}</Content>
          <FormControl variant="outlined" fullWidth className="tablet:margin-left-205">
            <RadioGroup
              aria-label={"Recommended NAICS codes"}
              name={"naics-radio-group"}
              value={naicsCode}
              onChange={(event: React.ChangeEvent<{ name?: string; value: string }>) => {
                setNaicsCode(event.target.value);
                setDisplayInput(false);
                setInProgress();
              }}
              data-testid="post-onboarding-radio-btn"
            >
              {industryCodes?.map((code) => (
                <FormControlLabel
                  key={code}
                  style={{ marginRight: "0", alignItems: "flex-start" }}
                  labelPlacement="end"
                  className="text-bold"
                  data-testid={`naics-radio-${code}`}
                  value={code}
                  control={<Radio color="primary" />}
                  label={
                    <div className="flex padding-y-1">
                      <div className="text-bold margin-right-1 width-8">{code}</div>-{" "}
                      <div className="margin-left-105">
                        {
                          descriptions.find((obj) => obj.SixDigitCode?.toString() == code)
                            ?.SixDigitDescription
                        }
                      </div>
                    </div>
                  }
                />
              ))}
            </RadioGroup>
            <FormControlLabel
              style={{ marginRight: "0", paddingTop: "1em", paddingBottom: "1em" }}
              labelPlacement="end"
              data-testid="naics-radio-input"
              onChange={() => {
                setDisplayInput(true);
                setNaicsCode("");
                setIsInvalid(undefined);
                setInProgress();
              }}
              checked={displayInput}
              control={<Radio color="primary" />}
              label={"Search for other NAICS codes"}
            />
          </FormControl>
        </>
      ) : (
        <> </>
      )}
      {displayInput ? (
        <div className="tablet:margin-left-6">
          <Content>{Config.determineNaicsCode.findCodeBodyText}</Content>
          <ul>
            <li>
              <Content>{Config.determineNaicsCode.sicCodeLink}</Content>
            </li>
            <li>
              <Content>{Config.determineNaicsCode.naicsLink}</Content>
            </li>
          </ul>
          <div>
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
          </div>
        </div>
      ) : (
        <></>
      )}
      {displayInput || naicsCode != "" ? (
        <>
          <hr className="margin-y-2" />
          <div className="flex flex-row">
            <Button
              style="secondary"
              className="margin-left-auto"
              onClick={saveNaicsCode}
              loading={isLoading}
            >
              {Config.determineNaicsCode.saveButtonText}
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
