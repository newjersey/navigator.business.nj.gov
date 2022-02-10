import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { TextField } from "@mui/material";
import React, { ChangeEvent, ReactElement, useContext } from "react";

export const Signatures = (): ReactElement => {
  const { state, setFormationFormData } = useContext(FormationContext);

  const addAdditionalSignerField = () => {
    setFormationFormData({
      ...state.formationFormData,
      additionalSigners: [...state.formationFormData.additionalSigners, ""],
    });
  };

  const removeAdditionalSigner = (index: number) => {
    const newAdditionalSigners = [...state.formationFormData.additionalSigners];
    newAdditionalSigners.splice(index, 1);
    setFormationFormData({
      ...state.formationFormData,
      additionalSigners: newAdditionalSigners,
    });
  };

  const handleAdditionalSignerChange = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const newAdditionalSigners = [...state.formationFormData.additionalSigners];
    newAdditionalSigners[index] = event.target.value;
    setFormationFormData({
      ...state.formationFormData,
      additionalSigners: newAdditionalSigners,
    });
  };

  return (
    <>
      <div className="form-input margin-bottom-2">
        <BusinessFormationTextField
          fieldName="signer"
          required={true}
          validationText={BusinessFormationDefaults.signerErrorText}
        />
        {state.formationFormData.additionalSigners.map((it, index) => {
          return (
            <div className="margin-bottom-1" key={index}>
              <Content>{state.displayContent.additionalSigners.contentMd}</Content>
              <div className="grid-row flex-align-center">
                <div className="grid-col">
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
                </div>
                <div className="grid-col-auto padding-left-1">
                  <Button style="tertiary" onClick={() => removeAdditionalSigner(index)}>
                    <Icon className="font-body-xl" label="delete additional signer">
                      delete
                    </Icon>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {state.formationFormData.additionalSigners.length < 9 && (
          <Button style="tertiary" onClick={addAdditionalSignerField}>
            <Icon>add</Icon>{" "}
            <span className="text-underline" style={{ textUnderlinePosition: "under" }}>
              {BusinessFormationDefaults.addNewSignerButtonText}
            </span>
          </Button>
        )}
      </div>
    </>
  );
};
