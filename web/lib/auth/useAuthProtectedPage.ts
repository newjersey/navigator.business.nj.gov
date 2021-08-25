import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/pages/_app";
import { IsAuthenticated } from "./AuthContext";

export const useAuthProtectedPage = (): void => {
  const { state } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      if (state.isAuthenticated === IsAuthenticated.FALSE) {
        await router.replace("/");
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
