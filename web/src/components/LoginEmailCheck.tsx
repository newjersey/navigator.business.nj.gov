import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { postUserEmailCheck } from "@/lib/api-client/apiClient";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { validateEmail } from "@/lib/utils/helpers";
import { InputLabel } from "@mui/material";
import Link from "next/link";

import { useState, type ReactElement } from "react";

export const LoginEmailCheck = (): ReactElement => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const handleSubmit = (email: string): void => {
    const isValidEmail = validateEmail(email);

    if (isValidEmail) {
      checkEmailExists(email);
    } else {
      setEmailError(Config.checkAccountEmailPage.invalidEmailError);
    }
  };

  const checkEmailExists = async (email: string): Promise<void> => {
    try {
      const response = await postUserEmailCheck(email);
      if (response.found) {
        setEmailError("");
        triggerSignIn();
        analytics.event.check_account_next_button.submit.go_to_myNJ_login();
      }
    } catch (error) {
      if (error === 404) {
        setEmailError(Config.checkAccountEmailPage.emailNotFoundError);
      } else if (error === 500) {
        setEmailError(Config.checkAccountEmailPage.serviceNotAvailableError);
      } else {
        setEmailError(Config.checkAccountEmailPage.defaultErrorMessage);
      }
    }
  };

  const { Config } = useConfig();

  const handleTextInputChange = (value: string): void => {
    setEmail(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      const email = (event.target as HTMLInputElement).value;
      handleSubmit(email);
    }
  };

  return (
    <div className="email-check-card padding-5 desktop:margin-x-2 radius-md">
      <Heading level={1} styleVariant="h2">
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
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </WithErrorBar>

      <PrimaryButton
        isFullWidthOnDesktop
        isColor="primary"
        isSubmitButton
        onClick={() => handleSubmit(email)}
      >
        {Config.checkAccountEmailPage.inputButton}
      </PrimaryButton>

      <hr className="margin-y-3" />
      <p className="link-account-text">
        <span className="margin-right-05">{Config.checkAccountEmailPage.noAccountText}</span>
        <Link href={ROUTES.onboarding}>{Config.checkAccountEmailPage.linkAccountLinkText}</Link>
      </p>

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