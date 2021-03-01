/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { ReactElement, useContext } from "react";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import { AuthContext } from "./_app";
import { BusinessUser } from "../lib/types/BusinessUser";
import { useRouter } from "next/router";
import { useMountEffect } from "../lib/helpers";

const SigninPage = (): ReactElement => {
  const { dispatch } = useContext(AuthContext);
  const router = useRouter();

  useMountEffect(() => {
    return onAuthUIStateChange(handleAuthStateChange);
  });

  const cognitoUserToBusinessUser = (cognitoUser: any): BusinessUser => {
    return {
      name: undefined,
      email: cognitoUser.attributes.email,
      id: cognitoUser.username,
    };
  };

  const handleAuthStateChange = (state: AuthState, data: any) => {
    if (state === AuthState.SignedIn) {
      router.push("/");
      dispatch({
        type: "LOGIN",
        user: cognitoUserToBusinessUser(data),
      });
    } else {
      dispatch({
        type: "LOGOUT",
        user: undefined,
      });
    }
  };

  return <AmplifyAuthenticator handleAuthStateChange={handleAuthStateChange} />;
};

export default SigninPage;
