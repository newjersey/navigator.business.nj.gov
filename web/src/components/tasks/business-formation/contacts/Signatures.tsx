/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import {
  createSignedEmptyFormationObject,
  needsSignerTypeFunc,
} from "@/components/tasks/business-formation/contacts/helpers";
import { ValidatedCheckbox } from "@/components/ValidatedCheckbox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import { useMountEffect } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessSignerTypeMap,
  createEmptyFormationSigner,
  FormationSigner,
  SignerTitle,
} from "@businessnjgovnavigator/shared";
import { FormHelperText, MenuItem, Select, useMediaQuery } from "@mui/material";
import { ChangeEvent, ReactElement, useContext, useMemo } from "react";

export const Signatures = (): ReactElement => {
  const FIELD_NAME = "signers";
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doesFieldHaveError } = useFormationErrors();

  const needsSignerType = useMemo(
    () => needsSignerTypeFunc(state.formationFormData.legalType),
    [state.formationFormData.legalType]
  );

  useMountEffect(() => {
    state.formationFormData.signers && state.formationFormData.signers.length > 0
      ? null
      : setFormationFormData((previousFormationData) => {
          return {
            ...previousFormationData,
            signers: [
              createSignedEmptyFormationObject(previousFormationData.legalType, createEmptyFormationSigner),
            ],
          };
        });
  });

  const addSignerField = () => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        signers: [
          ...(state.formationFormData.signers ?? []),
          createSignedEmptyFormationObject(previousFormationData.legalType, createEmptyFormationSigner),
        ],
      };
    });
  };

  const removeSigner = (index: number) => {
    const signers = [...(state.formationFormData.signers ?? [])];
    signers.splice(index, 1);

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        signers,
      };
    });
  };

  const handleTypeChange = (value: SignerTitle, index: number): void => {
    const signers = [...(state.formationFormData.signers ?? [])];
    signers[index] = {
      ...signers[index],
      title: value,
    };
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        signers,
      };
    });
  };

  const handleSignerChange = (value: string, index: number): void => {
    const signers = [...(state.formationFormData.signers ?? [])];
    signers[index] = {
      ...signers[index],
      name: value,
    };
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        signers,
      };
    });
  };

  const handleSignerCheckbox = (event: ChangeEvent<HTMLInputElement>, index: number): void => {
    const signers = [...(state.formationFormData.signers ?? [])];
    signers[index] = {
      ...signers[index],
      signature: event.target.checked,
    };
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        signers,
      };
    });
  };

  const renderSignatureColumn = ({ index }: { index: number }) => {
    if (!state.formationFormData.signers) {
      return;
    }
    const checked = state.formationFormData.signers[index].signature;
    return (
      <div
        className={`grid-col-auto width-6 display-flex flex-column flex-align-center ${
          index == 0 ? "flex-justify-center" : "tablet:flex-justify-start margin-top-4 tablet:margin-top-0"
        }`}
      >
        <label
          htmlFor={index ? `signature-checkbox-signers-${index}` : `signature-checkbox-signers`}
          className="text-bold"
          style={{ display: "none" }}
        >
          {Config.businessFormationDefaults.signatureColumnLabel}*
        </label>
        <div
          style={{ height: `${index == 0 ? "44px" : "60px"}` }}
          className="display-flex flex-column flex-justify-center"
        >
          <ValidatedCheckbox
            id={index ? `signature-checkbox-signers-${index}` : `signature-checkbox-signers`}
            onChange={(event) => {
              return handleSignerCheckbox(event, index);
            }}
            checked={checked}
            error={doesFieldHaveError(FIELD_NAME) && !checked}
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

  const getTypeField = (index: number) => {
    if (!state.formationFormData.signers) return;
    return (
      <>
        {!isTabletAndUp && (
          <Content className={"margin-bottom-1"}>{Config.businessFormationDefaults.signerTypeLabel}</Content>
        )}

        <Select
          fullWidth
          error={hasError && !state.formationFormData.signers[index]?.title}
          displayEmpty
          value={state.formationFormData.signers[index]?.title ?? ""}
          onChange={(event) => {
            handleTypeChange(event.target.value as SignerTitle, index);
          }}
          inputProps={{
            "aria-label": `Signer title ${index}`,
            "data-testid": `signer-title-${index}`,
          }}
          renderValue={(selected) => {
            if (!selected) {
              return (
                <span className="text-base">{Config.businessFormationDefaults.signerTitlePlaceholder}</span>
              );
            }

            return selected;
          }}
        >
          {BusinessSignerTypeMap[state.formationFormData.legalType].map((title) => {
            return (
              <MenuItem key={title} value={title} data-testid={title}>
                {title}
              </MenuItem>
            );
          })}
        </Select>
        {hasError && state.formationFormData!.signers[index].title == undefined && (
          <FormHelperText className={"text-error-dark"}>
            {Config.businessFormationDefaults.signerTypeError}
          </FormHelperText>
        )}
      </>
    );
  };

  const getSignatureField = (index: number) => {
    if (!state.formationFormData.signers) {
      return;
    }
    return (
      <>
        {isTabletAndUp || index == 0 ? (
          <></>
        ) : (
          <Content className="margin-bottom-1">{Config.businessFormationDefaults.signerLabel}</Content>
        )}
        <GenericTextField
          noValidationMargin
          value={state.formationFormData.signers[index].name}
          placeholder={Config.businessFormationDefaults.signerPlaceholder}
          handleChange={(value: string) => {
            return handleSignerChange(value, index);
          }}
          error={hasError && state.formationFormData.signers[index].name.length === 0}
          onValidation={() => {
            setFieldsInteracted([FIELD_NAME]);
          }}
          validationText={
            index > 0
              ? Config.businessFormationDefaults.additionalSignatureNameErrorText
              : Config.businessFormationDefaults.signerErrorText
          }
          fieldName="signer"
          className={`margin-top-0`}
          ariaLabel={`Signer ${index}`}
          required={true}
          formInputFull
        />
      </>
    );
  };

  const getRowErrors = (it: FormationSigner) => {
    const needsTypeField = BusinessSignerTypeMap[state.formationFormData.legalType].length > 1;
    const error = it.name.length === 0 || !it.signature;
    if (needsTypeField) {
      return (error || !it.title) && hasError;
    } else {
      return error && hasError;
    }
  };

  return (
    <>
      <div className="grid-col">
        <Content>{state.displayContent.signatureHeader.contentMd}</Content>
        <div className={`grid-row margin-y-2 flex-align-start`}>
          <div className={`grid-col`}>
            {!state.formationFormData.signers || state.formationFormData.signers?.length === 0 ? (
              <></>
            ) : (
              <div
                className={`grid-row flex-align-start  input-error-bar ${
                  (
                    state.formationFormData.signers && state.formationFormData.signers.length > 0
                      ? getRowErrors(state.formationFormData.signers[0])
                      : false
                  )
                    ? "error"
                    : ""
                }`}
                data-testid={`signers-0`}
              >
                <div className="grid-col">
                  <div className="grid-row margin-top-1">
                    <div className={`grid-col-12 ${needsSignerType ? "tablet:grid-col-6" : ""}`}>
                      <Content>{Config.businessFormationDefaults.signerLabel}</Content>
                      {getSignatureField(0)}
                    </div>
                    {needsSignerType && (
                      <div className="grid-col-12 tablet:grid-col-5 tablet:margin-left-1 margin-top-1 tablet:margin-top-0">
                        {isTabletAndUp && (
                          <Content>{Config.businessFormationDefaults.signerTypeLabel}</Content>
                        )}
                        {getTypeField(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="margin-top-1" style={{ marginBottom: "1em" }}>
                  <Content>{`${Config.businessFormationDefaults.signatureColumnLabel}*`}</Content>
                  {renderSignatureColumn({
                    index: 0,
                  })}
                </div>
              </div>
            )}
          </div>
          {isTabletAndUp && renderDeleteColumn({ visible: false })}
        </div>

        {(state.formationFormData.signers ?? []).slice(1).map((it: FormationSigner, _index: number) => {
          const index = _index + 1;
          return (
            <div key={`signature-${index}`}>
              {isTabletAndUp ? <></> : <hr className="margin-top-2" />}
              <div className={`grid-row margin-bottom-2 input-error-bar ${getRowErrors(it) ? "error" : ""}`}>
                <div className="grid-col">
                  <div className="grid-row margin-bottom-1" data-testid={`signers-${index}`}>
                    <div className="grid-col flex-align-self-center margin-top-1">
                      <div className="grid-row">
                        <div
                          className={`grid-col-12 ${
                            needsSignerType ? "tablet:grid-col-6" : ""
                          } margin-bottom-1 tablet:margin-bottom-0`}
                        >
                          {getSignatureField(index)}
                        </div>
                        {needsSignerType && (
                          <div className="grid-col-12 tablet:grid-col-5 tablet:margin-left-1">
                            {getTypeField(index)}
                          </div>
                        )}
                      </div>
                    </div>

                    {renderSignatureColumn({
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
                      className="margin-y-1"
                      underline
                      onClick={() => {
                        return removeSigner(index);
                      }}
                    >
                      {Config.businessFormationDefaults.signatureDeleteMobileText}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(state.formationFormData.signers?.length ?? 0) < 10 && (
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
