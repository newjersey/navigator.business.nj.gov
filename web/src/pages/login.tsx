import { LoginEmailCheck } from "@/components/LoginEmailCheck";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { getActiveUser } from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useMountEffect } from "@/lib/utils/helpers";
import { type GetStaticPropsResult } from "next";
import { useRouter } from "next/compat/router";
import { useContext, useEffect } from "react";

import { ReactElement } from "react";

const LoginEmailCheckPage = (): ReactElement => {
  const { state: authState, dispatch } = useContext(AuthContext);

  const router = useRouter();

  useMountEffect(() => {
    getActiveUser()
      .then((activeUser) => {
        dispatch({
          type: "LOGIN",
          activeUser: activeUser,
        });
      })
      .catch(() => (): void => {});
  });

  useEffect(() => {
    if (authState.isAuthenticated === IsAuthenticated.TRUE && authState.activeUser) {
      router && router.push(ROUTES.dashboard);
    }
  }, [authState.isAuthenticated, authState.activeUser, router]);

  return (
    <PageSkeleton showNavBar isLoginPage>
      <main className="grid-container-widescreen padding-y-4 email-check-main" id="main">
        <LoginEmailCheck />
      </main>
    </PageSkeleton>
  );
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default LoginEmailCheckPage;
