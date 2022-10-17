import { Content, ExternalLink } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject, Task } from "@/lib/types/types";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LookupIndustryById, UserData } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useMemo, useState } from "react";

interface Props {
  onSave: () => void;
  task: Task;
  isAuthenticated: IsAuthenticated;
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
  CMS_ONLY_displayInput?: boolean; // for CMS only
}

export const NaicsCodeInput = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { setRoadmap } = useContext(RoadmapContext);
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

  const getCode = (code: string) =>
    (NaicsCodes as NaicsCodeObject[]).find((element) => element?.SixDigitCode?.toString() == code);

  const getDescriptions = (codes: string[]) =>
    (NaicsCodes as NaicsCodeObject[]).filter((element) =>
      codes.includes(element?.SixDigitCode?.toString() ?? "")
    );

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setNaicsCode(userData.profileData.naicsCode);
    const industryNaicsCodes =
      LookupIndustryById(userData.profileData.industryId)
        .naicsCodes?.replace(/\s/g, "")
        .split(",")
        .filter((value) => value.length > 0) ?? [];
    setIndustryCodes(industryNaicsCodes);
    const hasExistingCode = userData.profileData.naicsCode.length > 0;
    const existingCodeIsIndustryCode = industryNaicsCodes.includes(userData.profileData.naicsCode);
    if (industryNaicsCodes.length === 0 || (hasExistingCode && !existingCodeIsIndustryCode)) {
      setDisplayInput(true);
    }
  }, userData);

  const saveNaicsCode = async (): Promise<void> => {
    if (!updateQueue) return;

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
        const newRoadmap = await buildUserRoadmap(updateQueue.current().profileData);
        setRoadmap(newRoadmap);
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
    if (!updateQueue) return;
    updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
  };

  let saveButtonText = Config.determineNaicsCode.saveButtonText;
  if (props.isAuthenticated === IsAuthenticated.FALSE) {
    saveButtonText = `Register & ${saveButtonText}`;
  }

  const descriptions = useMemo(() => getDescriptions(industryCodes ?? []), [industryCodes]);

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
                    <div className="padding-y-1">
                      <span className="text-bold margin-right-05">{code}</span>
                      <span className="margin-right-05">- </span>
                      <ExternalLink
                        href={templateEval(Config.determineNaicsCode.naicsDescriptionURL, { code: code })}
                      >
                        {descriptions.find((obj) => obj.SixDigitCode?.toString() == code)
                          ?.SixDigitDescription ?? ""}
                      </ExternalLink>
                    </div>
                  }
                />
              ))}
            </RadioGroup>
            <FormControlLabel
              style={{ marginRight: "0", paddingTop: "0em", paddingBottom: "1em" }}
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
              {saveButtonText}
            </Button>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
