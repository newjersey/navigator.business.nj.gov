import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { ValidatedCheckbox } from "@/components/ValidatedCheckbox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  createEmptyFormationAddress,
  FormationAddress,
  FormationFields,
} from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import React, { ChangeEvent, ReactElement, useContext } from "react";

export const Signatures = (): ReactElement => {
  const FIELD_NAME = "signers";
  const { state, setFormationFormData, setFieldInteracted } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doesFieldHaveError } = useFormationErrors();

  const addSignerField = () => {
    setFormationFormData({
      ...state.formationFormData,
      signers: [...state.formationFormData.signers, createEmptyFormationAddress()],
    });
  };

  const removeSigner = (index: number) => {
    const signers = [...state.formationFormData.signers];
    signers.splice(index, 1);

    setFormationFormData({
      ...state.formationFormData,
      signers,
    });
  };

  const handleSignerChange = (value: string, index: number): void => {
    const signers = [...state.formationFormData.signers];
    signers[index] = {
      ...signers[index],
      name: value,
    };
    setFormationFormData({
      ...state.formationFormData,
      signers,
    });
  };

  const handleSignerCheckbox = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const signers = [...state.formationFormData.signers];
    signers[index] = {
      ...signers[index],
      signature: event.target.checked,
    };
    setFormationFormData({
      ...state.formationFormData,
      signers,
    });
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
            error={doesFieldHaveError(fieldName) && !checked}
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

  const hasError = doesFieldHaveError(FIELD_NAME);

  return (
    <>
      <div className="margin-bottom-2">
        <Content>{state.displayContent.signatureHeader.contentMd}</Content>
        {hasError ? <></> : <br />}
        <div className="grid-row flex-align-center">
          <div className={`grid-col input-error-bar ${hasError ? "error" : ""}`}>
            <div className="fdr space-between">
              <Content>{Config.businessFormationDefaults.signerLabel}</Content>
              <Content>{`${Config.businessFormationDefaults.signatureColumnLabel}*`}</Content>
            </div>
            {state.formationFormData.signers.length === 0 ? (
              <div className="padding-2">
                <hr />
                <Content>{state.displayContent.signatureHeader.placeholder ?? ""}</Content>
                <hr />
              </div>
            ) : (
              <div className="grid-row flex-align-center" data-testid={`signers-0`}>
                <div className="grid-col">
                  <GenericTextField
                    value={state.formationFormData.signers[0]?.name}
                    placeholder={Config.businessFormationDefaults.signerPlaceholder}
                    handleChange={(value: string) => {
                      return handleSignerChange(value, 0);
                    }}
                    error={hasError && !state.formationFormData.signers[0]?.name}
                    onValidation={() => {
                      setFieldInteracted(FIELD_NAME);
                    }}
                    validationText={Config.businessFormationDefaults.signerErrorText}
                    fieldName="signer"
                    ariaLabel={`Signer 0`}
                    required={true}
                    formInputFull
                  />
                </div>
                <div style={{ marginBottom: "19px" }}>
                  {renderSignatureColumn({
                    onChange: (event) => {
                      return handleSignerCheckbox(event, 0);
                    },
                    checked: state.formationFormData.signers[0]?.signature,
                    fieldName: "signers",
                  })}
                </div>
              </div>
            )}
          </div>
          {isTabletAndUp && renderDeleteColumn({ visible: false })}
        </div>

        {state.formationFormData.signers.slice(1).map((it: FormationAddress, _index: number) => {
          const index = _index + 1;
          return (
            <div className="margin-bottom-3" key={index}>
              <div className="grid-row margin-bottom-1 fas" data-testid={`signers-${index}`}>
                <div className="grid-col">
                  <GenericTextField
                    noValidationMargin={true}
                    value={it.name}
                    placeholder={Config.businessFormationDefaults.signerPlaceholder ?? ""}
                    handleChange={(value: string) => {
                      return handleSignerChange(value, index);
                    }}
                    error={hasError && !state.formationFormData.signers[index].name}
                    validationText={Config.businessFormationDefaults.additionalSignatureNameErrorText}
                    fieldName="signers"
                    ariaLabel={`Signer ${index}`}
                    formInputFull
                  />
                </div>
                {renderSignatureColumn({
                  onChange: (event) => {
                    return handleSignerCheckbox(event, index);
                  },
                  checked: state.formationFormData.signers[index].signature,
                  fieldName: "signers",
                  index: index,
                })}
                {isTabletAndUp &&
                  renderDeleteColumn({
                    visible: true,
                    onClick: () => {
                      return removeSigner(index);
                    },
                  })}
              </div>
              {!isTabletAndUp && (
                <Button
                  style="tertiary"
                  underline
                  onClick={() => {
                    return removeSigner(index);
                  }}
                >
                  {Config.businessFormationDefaults.signatureDeleteMobileText}
                </Button>
              )}
            </div>
          );
        })}

        {state.formationFormData.signers.length < 10 && (
          <Button style="tertiary" onClick={addSignerField} dataTestid="add-new-signer">
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
