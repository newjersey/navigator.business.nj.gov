import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { PageSkeleton } from "@/components/PageSkeleton";
import React, { ChangeEvent, ReactElement, useContext, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import { postSelfReg } from "@/lib/api-client/apiClient";
import { useRouter } from "next/router";
import { SelfRegDefaults } from "@/display-content/SelfRegDefaults";
import { Alert } from "@/components/njwds/Alert";
import { AuthContext } from "@/pages/_app";
import { IsAuthenticated } from "@/lib/auth/AuthContext";

type SelfRegError = "EMAILS_DO_NOT_MATCH" | "REQUIRED_FIELDS" | "GENERIC";
const SelfRegErrorLookup: Record<SelfRegError, string> = {
  EMAILS_DO_NOT_MATCH: SelfRegDefaults.errorTextEmailsNotMatching,
  REQUIRED_FIELDS: SelfRegDefaults.errorTextRequiredFields,
  GENERIC: SelfRegDefaults.errorTextGeneric,
};

const SignUpPage = (): ReactElement => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [error, setError] = useState<SelfRegError | undefined>(undefined);
  const router = useRouter();

  const { state } = useContext(AuthContext);
  useEffect(() => {
    if (state.isAuthenticated === IsAuthenticated.TRUE) {
      router.replace("/roadmap");
    }
  }, [state]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
  };

  const handleConfirmEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setConfirmEmail(event.target.value);
  };

  const submitSelfReg = async () => {
    if (!email || !confirmEmail || !name) {
      setError("REQUIRED_FIELDS");
      return;
    }
    if (email !== confirmEmail) {
      setError("EMAILS_DO_NOT_MATCH");
      return;
    }
    setError(undefined);

    postSelfReg({ email: email, confirmEmail: confirmEmail, name: name })
      .then(async (response) => {
        await router.replace(response.authRedirectURL);
      })
      .catch((errorCode) => {
        if (errorCode === 400) {
          setError("EMAILS_DO_NOT_MATCH");
        } else {
          setError("GENERIC");
        }
      });
  };

  const showAlert = (): ReactElement => {
    if (error) {
      return (
        <Alert data-testid={`error-alert-${error}`} slim variant="error">
          {SelfRegErrorLookup[error]}
        </Alert>
      );
    } else {
      return <></>;
    }
  };

  return (
    <PageSkeleton>
      <SinglePageLayout>
        {showAlert()}
        <div className="margin-top-2">
          <label htmlFor="name">{SelfRegDefaults.nameFieldLabel}</label>
          <TextField
            value={name}
            onChange={handleNameChange}
            variant="outlined"
            fullWidth
            placeholder={SelfRegDefaults.nameFieldPlaceholder}
            inputProps={{
              id: "name",
              "data-testid": "name",
            }}
          />
        </div>
        <div className="margin-top-2">
          <label htmlFor="email">{SelfRegDefaults.emailFieldLabel}</label>
          <TextField
            value={email}
            onChange={handleEmailChange}
            variant="outlined"
            fullWidth
            placeholder={SelfRegDefaults.emailFieldPlaceholder}
            inputProps={{
              id: "email",
              "data-testid": "email",
            }}
          />
        </div>
        <div className="margin-top-2">
          <label htmlFor="confirm-email">{SelfRegDefaults.confirmEmailFieldLabel}</label>
          <TextField
            value={confirmEmail}
            onChange={handleConfirmEmailChange}
            variant="outlined"
            fullWidth
            placeholder={SelfRegDefaults.confirmEmailFieldPlaceholder}
            inputProps={{
              id: "confirm-email",
              "data-testid": "confirm-email",
            }}
          />
        </div>
        <div className="margin-top-2">
          <button className="usa-button" onClick={submitSelfReg} data-testid="submit-selfreg">
            {SelfRegDefaults.submitButtonText}
          </button>
        </div>
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export default SignUpPage;
