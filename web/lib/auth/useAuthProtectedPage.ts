import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../../pages/_app";

export const useAuthProtectedPage = (): void => {
  const { state } = useContext(AuthContext);
  const router = useRouter();
  useEffect(() => {
    if (!state.isAuthenticated) {
      router.replace("/");
    }
  }, [state]);
};
