import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
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

export const useAuthAlertPage = (): void => {
  const { isAuthenticated, setAlertIsVisible, modalIsVisible } = useContext(AuthAlertContext);
  const router = useRouter();

  useMountEffectWhenDefined(() => {
    (async () => {
      if (isAuthenticated === IsAuthenticated.FALSE) {
        const isShowingSuccessAlert = router.query.success === "true";
        if (isShowingSuccessAlert) {
          setAlertIsVisible(false);
        } else {
          setAlertIsVisible(true);
        }
      }
    })();
  }, isAuthenticated);

  useEffect(() => {
    if (modalIsVisible) {
      setAlertIsVisible(false);
    }
  }, [modalIsVisible, setAlertIsVisible]);
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
