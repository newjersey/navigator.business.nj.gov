/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Content } from "@/components/Content";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { GenericTextField } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import {
  createSignedEmptyFormationObject,
  needsSignerTypeFunc,
} from "@/components/tasks/business-formation/contacts/helpers";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { MediaQueries } from "@/lib/PageSizes";
import { templateEval, useMountEffect } from "@/lib/utils/helpers";
import {
  BusinessSignerTypeMap,
  createEmptyFormationSigner,
  FormationSigner,
  SignerTitle,
} from "@businessnjgovnavigator/shared";
import { Checkbox, FormHelperText, MenuItem, Select, useMediaQuery } from "@mui/material";
import { ChangeEvent, ReactElement, ReactNode, useContext, useMemo } from "react";

export const Signatures = (): ReactElement => {
  const FIELD_NAME = "signers";
  const SIGNER_NAME_MAX_LEN = 50;
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { doesFieldHaveError } = useFormationErrors();

  // const needsSignerType = true;
  const needsSignerType = useMemo(
    () => needsSignerTypeFunc(state.formationFormData.legalType),
    [state.formationFormData.legalType],
  );

  const getDescription = (): string => {
    const legalType = state.formationFormData.legalType;
    const overriddenLegalTypes = Object.keys(Config.formation.fields.signers.overrides ?? {});
    if (overriddenLegalTypes.includes(legalType)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (Config.formation.fields.signers.overrides as any)[legalType].description;
    }
    return Config.formation.fields.signers.description;
  };

  useMountEffect(() => {
    state.formationFormData.signers && state.formationFormData.signers.length > 0
      ? null
      : setFormationFormData((previousFormationData) => {
          return {
            ...previousFormationData,
            signers: [
              createSignedEmptyFormationObject(
                previousFormationData.legalType,
                createEmptyFormationSigner,
              ),
            ],
          };
        });
  });

  const addSignerField = (): void => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        signers: [
          ...(state.formationFormData.signers ?? []),
          createSignedEmptyFormationObject(
            previousFormationData.legalType,
            createEmptyFormationSigner,
          ),
        ],
      };
    });
  };

  const removeSigner = (index: number): void => {
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

  const renderSignatureColumn = ({ index }: { index: number }): ReactNode => {
    if (!state.formationFormData.signers) {
      return;
    }
    const checked = state.formationFormData.signers[index].signature;
    return (
      <div
        className={`mobile-sign-wrapper grid-col-auto width-6 display-flex flex-column flex-align-center flex-justify-center }`}
      >
        <label
          htmlFor={index ? `signature-checkbox-signers-${index}` : `signature-checkbox-signers`}
          className="text-bold"
          style={{ display: "none" }}
        >
          {Config.formation.fields.signers.columnLabel}
        </label>
        <div style={{ height: "44px" }} className="display-flex flex-column flex-justify-center">
          <Checkbox
            id={index ? `signature-checkbox-signers-${index}` : `signature-checkbox-signers`}
            onChange={(event): void => {
              handleSignerCheckbox(event, index);
            }}
            checked={checked}
            {...(doesFieldHaveError(FIELD_NAME) && !checked ? { color: "error" } : {})}
          />
        </div>
      </div>
    );
  };

  const renderDeleteColumn = ({ onClick }: { onClick?: () => void }): ReactNode => {
    return (
      <UnStyledButton
        onClick={onClick}
        isUnderline
        className={`${isTabletAndUp ? "margin-top-2" : "margin-y-1"}`}
      >
        {Config.formation.general.removeSectionText}
      </UnStyledButton>
    );
  };

  const hasError = doesFieldHaveError(FIELD_NAME);

  const getTypeField = (index: number): ReactNode => {
    if (!state.formationFormData.signers) return;
    return (
      <>
        <Select
          fullWidth
          error={hasError && !state.formationFormData.signers[index]?.title}
          displayEmpty
          value={state.formationFormData.signers[index]?.title ?? ""}
          onChange={(event): void => {
            handleTypeChange(event.target.value as SignerTitle, index);
          }}
          inputProps={{
            "aria-label": `Signer title ${index}`,
            "data-testid": `signer-title-${index}`,
          }}
          SelectDisplayProps={{ "aria-required": "true" }}
          required
          renderValue={(selected): ReactNode => {
            if (!selected) {
              return <></>;
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
        {hasError && state.formationFormData!.signers[index].title === undefined && (
          <FormHelperText className={"text-error-dark"}>
            {Config.formation.fields.signers.errorInlineSignerTitle}
          </FormHelperText>
        )}
      </>
    );
  };

  const getSignatureField = (index: number): ReactNode => {
    if (!state.formationFormData.signers) {
      return;
    }

    const isMissingNameAndSignature = (): boolean =>
      (hasError &&
        state.formationFormData.signers &&
        state.formationFormData.signers[index].name.length === 0 &&
        !state.formationFormData.signers[index].signature) ??
      false;

    const isMissingName = (): boolean =>
      (state.formationFormData.signers &&
        state.formationFormData.signers[index].name.length === 0) ??
      false;

    const isMissingSignature = (): boolean =>
      (state.formationFormData.signers && !state.formationFormData.signers[index].signature) ??
      false;

    const SIGNER_NAME_MAX_LEN = 50;
    const isTooLong = (): boolean =>
      (state.formationFormData.signers &&
        state.formationFormData.signers[index].name.length > SIGNER_NAME_MAX_LEN) ??
      false;

    const signerNameIsTooLongLabel: string = templateEval(
      Config.formation.general.maximumLengthErrorText,
      {
        field: Config.formation.fields.signers.label,
        maxLen: SIGNER_NAME_MAX_LEN.toString(),
      },
    );

    const getInlineValidationText = (needsSignerType: boolean): string => {
      if (isTooLong()) {
        return signerNameIsTooLongLabel;
      } else if (isMissingNameAndSignature()) {
        return Config.formation.fields.signers.errorInlineNameAndSignature;
      } else if (isMissingName() && needsSignerType) {
        return index > 0
          ? Config.formation.fields.signers.errorInlineAdditionalSignerName
          : Config.formation.fields.signers.errorInlineSignerName;
      } else if (isMissingName()) {
        return Config.formation.fields.signers.errorInlineSignerName;
      } else if (isMissingSignature()) {
        return Config.formation.fields.signers.errorInlineSignature;
      } else {
        return "";
      }
    };

    return (
      <>
        <ScrollableFormFieldWrapper fieldName="signers">
          <GenericTextField
            inputWidth="full"
            value={state.formationFormData.signers[index].name}
            handleChange={(value: string): void => handleSignerChange(value, index)}
            error={hasError && doesRowHaveError(index)}
            onValidation={(): void => {
              setFieldsInteracted([FIELD_NAME]);
            }}
            validationText={getInlineValidationText(needsSignerType)}
            fieldName="signer"
            className={`margin-top-0`}
            ariaLabel={`Signer ${index}`}
            required
          />
        </ScrollableFormFieldWrapper>
      </>
    );
  };

  const doesRowHaveError = (index: number): boolean => {
    if (!state.formationFormData.signers || state.formationFormData.signers.length === 0) {
      return false;
    }

    const signer = state.formationFormData.signers[index];
    const needsTypeField = BusinessSignerTypeMap[state.formationFormData.legalType].length > 1;
    const error =
      signer.name.length === 0 || !signer.signature || signer.name.length > SIGNER_NAME_MAX_LEN;
    if (needsTypeField) {
      return (error || !signer.title) && hasError;
    } else {
      return error && hasError;
    }
  };

  const atLeastOneSignerExists =
    state.formationFormData.signers && state.formationFormData.signers?.length > 0;

  return (
    <>
      <div className="grid-col" data-testid="signers-section">
        <Heading level={2}>{Config.formation.fields.signers.label}</Heading>
        <Content>{getDescription()}</Content>
        <LargeCallout calloutType="informational">
          <Content>{Config.formation.fields.signers.keepInMindCallout}</Content>
        </LargeCallout>
        <div className={`grid-row margin-y-2 flex-align-start`}>
          <div className={`grid-col`} data-testid="signers-0">
            {atLeastOneSignerExists && (
              <WithErrorBar
                hasError={doesRowHaveError(0)}
                type="ALWAYS"
                className="grid-row flex-align-start"
              >
                <div className="grid-col">
                  <div className="grid-row margin-top-1">
                    <div className={`grid-col-12 ${needsSignerType ? "tablet:grid-col-6" : ""}`}>
                      <strong>
                        <ModifiedContent>
                          {Config.formation.fields.signers.nameLabel}
                        </ModifiedContent>
                      </strong>
                      {getSignatureField(0)}
                    </div>
                    {needsSignerType && (
                      <div
                        className={`${
                          isTabletAndUp ? "grid-col-6 padding-x-2" : "grid-col-12 margin-y-2"
                        }`}
                      >
                        <strong>
                          <Content>{Config.formation.fields.signers.titleLabel}</Content>
                        </strong>
                        {getTypeField(0)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="margin-top-1" style={{ marginBottom: "1em" }}>
                  <strong>
                    <ModifiedContent>{`${Config.formation.fields.signers.columnLabel}`}</ModifiedContent>
                  </strong>
                  {renderSignatureColumn({
                    index: 0,
                  })}
                </div>
              </WithErrorBar>
            )}
          </div>
        </div>

        {(state.formationFormData.signers ?? [])
          .slice(1)
          .map((it: FormationSigner, _index: number) => {
            const index = _index + 1;
            return (
              <div key={`signature-${index}`}>
                {isTabletAndUp ? <></> : <hr className="margin-top-2" />}
                <WithErrorBar
                  hasError={doesRowHaveError(index)}
                  type="ALWAYS"
                  className="grid-row margin-bottom-1"
                >
                  <div className="grid-col">
                    <div className="grid-row flex-align-start" data-testid={`signers-${index}`}>
                      <div className="grid-col">
                        <div className="grid-row margin-top-1">
                          <div
                            className={`grid-col-12 ${needsSignerType ? "tablet:grid-col-6" : ""}`}
                          >
                            <strong>
                              <ModifiedContent>
                                {Config.formation.fields.signers.nameLabel}
                              </ModifiedContent>
                            </strong>
                            {getSignatureField(index)}
                          </div>
                          {needsSignerType && (
                            <div
                              className={`${
                                isTabletAndUp ? "grid-col-6 padding-x-2" : "grid-col-12 margin-y-2"
                              }`}
                            >
                              <strong>
                                <Content>{Config.formation.fields.signers.titleLabel}</Content>
                              </strong>
                              {getTypeField(index)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid-row margin-top-1" style={{ marginBottom: "1em" }}>
                        <div>
                          <strong>
                            <ModifiedContent>{`${Config.formation.fields.signers.columnLabel}`}</ModifiedContent>
                          </strong>
                          {renderSignatureColumn({
                            index: index,
                          })}
                        </div>
                        {isTabletAndUp &&
                          renderDeleteColumn({
                            onClick: (): void => removeSigner(index),
                          })}
                      </div>
                    </div>
                    {!isTabletAndUp &&
                      renderDeleteColumn({
                        onClick: (): void => removeSigner(index),
                      })}
                  </div>
                </WithErrorBar>
              </div>
            );
          })}

        {(state.formationFormData.signers?.length ?? 0) < 10 && (
          <UnStyledButton onClick={addSignerField} dataTestid="add-new-signer">
            <Icon iconName="add" />{" "}
            <span className="text-underline" style={{ textUnderlinePosition: "under" }}>
              {Config.formation.fields.signers.addButtonText}
            </span>
          </UnStyledButton>
        )}
        <p className="margin-bottom-2">
          <em>* {Config.formation.fields.signers.aidText}</em>
        </p>
      </div>
    </>
  );
};
