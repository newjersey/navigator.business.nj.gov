import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import {
  LegalStructure,
  LegalStructures,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared/index";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { orderBy } from "lodash";
import React, { ReactElement, useContext } from "react";

interface Props {
  taskId: string;
}

export const LegalStructureRadio = (props: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["legalStructureId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "legalStructureId",
    });

  const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
    "legalStructureId",
    profileFormContext,
    undefined,
  );

  RegisterForOnSubmit(() => state.profileData.legalStructureId !== undefined);

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.onboardingOrder;
    },
  );

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    Validate(false);
    queueUpdateTaskProgress(props.taskId, "IN_PROGRESS");
    setProfileData({
      ...state.profileData,
      legalStructureId: event.target.value as string,
      operatingPhase:
        state.profileData.operatingPhase === "GUEST_MODE"
          ? "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
          : state.profileData.operatingPhase,
    });
  };

  const makeLabel = (legalStructureId: string): ReactElement => {
    return (
      <div data-value={legalStructureId} className={"text-bold"}>
        {LookupLegalStructureById(legalStructureId).name}
      </div>
    );
  };

  return (
    <>
      {isFormFieldInValid && (
        <div className={"padding-bottom-1"}>
          <Alert variant="error" dataTestid="business-structure-alert">
            {Config.businessStructurePrompt.businessStructureNotSelectedAlertText}
          </Alert>
        </div>
      )}
      <h3>{Config.businessStructureTask.radioQuestionHeader}</h3>
      <WithErrorBar hasError={isFormFieldInValid} type="ALWAYS">
        <div className="margin-top-3">
          <FormControl variant="outlined" fullWidth>
            <RadioGroup
              aria-label="Business structure"
              name="legal-structure"
              value={state.profileData.legalStructureId || ""}
              onChange={handleLegalStructure}
            >
              {LegalStructuresOrdered.map((legalStructure) => {
                return (
                  <div key={legalStructure.id}>
                    <FormControlLabel
                      aria-label={legalStructure.id}
                      style={{ alignItems: "center" }}
                      labelPlacement="end"
                      key={legalStructure.id}
                      data-testid={legalStructure.id}
                      value={legalStructure.id}
                      control={<Radio color={isFormFieldInValid ? "error" : "primary"} />}
                      label={makeLabel(legalStructure.id)}
                    />

                    {(contentFromConfig.optionContent as Record<string, string>)[legalStructure.id] && (
                      <div className="margin-left-4 padding-left-05">
                        <Content>
                          {(contentFromConfig.optionContent as Record<string, string>)[legalStructure.id]}
                        </Content>
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </FormControl>
          {isFormFieldInValid && (
            <div className="text-error-dark text-bold" data-testid="business-structure-error">
              {contentFromConfig.errorTextRequired}
            </div>
          )}
        </div>
      </WithErrorBar>
    </>
  );
};
