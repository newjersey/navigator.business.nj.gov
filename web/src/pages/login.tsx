import { LoginEmailCheck } from "@/components/LoginEmailCheck";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { getActiveUser } from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useMountEffect } from "@/lib/utils/helpers";
import { type GetStaticPropsResult } from "next";
import { useRouter } from "next/compat/router";

import { ReactElement } from "react";

const LoginEmailCheckPage = (): ReactElement => {
  const router = useRouter();

  useMountEffect(() => {
    getActiveUser()
      .then(() => {
        router && router.push(ROUTES.dashboard);
      })
      .catch(() => {});
  });
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
