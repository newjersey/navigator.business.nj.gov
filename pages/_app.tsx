import "../styles/global.scss";
import { AppProps } from "next/app";
import React, { Dispatch, ReactElement, useEffect, useReducer, useState } from "react";
import { AuthContextType, AuthReducer, authReducer } from "../lib/auth/AuthContext";
import { BusinessForm } from "../lib/types/form";

import awsExports from "../src/aws-exports";
import { Amplify } from "aws-amplify";

Amplify.configure({ ...awsExports, ssr: true });

const initialState = {
  user: undefined,
  isAuthenticated: false,
};

export const AuthContext = React.createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState,
});

export interface FormContextType {
  formData: BusinessForm;
  setFormData: Dispatch<BusinessForm>;
}

export const FormContext = React.createContext<FormContextType>({
  formData: {},
  setFormData: () => {},
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [formData, setFormData] = useState<BusinessForm>({});

  useEffect(() => {
    if (state.user) {
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          email: state.user.email,
        },
      });
    }
  }, [state.user]);

  return (
    <>
      <script src="/js/uswds.js" />
      <script src="/js/uswds-init.js" />
      <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="/css/styles.css" />
      <AuthContext.Provider value={{ state, dispatch }}>
        <FormContext.Provider value={{ formData, setFormData }}>
          <Component {...pageProps} />
        </FormContext.Provider>
      </AuthContext.Provider>
    </>
  );
};

export default App;
