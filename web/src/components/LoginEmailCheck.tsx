import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { postUserEmailCheck } from "@/lib/api-client/apiClient";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { InputLabel } from "@mui/material";
import { useState, type ReactElement } from "react";

// const BUSINESS_NJ_LOGIN = "https://account.business.nj.gov/login";

export const LoginEmailCheck = (): ReactElement => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const checkEmail = async (email: string) => {
    try {
      const response = await postUserEmailCheck(email);
      if (response.found) {
        setEmailError("");
        triggerSignIn();
        analytics.event.check_account_next_button.submit.go_to_myNJ_login();
      }
    } catch (error) {
      if (error === 404) {
        setEmailError("No account found. Try a different email address.");
      }
    }
  };

  const { Config } = useConfig();

  const handleTextInputChange = (value: string): void => {
    setEmail(value);
  };

  return (
    <div className="email-check-card padding-5 desktop:margin-x-7 margin-x-2 radius-md">
      <Heading level={2} className="text-normal">
        {Config.checkAccountEmailPage.header}
      </Heading>

      <WithErrorBar hasError={Boolean(emailError)} type="ALWAYS">
        <InputLabel htmlFor="email">Email</InputLabel>
        <GenericTextField
          inputWidth="default"
          fieldName="email"
          value={email}
          handleChange={handleTextInputChange}
          error={Boolean(emailError)}
          validationText={emailError}
        ></GenericTextField>
      </WithErrorBar>

      <PrimaryButton isFullWidthOnDesktop isColor="primary" isSubmitButton onClick={() => checkEmail(email)}>
        {Config.checkAccountEmailPage.inputButton}
      </PrimaryButton>

      <hr className="margin-y-3" />
      <Content className="link-account-text">{Config.checkAccountEmailPage.linkAccountText}</Content>

      <div className="display-flex flex-align-end">
        <p>{Config.checkAccountEmailPage.needHelpText}</p>
        <UnStyledButton
          isUnderline
          isIntercomEnabled
          onClick={analytics.event.check_account_help_button.click.open_live_chat}
          className="margin-left-05"
        >
          {Config.checkAccountEmailPage.intercomChatText}
        </UnStyledButton>
      </div>
    </div>
  );
};
