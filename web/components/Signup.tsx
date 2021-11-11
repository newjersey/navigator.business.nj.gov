import React, { ChangeEvent, ReactElement, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { postSelfReg } from "@/lib/api-client/apiClient";
import { useRouter } from "next/router";
import { SelfRegDefaults } from "@/display-defaults/SelfRegDefaults";
import { Alert } from "@/components/njwds/Alert";
import { LoadingButton } from "@/components/njwds-extended/LoadingButton";
import { Button } from "./njwds-extended/Button";

type SelfRegError = "EMAILS_DO_NOT_MATCH" | "REQUIRED_FIELDS" | "DUPLICATE_SIGNUP" | "GENERIC";
const SelfRegErrorLookup: Record<SelfRegError, string> = {
  EMAILS_DO_NOT_MATCH: SelfRegDefaults.errorTextEmailsNotMatching,
  REQUIRED_FIELDS: SelfRegDefaults.errorTextRequiredFields,
  DUPLICATE_SIGNUP: SelfRegDefaults.errorTextDuplicateSignup,
  GENERIC: SelfRegDefaults.errorTextGeneric,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Signup = (props: Props): ReactElement => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SelfRegError | undefined>(undefined);
  const router = useRouter();

  const onClose = (): void => {
    setError(undefined);
    props.onClose();
  };

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
    setIsLoading(true);

    postSelfReg({ email: email, confirmEmail: confirmEmail, name: name })
      .then(async (response) => {
        await router.replace(response.authRedirectURL);
      })
      .catch((errorCode) => {
        if (errorCode === 400) {
          setError("EMAILS_DO_NOT_MATCH");
        } else if (errorCode === 409) {
          setError("DUPLICATE_SIGNUP");
        } else {
          setError("GENERIC");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const showAlert = (): ReactElement => {
    if (error) {
      return (
        <Alert data-testid={`error-alert-${error}`} slim variant="error" className="margin-y-2">
          {SelfRegErrorLookup[error]}
        </Alert>
      );
    } else {
      return <></>;
    }
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth="md"
      open={props.isOpen}
      onClose={onClose}
      aria-labelledby="signup-modal"
    >
      <DialogTitle id="signup-modal">
        <div className="padding-top-1 padding-x-2 text-bold font-body-xl">
          {SelfRegDefaults.signupTitleText}
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="padding-2">
          <p className="padding-bottom-1">{SelfRegDefaults.signupDescriptionText}</p>
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
        </div>
      </DialogContent>
      <DialogActions>
        <div className="padding-3 flex">
          <Button style="secondary" onClick={onClose}>
            {SelfRegDefaults.closeButtonText}
          </Button>
          <LoadingButton
            type="submit"
            onClick={submitSelfReg}
            loading={isLoading}
            marginClass="spinner-margin-36"
            data-testid="submit-selfreg"
          >
            {SelfRegDefaults.submitButtonText}
          </LoadingButton>
        </div>
      </DialogActions>
    </Dialog>
  );
};
