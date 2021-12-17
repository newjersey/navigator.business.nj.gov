import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { TextField } from "@mui/material";
import React, { ChangeEvent, FocusEvent, ReactElement, useContext, useState } from "react";

export const Signatures = (): ReactElement => {
  const { state, setFormationData } = useContext(FormationContext);
  const [error, setError] = useState(false);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setError(true);
    } else if (event.target.value.trim()) {
      setError(false);
    }
  };

  const addAdditionalSignerField = () => {
    setFormationData({
      ...state.formationData,
      additionalSigners: [...state.formationData.additionalSigners, ""],
    });
  };

  const removeAdditionalSigner = (index: number) => {
    const newAdditionalSigners = [...state.formationData.additionalSigners];
    newAdditionalSigners.splice(index, 1);
    setFormationData({
      ...state.formationData,
      additionalSigners: newAdditionalSigners,
    });
  };

  const handleAdditionalSignerChange = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const newAdditionalSigners = [...state.formationData.additionalSigners];
    newAdditionalSigners[index] = event.target.value;
    setFormationData({
      ...state.formationData,
      additionalSigners: newAdditionalSigners,
    });
  };

  return (
    <>
      <div className="form-input margin-bottom-2">
        <BusinessFormationTextField
          fieldName="signer"
          error={error}
          onValidation={onValidation}
          validationText={BusinessFormationDefaults.signerErrorText}
        />
        {state.formationData.additionalSigners.map((it, index) => {
          return (
            <div className="margin-bottom-1" key={index}>
              <Content>{state.displayContent.additionalSigners.contentMd}</Content>
              <div className="fdr">
                <TextField
                  value={it}
                  id={`additional-signer-${index}`}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleAdditionalSignerChange(event, index)
                  }
                  variant="outlined"
                  fullWidth
                  placeholder={state.displayContent.additionalSigners.placeholder ?? ""}
                  inputProps={{
                    "aria-label": `Additional signer ${index}`,
                  }}
                />
                <Button style="tertiary" onClick={() => removeAdditionalSigner(index)}>
                  <div className="border-base-light border-1px margin-x-1 radius-md">
                    <Icon className="padding-05 font-body-xl" label="delete additional signer">
                      delete
                    </Icon>
                  </div>
                </Button>
              </div>
            </div>
          );
        })}
        {state.formationData.additionalSigners.length < 9 && (
          <Button style="tertiary" onClick={addAdditionalSignerField}>
            <Icon>add</Icon> {BusinessFormationDefaults.addNewSignerButtonText}
          </Button>
        )}
      </div>
    </>
  );
};
