import { Content } from "@/components/Content";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { GenericTextField } from "@/components/GenericTextField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement } from "react";

interface Props {
  disabled?: boolean;
  onValidation?: (fieldName: string, invalid: boolean) => void;
  handleChange?: (value: string) => void;
  value: string | undefined;
  error?: boolean;
  validationText?: string;
}

export const DOL_EIN_CHARACTERS = 15;

export const DolEin = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  return (
    <>
      <strong>
        <Content>{Config.employerRates.dolEinLabelText}</Content>
      </strong>
      <ScrollableFormFieldWrapper fieldName={"dolEin"}>
        <div className="text-field-width-reduced padding-bottom-2">
          <GenericTextField
            numericProps={{
              maxLength: DOL_EIN_CHARACTERS,
            }}
            fieldName={"dolEin"}
            inputWidth={"default"}
            disabled={props.disabled}
            value={props.value ?? business?.profileData.deptOfLaborEin}
            onValidation={props.onValidation}
            error={props.error}
            validationText={props.validationText}
            onChange={props.handleChange}
          />
        </div>
      </ScrollableFormFieldWrapper>
    </>
  );
};
