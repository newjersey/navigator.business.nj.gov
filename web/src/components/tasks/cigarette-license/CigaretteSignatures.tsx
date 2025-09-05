import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Heading } from "@/components/njwds-extended/Heading";
import { WithErrorBar } from "@/components/WithErrorBar";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";

import { Checkbox } from "@mui/material";
import { ChangeEvent, ReactElement, useContext } from "react";

interface Props {
  CMS_ONLY_show_error?: boolean;
}

export const CigaretteSignatures = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setCigaretteLicenseData } = useContext(CigaretteLicenseContext);
  const { setIsValid: setIsSignerNameValid, isFormFieldInvalid: isSignerNameValid } =
    useFormContextFieldHelpers("signerName", DataFormErrorMapContext);
  const {
    setIsValid: setIsSignerRelationshipValid,
    isFormFieldInvalid: isSignerRelationshipValid,
  } = useFormContextFieldHelpers("signerRelationship", DataFormErrorMapContext);

  const { isFormFieldInvalid: isSignatureValid } = useFormContextFieldHelpers(
    "signature",
    DataFormErrorMapContext,
  );

  const handleChange = (
    val: string | ChangeEvent<HTMLInputElement> | boolean,
    fieldName: "signerName" | "signerRelationship" | "signature",
  ): void => {
    if (val !== undefined) {
      setCigaretteLicenseData({
        ...state,
        [fieldName]: val,
      });
    }
  };

  return (
    <div className="grid-col" data-testid="signers-section">
      <Heading level={2}>{Config.cigaretteLicenseStep4.signersHeader}</Heading>

      <Content>{Config.cigaretteLicenseStep4.signersDescription}</Content>

      <div className="grid-row grid-gap-2 margin-y-2">
        <div className="grid-col-5 margin-right-2" id="question-signerName">
          <WithErrorBar hasError={props.CMS_ONLY_show_error || isSignerNameValid} type="ALWAYS">
            <strong>
              <Content>{Config.cigaretteLicenseStep4.signerNameLabel}</Content>
            </strong>
            <GenericTextField
              inputWidth="full"
              value={state.signerName || ""}
              onValidation={(fieldName, invalid) => setIsSignerNameValid(!invalid)}
              error={props.CMS_ONLY_show_error || isSignerNameValid}
              validationText={Config.cigaretteLicenseStep4.signerNameErrorText}
              handleChange={(val) => handleChange(val, "signerName")}
              fieldName="signerName"
              required={true}
            />
          </WithErrorBar>
        </div>

        <div className="grid-col-5 margin-right-2" id="question-signerRelationship">
          <WithErrorBar
            hasError={props.CMS_ONLY_show_error || isSignerRelationshipValid}
            type="ALWAYS"
          >
            <strong>
              <Content>{Config.cigaretteLicenseStep4.signerRelationshipLabel}</Content>
            </strong>
            <GenericTextField
              inputWidth="full"
              value={state.signerRelationship || ""}
              onValidation={(fieldName, invalid) => setIsSignerRelationshipValid(!invalid)}
              error={props.CMS_ONLY_show_error || isSignerRelationshipValid}
              validationText={Config.cigaretteLicenseStep4.signerRelationshipErrorText}
              handleChange={(val) => handleChange(val, "signerRelationship")}
              fieldName="signerRelationship"
              required={true}
            />
          </WithErrorBar>
        </div>

        <div className="grid-col-1">
          <div className="display-flex flex-column flex-align-center" id="question-signature">
            <strong>
              <Content>{Config.cigaretteLicenseStep4.signLabel}</Content>
            </strong>
            <Checkbox
              checked={state.signature || false}
              onChange={(event) => handleChange(event.target.checked, "signature")}
              inputProps={{
                "aria-label": Config.cigaretteLicenseStep4.signLabel,
              }}
              {...(isSignatureValid && { color: "error" })}
            />
          </div>
        </div>
      </div>

      <div className="margin-bottom-2">
        <Content>{Config.cigaretteLicenseStep4.signersConfirmationText}</Content>
      </div>
    </div>
  );
};
