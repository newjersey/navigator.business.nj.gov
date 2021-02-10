/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Dispatch, ReactElement, useState } from "react";
import { AuthAction, AuthState } from "../lib/auth/AuthContext";
import { render, RenderResult } from "@testing-library/react";
import { AuthContext, FormContext } from "../pages/_app";
import { BusinessUser } from "../lib/types";

export const renderWithUser = (
  subject: ReactElement,
  user: BusinessUser | undefined,
  dispatch: Dispatch<AuthAction>
): RenderResult => {
  const state: AuthState = { isAuthenticated: !!user, user: user };
  return render(
    <AuthContext.Provider value={{ state, dispatch }}>
      {subject}
    </AuthContext.Provider>
  );
};

export const renderWithFormData = (
  subject: ReactElement,
  formData?: any
): RenderResult => {
  const initialState = formData ? formData : {};
  return render(
    <FormDataWrapper initialState={initialState}>{subject}</FormDataWrapper>
  );
};

const FormDataWrapper = ({
  children,
  initialState,
}: {
  children: ReactElement;
  initialState: any;
}): ReactElement => {
  const [formData, setFormData] = useState(initialState);
  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};
