import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { ValidatedCheckbox } from "@/components/ValidatedCheckbox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MediaQueries } from "@/lib/PageSizes";
import { FormationFields } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import React, { ChangeEvent, ReactElement, useContext } from "react";

export const Signatures = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const addAdditionalSignerField = () => {
    setFormationFormData({
      ...state.formationFormData,
      additionalSigners: [
        ...state.formationFormData.additionalSigners,
        {
          name: "",
          signature: false,
        },
      ],
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

  const handleSignerChange = (value: string): void => {
    setFormationFormData({
      ...state.formationFormData,
      signer: {
        ...state.formationFormData.signer,
        name: value,
      },
    });
  };

  const handleSignerCheckbox = (event: ChangeEvent<HTMLInputElement>): void => {
    const signerWasFilledButCheckboxWasError =
      state.errorMap.signer && state.formationFormData.signer.name.length > 0;

    setFormationFormData({
      ...state.formationFormData,
      signer: {
        ...state.formationFormData.signer,
        signature: event.target.checked,
      },
    });

    if (signerWasFilledButCheckboxWasError && event.target.checked) {
      setErrorMap({ ...state.errorMap, signer: { invalid: false } });
    } else if (!event.target.checked) {
      setErrorMap({ ...state.errorMap, signer: { invalid: true, types: ["signer-checkbox"] } });
    }
  };

  const handleAdditionalSignerChange = (value: string, index: number): void => {
    const newAdditionalSigners = [...state.formationFormData.additionalSigners];
    newAdditionalSigners[index].name = value;
    setFormationFormData({
      ...state.formationFormData,
      additionalSigners: newAdditionalSigners,
    });

    if (value && state.formationFormData.additionalSigners.every((it) => it.signature && it.name)) {
      setErrorMap({ ...state.errorMap, signer: { invalid: false } });
    }
  };

  const handleAdditionalSignerCheckbox = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const newAdditionalSigners = [...state.formationFormData.additionalSigners];
    newAdditionalSigners[index].signature = event.target.checked;
    setFormationFormData({
      ...state.formationFormData,
      additionalSigners: newAdditionalSigners,
    });

    if (
      event.target.checked &&
      state.formationFormData.additionalSigners.every((it) => it.signature && it.name)
    ) {
      setErrorMap({ ...state.errorMap, signer: { invalid: false } });
    }
  };

  const renderSignatureColumn = ({
    onChange,
    checked,
    fieldName,
    index,
  }: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    checked: boolean;
    fieldName: FormationFields;
    index?: number;
  }) => {
    return (
      <div className="grid-col-auto width-6 display-flex flex-column flex-align-center flex-justify-center">
        <label
          htmlFor={index ? `signature-checkbox-${fieldName}-${index}` : `signature-checkbox-${fieldName}`}
          className="text-bold"
          style={{ display: "none" }}
        >
          {Config.businessFormationDefaults.signatureColumnLabel}*
        </label>
        <div style={{ height: "56px" }} className="display-flex flex-column flex-justify-center">
          <ValidatedCheckbox
            id={index ? `signature-checkbox-${fieldName}-${index}` : `signature-checkbox-${fieldName}`}
            onChange={onChange}
            checked={checked}
            error={state.errorMap[fieldName].invalid && !checked}
          />
        </div>
      </div>
    );
  };

  const renderDeleteColumn = ({ visible, onClick }: { visible: boolean; onClick?: () => void }) => {
    return (
      <div className="grid-col-auto padding-left-1 flex-column flex-align-center flex-justify-center">
        <div style={{ height: "56px" }} className="display-flex flex-column flex-justify-center">
          {visible ? (
            <Button
              style="tertiary"
              onClick={onClick}
              className="display-flex flex-column flex-justify-center"
            >
              <Icon className="font-body-lg" label="delete additional signer">
                delete
              </Icon>
            </Button>
          ) : (
            <Icon className="font-body-lg visibility-hidden">delete</Icon>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="margin-bottom-2">
        <Content>{state.displayContent.signatureHeader.contentMd}</Content>
        <br />
        <div className="grid-row flex-align-center">
          <div className="grid-col">
            <div className="fdr space-between">
              <Content>{Config.businessFormationDefaults.signerLabel}</Content>
              <Content>{`${Config.businessFormationDefaults.signatureColumnLabel}*`}</Content>
            </div>
            <div className="grid-row flex-align-center" data-testid={`primary-signer`}>
              <div className="grid-col">
                <GenericTextField
                  value={state.formationFormData.signer.name}
                  placeholder={Config.businessFormationDefaults.signerPlaceholder}
                  handleChange={handleSignerChange}
                  error={state.errorMap["signer"].invalid && !state.formationFormData.signer.name}
                  onValidation={(fieldName: string, invalid: boolean) => {
                    const isSignerInvalid = invalid || !state.formationFormData.signer.signature;
                    setErrorMap({ ...state.errorMap, signer: { invalid: isSignerInvalid } });
                  }}
                  validationText={Config.businessFormationDefaults.signerErrorText}
                  fieldName="signer"
                  required={true}
                  formInputFull
                />
              </div>
              <div style={{ marginBottom: "19px" }}>
                {renderSignatureColumn({
                  onChange: handleSignerCheckbox,
                  checked: state.formationFormData.signer.signature,
                  fieldName: "signer",
                })}
              </div>
            </div>
          </div>
          {isTabletAndUp && renderDeleteColumn({ visible: false })}
        </div>

        {state.formationFormData.additionalSigners.map((it, index) => {
          return (
            <div className="margin-bottom-3" key={index}>
              <div className="grid-row margin-bottom-1 fas" data-testid={`additional-signers-${index}`}>
                <div className="grid-col">
                  <GenericTextField
                    noValidationMargin={true}
                    value={it.name}
                    placeholder={Config.businessFormationDefaults.signerPlaceholder ?? ""}
                    handleChange={(value: string) => handleAdditionalSignerChange(value, index)}
                    error={
                      state.errorMap.additionalSigners.invalid &&
                      !state.formationFormData.additionalSigners[index].name
                    }
                    onValidation={(fieldName: string, invalid: boolean) => {
                      const isAdditionalSignerInvalid =
                        invalid || !state.formationFormData.additionalSigners[index].signature;
                      setErrorMap({
                        ...state.errorMap,
                        additionalSigners: { invalid: isAdditionalSignerInvalid },
                      });
                    }}
                    validationText={Config.businessFormationDefaults.additionalSignatureNameErrorText}
                    fieldName="additionalSigners"
                    ariaLabel={`Additional signers ${index}`}
                    formInputFull
                  />
                </div>
                {renderSignatureColumn({
                  onChange: (event) => handleAdditionalSignerCheckbox(event, index),
                  checked: state.formationFormData.additionalSigners[index].signature,
                  fieldName: "additionalSigners",
                  index: index,
                })}
                {isTabletAndUp &&
                  renderDeleteColumn({ visible: true, onClick: () => removeAdditionalSigner(index) })}
              </div>
              {!isTabletAndUp && (
                <Button style="tertiary" underline onClick={() => removeAdditionalSigner(index)}>
                  {Config.businessFormationDefaults.signatureDeleteMobileText}
                </Button>
              )}
            </div>
          );
        })}

        {state.formationFormData.additionalSigners.length < 9 && (
          <Button style="tertiary" onClick={addAdditionalSignerField}>
            <Icon>add</Icon>{" "}
            <span className="text-underline" style={{ textUnderlinePosition: "under" }}>
              {Config.businessFormationDefaults.addNewSignerButtonText}
            </span>
          </Button>
        )}
        <p className="margin-bottom-2">
          <i>* {Config.businessFormationDefaults.signatureAidText}</i>
        </p>
      </div>
    </>
  );
};
