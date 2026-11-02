import { TextField } from "@mui/material";
import { type ChangeEvent, type KeyboardEvent, type ReactElement, useState } from "react";
import * as apiClient from "@/lib/api-client/apiClient";

interface Props {
  password: string;
  setPassword: (value: string) => void;
  setIsAuthed: (value: boolean) => void;
}

export const MgmtAuth = (props: Props): ReactElement => {
  const { password } = props;
  const [hasError, setHasError] = useState<boolean>(false);

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.code === "Enter" || event.key === "Enter") {
      onSubmit();
    }
  };

  const handlePasswordInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setHasError(false);
    props.setPassword(event.target.value);
  };

  const onSubmit = (): void => {
    setHasError(false);
    apiClient
      .post("/mgmt/auth", { password }, false)
      .then(() => {
        return props.setIsAuthed(true);
      })
      .catch(() => {
        setHasError(true);
      });
  };

  return (
    <>
      <h1>Enter admin password:</h1>
      <label htmlFor="password">Password</label>
      <TextField
        name="password"
        variant="outlined"
        type="password"
        value={password}
        error={hasError}
        helperText={hasError ? "Authentication failed" : ""}
        onChange={handlePasswordInput}
        onKeyPress={handleKeyPress}
        slotProps={{
          htmlInput: {
            id: "password",
            "data-testid": "mgmt-password-field",
          },
        }}
      />
      <button
        type="button"
        onClick={onSubmit}
        className="usa-button margin-top-2"
        data-testid="mgmt-submit-button"
      >
        Submit
      </button>
    </>
  );
};
