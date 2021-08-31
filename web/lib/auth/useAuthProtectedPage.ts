import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { IsAuthenticated } from "@/lib/auth/AuthContext";

export const signInSamlError = "Name+ID+value+was+not+found+in+SAML";
export const useAuthProtectedPage = (): void => {
  const { state } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      if (state.isAuthenticated === IsAuthenticated.FALSE) {
        const shouldSignUp = router.asPath.includes(signInSamlError);
        const query = shouldSignUp ? { signUp: shouldSignUp.toString() } : {};
        await router.replace({
          pathname: "/",
          query,
        });
      }
    })();
  }, [router, state.isAuthenticated]);
};

export const useUnauthedOnlyPage = (): void => {
  const { state } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      if (state.isAuthenticated === IsAuthenticated.TRUE) {
        await router.replace("/");
      }
    })();
  }, [router, state.isAuthenticated]);
};
