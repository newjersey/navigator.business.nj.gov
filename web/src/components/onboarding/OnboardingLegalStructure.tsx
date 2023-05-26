import { Content } from "@/components/Content";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { LegalStructure, LegalStructures, LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { orderBy } from "lodash";
import React, { ReactElement, useContext } from "react";

export const OnboardingLegalStructure = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["legalStructureId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "legalStructureId",
    });

  const { RegisterForOnSubmit, Validate } = useFormContextFieldHelpers(
    "legalStructureId",
    profileFormContext,
    props.errorTypes
  );

  RegisterForOnSubmit(() => state.profileData.legalStructureId !== undefined);

  const LegalStructuresOrdered: LegalStructure[] = orderBy(
    LegalStructures,
    (legalStructure: LegalStructure) => {
      return legalStructure.onboardingOrder;
    }
  );

  const handleLegalStructure = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    Validate(false);
    setProfileData({
      ...state.profileData,
      legalStructureId: (event.target.value as string) || undefined,
      operatingPhase:
        state.profileData.operatingPhase === "GUEST_MODE"
          ? "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
          : state.profileData.operatingPhase,
    });
  };

  const makeLabel = (legalStructureId: string): ReactElement => {
    const supportingText =
      (contentFromConfig.optionContent as Record<string, string>)[legalStructureId] ?? "";
    return (
      <div data-value={legalStructureId}>
        <div className={supportingText === "" ? "" : "text-bold"}>
          {LookupLegalStructureById(legalStructureId).name}
        </div>
        <Content>{supportingText}</Content>
      </div>
    );
  };

  return (
    <>
      <div className="form-input-wide margin-top-3">
        <FormControl variant="outlined" fullWidth>
          <RadioGroup
            aria-label="Business structure"
            name="legal-structure"
            value={state.profileData.legalStructureId || ""}
            onChange={handleLegalStructure}
          >
            {LegalStructuresOrdered.map((legalStructure) => {
              return (
                <FormControlLabel
                  aria-label={legalStructure.id}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  key={legalStructure.id}
                  data-testid={legalStructure.id}
                  value={legalStructure.id}
                  control={<Radio color="primary" />}
                  label={makeLabel(legalStructure.id)}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </div>
    </>
  );
};
