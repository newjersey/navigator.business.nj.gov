import { FileInput } from "@/components/njwds-extended/FileInput";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormControl } from "@mui/material";
import { ReactElement, useContext } from "react";

interface Props {
  hasError: boolean;
}

export const ForeignCertificate = (props: Props): ReactElement => {
  const { hasError } = props;
  const { Config } = useConfig();
  const { state, setForeignGoodStandingFile } = useContext(BusinessFormationContext);

  return (
    <>
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <FormControl variant="outlined" fullWidth className="padding-bottom-2">
        <h3 className="margin-bottom-2" data-testid="MainBusinesAddressContainer-Header">
          {Config.formation.fields.foreignGoodStandingFile.label}
        </h3>
        <FileInput
          acceptedFileTypes={{
            errorMessage: Config.formation.fields.foreignGoodStandingFile.errorMessageFileType,
            fileTypes: ["PNG", "PDF"],
          }}
          onChange={setForeignGoodStandingFile}
          hasError={hasError}
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
