import { GenericTextField } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ReactElement, useState } from "react";

export const LoginEmailCheck = (): ReactElement => {
  const [email, setEmail] = useState<string>("");

  return (
    <div>
      <div>{"Log in to Business.NJ.gov"}</div>

      <WithErrorBar
        hasError={!!addressErrorMap["addressName"].invalid}
        type="ALWAYS"
        className="margin-bottom-2"
      >
        <strong>
          <ModifiedContent>{"Email"}</ModifiedContent>
        </strong>
        {/* copied from DateOfFormation, and AddressModal */}
        <GenericTextField
          inputWidth={"full"}
          // fieldName={fieldName}
          // onValidation={onValidation}
          // validationText={errorText}
          // error={isFormFieldInvalid}
          // fieldOptions={{
          //   error: isFormFieldInvalid,
          // }}
        />
      </WithErrorBar>
    </div>
  );
};
