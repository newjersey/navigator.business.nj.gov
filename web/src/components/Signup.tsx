import { Alert } from "@/components/njwds-extended/Alert";
import { Icon } from "@/components/njwds/Icon";
import { postSelfReg } from "@/lib/api-client/apiClient";
import analytics from "@/lib/utils/analytics";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { ChangeEvent, ReactElement, useState } from "react";
import { Button } from "./njwds-extended/Button";

type SelfRegError = "EMAILS_DO_NOT_MATCH" | "REQUIRED_FIELDS" | "DUPLICATE_SIGNUP" | "GENERIC";
const SelfRegErrorLookup: Record<SelfRegError, string> = {
  EMAILS_DO_NOT_MATCH: Defaults.selfRegistration.errorTextEmailsNotMatching,
  REQUIRED_FIELDS: Defaults.selfRegistration.errorTextRequiredFields,
  DUPLICATE_SIGNUP: Defaults.selfRegistration.errorTextDuplicateSignup,
  GENERIC: Defaults.selfRegistration.errorTextGeneric,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Signup = (props: Props): ReactElement => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [newsletterChecked, setNewsletterChecked] = React.useState(true);
  const [userTestingChecked, setUserTestingChecked] = React.useState(true);
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

    postSelfReg({
      email,
      confirmEmail,
      name,
      userTesting: userTestingChecked,
      receiveNewsletter: newsletterChecked,
    })
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
        <Alert dataTestid={`error-alert-${error}`} variant="error">
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
        <div className="padding-top-1 text-bold tablet:padding-x-2 tablet:font-body-xl mobile-lg:font-body-lg">
          {Defaults.selfRegistration.signupTitleText}
        </div>
      </DialogTitle>
      <DialogContent>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
        <div className="tablet:padding-2">
          <p className="padding-bottom-1">{Defaults.selfRegistration.signupDescriptionText}</p>
          {showAlert()}
          <div className="margin-top-2">
            <label htmlFor="name">{Defaults.selfRegistration.nameFieldLabel}</label>
            <TextField
              value={name}
              onChange={handleNameChange}
              variant="outlined"
              fullWidth
              placeholder={Defaults.selfRegistration.nameFieldPlaceholder}
              inputProps={{
                id: "name",
                "data-testid": "name",
              }}
            />
          </div>
          <div className="margin-top-2">
            <label htmlFor="email">{Defaults.selfRegistration.emailFieldLabel}</label>
            <TextField
              value={email}
              onChange={handleEmailChange}
              variant="outlined"
              fullWidth
              placeholder={Defaults.selfRegistration.emailFieldPlaceholder}
              inputProps={{
                id: "email",
                "data-testid": "email",
              }}
            />
          </div>
          <div className="margin-y-2">
            <label htmlFor="confirm-email">{Defaults.selfRegistration.confirmEmailFieldLabel}</label>
            <TextField
              value={confirmEmail}
              onChange={handleConfirmEmailChange}
              variant="outlined"
              fullWidth
              placeholder={Defaults.selfRegistration.confirmEmailFieldPlaceholder}
              inputProps={{
                id: "confirm-email",
                "data-testid": "confirm-email",
              }}
            />
          </div>
          <FormGroup>
            <FormControlLabel
              style={{ display: "table" }}
              label={Defaults.selfRegistration.newsletterCheckboxLabel}
              control={
                <div style={{ display: "table-cell", width: "42px" }}>
                  <Checkbox
                    checked={newsletterChecked}
                    onChange={(event) => setNewsletterChecked(event.target.checked)}
                  />
                </div>
              }
            />
            <FormControlLabel
              style={{ display: "table" }}
              label={Defaults.selfRegistration.userTestingCheckboxLabel}
              control={
                <div style={{ display: "table-cell", width: "42px" }}>
                  <Checkbox
                    checked={userTestingChecked}
                    onChange={(event) => setUserTestingChecked(event.target.checked)}
                  />
                </div>
              }
            />
          </FormGroup>
        </div>
      </DialogContent>
      <DialogActions>
        <div className="padding-3 flex">
          <Button style="secondary" onClick={onClose}>
            {Defaults.selfRegistration.closeButtonText}
          </Button>
          <Button
            typeSubmit
            noRightMargin
            style="primary"
            loading={isLoading}
            onClick={() => {
              submitSelfReg();
              analytics.event.landing_page_registration_create.click.go_to_myNJ_registration();
            }}
            dataTestid="submit-selfreg"
          >
            {Defaults.selfRegistration.submitButtonText}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
