import { useRouter } from "next/compat/router";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseUnsavedChangesGuardProps {
  hasUnsavedChanges: boolean;
}

interface UseUnsavedChangesGuardReturn {
  isBlocked: boolean;
  pendingUrl: string | null;
  allowNavigation: () => void;
  blockNavigation: () => void;
  reset: () => void;
}

export const useUnsavedChangesGuard = ({
  hasUnsavedChanges,
}: UseUnsavedChangesGuardProps): UseUnsavedChangesGuardReturn => {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const isNavigationAllowedRef = useRef(false);

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  const allowNavigation = useCallback(() => {
    isNavigationAllowedRef.current = true;
    setIsBlocked(false);
    if (pendingUrl && router) {
      router.push(pendingUrl);
    }
    setPendingUrl(null);
  }, [pendingUrl, router]);

  const blockNavigation = useCallback(() => {
    setIsBlocked(false);
    setPendingUrl(null);
    isNavigationAllowedRef.current = false;
  }, []);

  const reset = useCallback(() => {
    setIsBlocked(false);
    setPendingUrl(null);
    isNavigationAllowedRef.current = false;
  }, []);

  useEffect(() => {
    if (!router?.events || !router.isReady) return;

    const handleRouteChangeError = (err: unknown): void => {
      if ((err as { cancelled?: boolean })?.cancelled) {
        return;
      }
      throw err as Error;
    };

    const handleRouteChangeStart = (url: string): void => {
      if (!hasUnsavedChangesRef.current || isNavigationAllowedRef.current) {
        isNavigationAllowedRef.current = false;
        return;
      }

      setPendingUrl(url);
      setIsBlocked(true);

      // NOTE: Navigation interruption is suppressed in development to avoid disrupting workflow.
      // Navigation will proceed even with unsaved changes - this is intentional.
      // In non-dev environments, we throw an error (not caught) to cancel navigation per Next.js router events pattern.
      // See: https://nextjs.org/docs/pages/api-reference/functions/use-router#routerevents
      if (process.env.NODE_ENV === "development") return;

      const err: Error & { cancelled?: boolean } = new Error(
        "Navigation blocked due to unsaved changes",
      );
      err.cancelled = true;
      router.events.emit("routeChangeError", err, url, { shallow: false });
      throw err;
    };

    router.events.on("routeChangeError", handleRouteChangeError);
    router.events.on("routeChangeStart", handleRouteChangeStart);

    return (): void => {
      router.events.off("routeChangeError", handleRouteChangeError);
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return "";
      }
      return undefined;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return (): void => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return {
    isBlocked,
    pendingUrl,
    allowNavigation,
    blockNavigation,
    reset,
  };
};
