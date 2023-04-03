import { Content, ExternalLink } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject, Task } from "@/lib/types/types";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupIndustryById, UserData } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useMemo, useState } from "react";

interface Props {
  onSave: () => void;
  task: Task;
  isAuthenticated: IsAuthenticated;
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
  CMS_ONLY_displayInput?: boolean; // for CMS only
}

export const NaicsCodeInput = (props: Props): ReactElement => {
  const { Config } = useConfig();
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
  const [displayInputState, setDisplayInput] = useState<boolean>(false);
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const userDataFromHook = useUserData();
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const displayInput = props.CMS_ONLY_displayInput ?? displayInputState;
  const updateQueue = userDataFromHook.updateQueue;

  const getCode = (code: string): NaicsCodeObject | undefined => {
    return (NaicsCodes as NaicsCodeObject[]).find((element) => {
      return element?.SixDigitCode?.toString() === code;
    });
  };

  const getDescriptions = (codes: string[]): NaicsCodeObject[] => {
    return (NaicsCodes as NaicsCodeObject[]).filter((element) => {
      return codes.includes(element?.SixDigitCode?.toString() ?? "");
    });
  };

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setNaicsCode(userData.profileData.naicsCode);
    const industryNaicsCodes =
      LookupIndustryById(userData.profileData.industryId)
        .naicsCodes?.replace(/\s/g, "")
        .split(",")
        .filter((value) => {
          return value.length > 0;
        }) ?? [];
    setIndustryCodes(industryNaicsCodes);
    const hasExistingCode = userData.profileData.naicsCode.length > 0;
    const existingCodeIsIndustryCode = industryNaicsCodes.includes(userData.profileData.naicsCode);
    if (industryNaicsCodes.length === 0 || (hasExistingCode && !existingCodeIsIndustryCode)) {
      setDisplayInput(true);
    }
  }, userData);

  const saveNaicsCode = async (): Promise<void> => {
    if (!updateQueue) {
      return;
    }

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

    queueUpdateTaskProgress(props.task.id, "COMPLETED");
    updateQueue
      .queueProfileData({ naicsCode })
      .update()
      .then(async () => {
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
      if (getCode(value)) {
        setIsInvalid(undefined);
      } else {
        setIsInvalid("invalid");
      }
    } else {
      setIsInvalid(undefined);
    }
  };

  const setInProgress = (): void => {
    if (!updateQueue) {
      return;
    }
    updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
  };

  let saveButtonText = Config.determineNaicsCode.saveButtonText;
  if (props.isAuthenticated === IsAuthenticated.FALSE) {
    saveButtonText = `Register & ${saveButtonText}`;
  }

  const descriptions = useMemo(() => {
    return getDescriptions(industryCodes ?? []);
  }, [industryCodes]);

  return (
    <>
      <h2 className="text-normal">{Config.determineNaicsCode.findCodeHeader}</h2>
      {industryCodes.length > 0 ? (
        <>
          <Content>{Config.determineNaicsCode.suggestedCodeBodyText}</Content>
          <FormControl variant="outlined" fullWidth className="tablet:margin-left-205 margin-top-2">
            <RadioGroup
              aria-label={"Recommended NAICS codes"}
              name={"naics-radio-group"}
              value={naicsCode}
              onChange={(event: React.ChangeEvent<{ name?: string; value: string }>): void => {
                setNaicsCode(event.target.value);
                if (displayInput) setDisplayInput(false);
                setInProgress();
              }}
              data-testid="post-onboarding-radio-btn"
            >
              {industryCodes?.map((code) => {
                return (
                  <FormControlLabel
                    key={code}
                    style={{ alignItems: "center" }}
                    labelPlacement="end"
                    className="text-bold"
                    data-testid={`naics-radio-${code}`}
                    value={code}
                    control={<Radio color="primary" />}
                    label={
                      <>
                        <span className="text-bold margin-right-05">{code}</span>
                        <span className="margin-right-05">- </span>
                        <ExternalLink
                          href={templateEval(Config.determineNaicsCode.naicsDescriptionURL, { code: code })}
                        >
                          {descriptions.find((obj) => {
                            return obj.SixDigitCode?.toString() === code;
                          })?.SixDigitDescription ?? ""}
                        </ExternalLink>
                      </>
                    }
                  />
                );
              })}
              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                data-testid="naics-radio-input"
                onChange={(): void => {
                  setDisplayInput(true);
                  setNaicsCode("");
                  setIsInvalid(undefined);
                  setInProgress();
                }}
                value=""
                checked={displayInput}
                control={<Radio color="primary" />}
                label={"Search for other NAICS codes"}
              />
            </RadioGroup>
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
              <Content>{Config.determineNaicsCode.naicsLink}</Content>
            </li>
          </ul>
          <div>
            <Content>{Config.determineNaicsCode.inputLabel}</Content>
            <GenericTextField
              fieldName="naicsCode"
              numericProps={{ maxLength: LENGTH }}
              value={naicsCode}
              ariaLabel="Save NAICS Code"
              fieldOptions={{
                inputProps: { style: { backgroundColor: "white" } },
                sx: {
                  maxWidth: "350px",
                },
              }}
              error={isInvalid !== undefined}
              handleChange={handleChange}
              validationText={errorMessages[isInvalid ?? "length"]}
            />
          </div>
        </div>
      ) : (
        <></>
      )}
      {displayInput || naicsCode !== "" ? (
        <>
          <hr className="margin-y-2" />
          <div className="flex flex-row margin-left-auto">
            <SecondaryButton isColor="primary" onClick={saveNaicsCode} isLoading={isLoading}>
              {saveButtonText}
            </SecondaryButton>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
