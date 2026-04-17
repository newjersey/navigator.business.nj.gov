import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { AuthContext } from "@/contexts/authContext";
import { type ApiError, postUserEmailCheck } from "@/lib/api-client/apiClient";
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
    if (!email || email.trim() === "" || !validateEmail(email)) {
      setEmailError(Config.checkAccountEmailPage.emailNotFoundError);
      return;
    }
    checkEmailExists(email);
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
      const { status } = error as ApiError;
      if (status === 404) {
        setEmailError(Config.checkAccountEmailPage.emailNotFoundError);
      } else if (status === 500) {
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
        <div className="tablet:grid-col-6 tablet:padding-right-3">
          <div className="email-check-card-section">
            {emailError && (
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
                className="or-divider display-block margin-y-2 text-left tablet:display-flex tablet:flex-align-center tablet:text-center"
                style={{ width: "100%" }}
              >
                <hr
                  className="flex-fill margin-0 display-none tablet:display-block"
                  aria-hidden="true"
                  style={{ border: "none", borderTop: "1px solid #dfe1e2", height: "0" }}
                />
                <span className="display-block padding-y-1 text-base-dark tablet:flex-shrink-0 tablet:padding-y-0">
                  {Config.checkAccountEmailPage.subButtonText}
                </span>
                <hr
                  className="flex-fill margin-0 display-none tablet:display-block"
                  aria-hidden="true"
                  style={{ border: "none", borderTop: "1px solid #dfe1e2", height: "0" }}
                />
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
        </div>
        <div className="tablet:grid-col-6 tablet:border-left tablet:border-base-lighter tablet:padding-left-2 tablet:padding-right-3 mobile-border-top">
          <div className="need-help-text need-help-text-section">
            <Heading level={2} className="text-base-darkest">
              <p className="text-base-darkest">{Config.checkAccountEmailPage.needHelpText}</p>
            </Heading>
            <div style={{ display: "inline" }}>
              <Content className="display-inline" style={{ display: "inline" }}>
                {Config.checkAccountEmailPage.assistanceText}
              </Content>{" "}
              <UnStyledButton
                className="display-inline"
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
