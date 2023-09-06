import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

export const useAuthAlertPage = (): void => {
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

    setRegistrationAlertIsVisible(false);
  }, isAuthenticated);

  useEffect(() => {
    if (registrationModalIsVisible) {
      setRegistrationAlertIsVisible(false);
    }
  }, [registrationModalIsVisible, setRegistrationAlertIsVisible]);
};
