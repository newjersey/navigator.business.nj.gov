import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

export const useAuthAlertPage = (): void => {
  const { showCard } = useSidebarCards();
  const { isAuthenticated, setAlertIsVisible, modalIsVisible } = useContext(AuthAlertContext);
  const router = useRouter();
  useMountEffectWhenDefined(() => {
    if (
      isAuthenticated === IsAuthenticated.FALSE &&
      checkQueryValue(router, QUERIES.fromOnboarding, "true")
    ) {
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
