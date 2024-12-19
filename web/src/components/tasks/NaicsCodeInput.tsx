import { Content, ExternalLink } from "@/components/Content";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { GenericTextField } from "@/components/GenericTextField";
import { Heading } from "@/components/njwds-extended/Heading";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import { getMergedConfig } from "@/contexts/configContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject, Task } from "@/lib/types/types";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { Business, LookupIndustryById } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement, useContext, useMemo, useState } from "react";

interface Props {
  onSave: () => void;
  task: Task;
  isAuthenticated: IsAuthenticated;
  CMS_ONLY_fakeBusiness?: Business;
  CMS_ONLY_displayInput?: boolean;
}

type NaicsErrorTypes = "length" | "invalid";

const Config = getMergedConfig();
const errorMessages: Record<NaicsErrorTypes, string> = {
  invalid: Config.determineNaicsCode.invalidValidationErrorText,
  length: Config.determineNaicsCode.lengthValidationErrorText,
};

const REQUIRED_LENGTH = 6;

export const NaicsCodeInput = (props: Props): ReactElement<any> => {
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const updateQueue = userDataFromHook.updateQueue;
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  const [naicsCode, setNaicsCode] = useState<string>("");
  const [industryCodes, setIndustryCodes] = useState<string[]>([]);
  const [isInvalid, setIsInvalid] = useState<NaicsErrorTypes | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayInputState, setDisplayInput] = useState<boolean>(false);
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const displayInput = props.CMS_ONLY_displayInput ?? displayInputState;
  const saveButtonText =
    props.isAuthenticated === IsAuthenticated.FALSE
      ? `Register & ${Config.determineNaicsCode.saveButtonText}`
      : Config.determineNaicsCode.saveButtonText;

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
  const descriptions = useMemo(() => {
    return getDescriptions(industryCodes ?? []);
  }, [industryCodes]);
  const getIndustryNaicsCodes = (industryId: string | undefined): string[] =>
    LookupIndustryById(industryId)
      .naicsCodes?.replace(/\s/g, "")
      .split(",")
      .filter((value) => {
        return value.length > 0;
      }) ?? [];
  const handleTextInputChange = (value: string): void => {
    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(true);
      return;
    }
    setNaicsCode(value);
    if (value.length === REQUIRED_LENGTH) {
      if (getCode(value)) {
        setIsInvalid(undefined);
      } else {
        setIsInvalid("invalid");
      }
    } else {
      setIsInvalid(undefined);
    }
  };
  const saveNaicsCode = async (): Promise<void> => {
    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(true);
      return;
    }

    if (!updateQueue) {
      return;
    }

    if (naicsCode?.length !== REQUIRED_LENGTH) {
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
  const setInProgress = (): void => {
    if (!updateQueue) {
      return;
    }
    updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
  };

  useMountEffectWhenDefined(() => {
    if (!business) return;
    setNaicsCode(business.profileData.naicsCode);
    setIndustryCodes(getIndustryNaicsCodes(business.profileData.industryId));

    if (
      getIndustryNaicsCodes(business.profileData.industryId).length === 0 ||
      (business.profileData.naicsCode.length > 0 &&
        !getIndustryNaicsCodes(business.profileData.industryId).includes(business.profileData.naicsCode))
    ) {
      setDisplayInput(true);
    }
  }, business);

  return (
    <>
      <Heading level={2} className="text-normal">
        {Config.determineNaicsCode.findCodeHeader}
      </Heading>
      {industryCodes.length > 0 && (
        <>
          <Content>{Config.determineNaicsCode.suggestedCodeBodyText}</Content>
          <FormControl variant="outlined" fullWidth className="tablet:margin-left-205 margin-top-2">
            <RadioGroup
              aria-label={"Recommended NAICS codes"}
              name={"naics-radio-group"}
              value={naicsCode}
              onChange={(event: React.ChangeEvent<{ name?: string; value: string }>): void => {
                if (displayInput) setDisplayInput(false);
                if (isAuthenticated !== IsAuthenticated.TRUE) {
                  setShowNeedsAccountModal(true);
                  return;
                }
                setNaicsCode(event.target.value);
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
                  if (isAuthenticated !== IsAuthenticated.TRUE) {
                    setShowNeedsAccountModal(true);
                    return;
                  }
                  setDisplayInput(true);
                  setNaicsCode("");
                  setIsInvalid(undefined);
                }}
                value=""
                checked={displayInput}
                control={<Radio color="primary" />}
                label={"Search for other NAICS codes"}
              />
            </RadioGroup>
          </FormControl>
        </>
      )}
      {displayInput && (
        <div className="tablet:margin-left-0">
          <Content>{Config.determineNaicsCode.findCodeBodyText}</Content>
          <ul>
            <li>
              <Content>{Config.determineNaicsCode.naicsLink}</Content>
            </li>
          </ul>
          <div>
            <WithErrorBar hasError={!!isInvalid} type={"ALWAYS"}>
              <FieldLabelProfile fieldName={"naicsCode"} isAltDescriptionDisplayed ignoreContextualInfo />
              <GenericTextField
                inputWidth="reduced"
                fieldName="naicsCode"
                numericProps={{ maxLength: REQUIRED_LENGTH }}
                value={naicsCode}
                ariaLabel="Save NAICS Code"
                fieldOptions={{
                  inputProps: { style: { backgroundColor: "white" } },
                }}
                error={isInvalid !== undefined}
                handleChange={handleTextInputChange}
                validationText={errorMessages[isInvalid ?? "length"]}
              />
            </WithErrorBar>
          </div>
        </div>
      )}
      {(displayInput || naicsCode !== "") && (
        <>
          <hr className="margin-y-2" />
          <div className="flex flex-row margin-left-auto">
            <SecondaryButton isColor="primary" onClick={saveNaicsCode} isLoading={isLoading}>
              {saveButtonText}
            </SecondaryButton>
          </div>
        </>
      )}
    </>
  );
};
