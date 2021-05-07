/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { ReactElement, useContext, useState } from "react";
import { useRouter } from "next/router";
import { AuthState } from "@aws-amplify/ui-components";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthContext } from "./_app";
import { onSignIn, onSignOut } from "@/lib/auth/signinHelper";

const SigninPage = (): ReactElement => {
  const { dispatch } = useContext(AuthContext);
  const router = useRouter();
  // this is a workaround for https://github.com/aws-amplify/amplify-js/issues/6069
  const [alreadySignedIn, setAlreadySignedIn] = useState(false);

  const handleAuthStateChange = (state: AuthState) => {
    if (state === AuthState.SignedIn && !alreadySignedIn) {
      setAlreadySignedIn(true);
      onSignIn(router.push, dispatch);
    } else if (state === AuthState.SignedOut) {
      onSignOut(router.push, dispatch);
    }
  };

  return <AmplifyAuthenticator handleAuthStateChange={handleAuthStateChange} />;
};

export default SigninPage;
