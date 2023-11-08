import { Content } from "@/components/Content";
import { FileInput } from "@/components/njwds-extended/FileInput";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl } from "@mui/material";
import { ReactElement, useContext } from "react";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";
import {useMountEffect} from "@/lib/utils/helpers";
import {InputFile} from "@businessnjgovnavigator/shared/formationData";

export const ForeignCertificate = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setForeignGoodStandingFile } = useContext(BusinessFormationContext);
  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers("foreignGoodStandingFile", FormationFormContext);

  const isValid = (file: InputFile | undefined): boolean => {
    return file !== undefined
  };

  RegisterForOnSubmit(() => isValid(state.foreignGoodStandingFile));
  const runValidation = (file: InputFile | undefined): void => setIsValid(isValid(file));

  useMountEffect(() => {
    runValidation(state.foreignGoodStandingFile)
  })

  return (
    <>
      <FormControl variant="outlined" fullWidth className="padding-bottom-1">
        <h3 data-testid="foreign-certificate-of-good-standing-header" className="margin-0-override">
          <Content className="h3-styling margin-0-override">
            {Config.formation.fields.foreignGoodStandingFile.contextualLabel}
          </Content>
        </h3>
        <FileInput
          acceptedFileTypes={{
            errorMessage: Config.formation.fields.foreignGoodStandingFile.errorMessageFileType,
            fileTypes: ["PNG", "PDF"],
          }}
          onChange={setForeignGoodStandingFile}
          hasError={isFormFieldInvalid}
          helperText={Config.formation.fields.foreignGoodStandingFile.helperText}
          errorMessageRequired={Config.formation.fields.foreignGoodStandingFile.errorMessageRequired}
          maxFileSize={{
            errorMessage: Config.formation.fields.foreignGoodStandingFile.errorMessageFileSize,
            maxSizeInMegabytes: 3,
          }}
          value={state.foreignGoodStandingFile}
        />
      </FormControl>
    </>
  );
};
