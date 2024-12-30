import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useRouter } from "next/compat/router";
import { useContext, useEffect } from "react";

export const usePageWithNeedsAccountSnackbar = (): void => {
  const { isAuthenticated, setShowNeedsAccountSnackbar, showNeedsAccountModal } =
    useContext(NeedsAccountContext);
  const router = useRouter();
  useMountEffectWhenDefined(() => {
    if (
      isAuthenticated === IsAuthenticated.FALSE &&
      router &&
      checkQueryValue(router, QUERIES.fromOnboarding, "true")
    ) {
      setShowNeedsAccountSnackbar(true);
      return;
    }

    setShowNeedsAccountSnackbar(false);
  }, isAuthenticated);

  useEffect(() => {
    if (showNeedsAccountModal) {
      setShowNeedsAccountSnackbar(false);
    }
  }, [showNeedsAccountModal, setShowNeedsAccountSnackbar]);
};
