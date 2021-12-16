import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

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
