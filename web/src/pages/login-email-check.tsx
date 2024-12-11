import { LoginEmailCheck } from "@/components/LoginEmailCheck";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { ReactElement } from "react";

const LoginEmailCheckPage = (): ReactElement => {
  return (
    <PageSkeleton showNavBar>
      <main className="usa-section email-check-main" id="main">
        <LoginEmailCheck />
      </main>
    </PageSkeleton>
  );
};

export default LoginEmailCheckPage;
