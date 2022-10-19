import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

export const useAuthAlertPage = (): void => {
  const { showCard } = useSidebarCards();
  const { isAuthenticated, setRegistrationAlertIsVisible, registrationModalIsVisible } =
    useContext(AuthAlertContext);
  const router = useRouter();
  useMountEffectWhenDefined(() => {
    if (
      isAuthenticated === IsAuthenticated.FALSE &&
      checkQueryValue(router, QUERIES.fromOnboarding, "true")
    ) {
      setRegistrationAlertIsVisible(true);
      return;
    }

    if (isAuthenticated === IsAuthenticated.FALSE) {
      showCard("not-registered");
    }

    setRegistrationAlertIsVisible(false);
  }, isAuthenticated);

  useEffect(() => {
    if (registrationModalIsVisible) {
      setRegistrationAlertIsVisible(false);
    }
  }, [registrationModalIsVisible, setRegistrationAlertIsVisible]);
};
