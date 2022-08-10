import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { ROUTES } from "@/lib/domain-logic/routes";
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
          pathname: ROUTES.landing,
          query,
        });
      }
    })();
  }, [router, state.isAuthenticated]);
};

export const useAuthAlertPage = (): void => {
  const { showCard } = useSidebarCards();
  const { isAuthenticated, setAlertIsVisible, modalIsVisible } = useContext(AuthAlertContext);
  const router = useRouter();
  useMountEffectWhenDefined(() => {
    if (isAuthenticated === IsAuthenticated.FALSE && router.query.fromOnboarding === "true") {
      setAlertIsVisible(true);
      return;
    }

    if (isAuthenticated === IsAuthenticated.FALSE) {
      showCard("not-registered");
    }

    setAlertIsVisible(false);
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
        await router.replace(ROUTES.landing);
      }
    })();
  }, [router, state.isAuthenticated]);
};
