import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { ReactElement } from "react";

export const LoginEmailCheck = (): ReactElement => {
  // const [email, setEmail] = useState<string>("");

  return (
    <div>
      <Heading level={2}>{"Log in to Business.NJ.gov"}</Heading>

      <WithErrorBar
        // hasError={!!addressErrorMap["addressName"].invalid}
        hasError={false}
        type="ALWAYS"
        className="margin-bottom-2"
      >
        <strong>
          <ModifiedContent>{"Email"}</ModifiedContent>
        </strong>
        {/* copied from DateOfFormation, and AddressModal */}
        {/*<GenericTextField
          //inputWidth={"full"}
          // fieldName={fieldName}
          // onValidation={onValidation}
          // validationText={errorText}
          // error={isFormFieldInvalid}
          // fieldOptions={{
          //   error: isFormFieldInvalid,
          // }}
        />*/}
      </WithErrorBar>
    </div>
  );
};
