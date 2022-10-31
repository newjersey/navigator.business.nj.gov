import * as apiClient from "@/lib/api-client/apiClient";
import { TextField } from "@mui/material";
import { ChangeEvent, KeyboardEvent } from "react";

interface Props {
  password: string;
  setPassword: (value: string) => void;
  setIsAuthed: (value: boolean) => void;
}

export const MgmtAuth = (props: Props) => {
  const { password } = props;

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.code === "Enter" || event.key === "Enter") {
      onSubmit();
    }
  };

  const handlePasswordInput = (event: ChangeEvent<HTMLInputElement>): void => {
    props.setPassword(event.target.value);
  };

  const onSubmit = (): void => {
    apiClient
      .post("/mgmt/auth", { password }, false)
      .then(() => {
        return props.setIsAuthed(true);
      })
      .catch(() => {});
  };

  return (
    <>
      <h1>Enter admin password:</h1>
      <label htmlFor="password">Password</label>
      <TextField
        fullWidth
        name="password"
        variant="outlined"
        type="password"
        value={password}
        onChange={handlePasswordInput}
        onKeyPress={handleKeyPress}
        inputProps={{
          id: "password",
          "data-testid": "mgmt-password-field",
        }}
      />
      <button onClick={onSubmit} className="usa-button margin-top-2" data-testid="mgmt-submit-bttn">
        Submit
      </button>
    </>
  );
};
