import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import analytics from "@/lib/utils/analytics";

import { GenericTextField } from "@/components/GenericTextField";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { postUserEmailCheck } from "@/lib/api-client/apiClient";
import { InputLabel } from "@mui/material";
import { useState } from "react";

import { useConfig } from "@/lib/data-hooks/useConfig";

import { ReactElement } from "react";

// const BUSINESS_NJ_LOGIN = "https://account.business.nj.gov/login";

const checkEmail = async (email: string) => {
  try {
    const response = await postUserEmailCheck(email);
    console.log("success", response);
  } catch (error) {
    console.error("error", error);
  }
};
export const LoginEmailCheck = (): ReactElement => {
  const [email, setEmail] = useState<string>("");
  const { Config } = useConfig();

  const handleTextInputChange = (value: string): void => {
    setEmail(value);
  };

  return (
    <>
      <Heading level={2} className="text-normal">
        {Config.checkAccountEmailPage.header}
      </Heading>

      <InputLabel htmlFor="email">Email</InputLabel>
      <GenericTextField
        inputWidth="reduced"
        fieldName="email"
        value={email}
        handleChange={handleTextInputChange}
      ></GenericTextField>

      <PrimaryButton isColor="primary" isSubmitButton onClick={() => checkEmail(email)}>
        {Config.checkAccountEmailPage.inputButton}
      </PrimaryButton>

      <Content>{Config.checkAccountEmailPage.linkAccountText}</Content>
      <p>{Config.checkAccountEmailPage.needHelpText}</p>
      <UnStyledButton
        isUnderline
        isIntercomEnabled
        onClick={analytics.event.check_account_help_button.click.open_live_chat}
      >
        {Config.checkAccountEmailPage.intercomChatText}
      </UnStyledButton>
    </>
  );

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
