import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { AuthContext } from "@/contexts/authContext";
import { postUserEmailCheck } from "@/lib/api-client/apiClient";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onGuestSignIn } from "@/lib/auth/signinHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { validateEmail } from "@/lib/utils/helpers";
import { InputLabel } from "@mui/material";
import { useRouter } from "next/compat/router";

import { useContext, useState, type ReactElement } from "react";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Content } from "./Content";

export const LoginEmailCheck = (): ReactElement => {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const router = useRouter();
  const { dispatch } = useContext(AuthContext);

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
        await triggerSignIn();
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
      <Heading level={1}>{Config.checkAccountEmailPage.header}</Heading>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col-6">
          {emailError && emailError !== Config.checkAccountEmailPage.invalidEmailError && (
            <Alert variant="error">
              <Content>{Config.checkAccountEmailPage.emailNotFoundAlertError}</Content>
            </Alert>
          )}
          <div className="help-text-container margin-bottom-2">
            <div>
              <Content>{Config.checkAccountEmailPage.noAccountText}</Content>
            </div>
          </div>
          <WithErrorBar hasError={Boolean(emailError)} type="ALWAYS">
            <InputLabel htmlFor="email">Email</InputLabel>
            <GenericTextField
              inputWidth="full"
              fieldName="email"
              value={email}
              handleChange={handleTextInputChange}
              error={Boolean(emailError)}
              validationText={emailError}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </WithErrorBar>
          <div>
            <PrimaryButton
              isFullWidthOnDesktop
              isColor="primary"
              isSubmitButton
              onClick={() => handleSubmit(email)}
            >
              {Config.checkAccountEmailPage.inputButton}
            </PrimaryButton>
            <div
              className="or-divider display-flex flex-align-center margin-y-3"
              style={{ width: "100%" }}
            >
              <hr className="flex-fill margin-0" aria-hidden="true" style={{ minWidth: "20px" }} />
              <span className="padding-x-2 text-base-dark text-center">
                {Config.checkAccountEmailPage.subButtonText}
              </span>
              <hr className="flex-fill margin-0" aria-hidden="true" style={{ minWidth: "20px" }} />
            </div>
            <SecondaryButton
              isFullWidthOnDesktop
              isColor="primary"
              onClick={() => {
                if (!router) return;
                onGuestSignIn({ push: router.push, pathname: router.pathname, dispatch });
              }}
            >
              {Config.checkAccountEmailPage.createAccountButton}
            </SecondaryButton>
          </div>
        </div>
        <div className="tablet:grid-col-6 tablet:border-left tablet:border-base-lighter tablet:padding-left-3 mobile-border-top">
          <div className="need-help-text">
            <Heading level={2}>
              <p>{Config.checkAccountEmailPage.needHelpText}</p>
            </Heading>
            <div style={{ display: "inline" }}>
              <Content>{Config.checkAccountEmailPage.assistanceText}</Content>{" "}
              <UnStyledButton
                isUnderline
                isIntercomEnabled
                onClick={analytics.event.check_account_help_button.click.open_live_chat}
              >
                {Config.checkAccountEmailPage.intercomChatText}
              </UnStyledButton>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
