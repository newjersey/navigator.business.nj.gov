import type { GetStaticPropsResult } from "next";
import type { ReactElement } from "react";
import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { triggerProfileNJSignIn } from "@/lib/auth/sessionHelper";
import { useMountEffect } from "@/lib/utils/helpers";

// Starts a ProfileNJ login immediately. This is also the page ProfileNJ's
// `initiate_login_uri` points to, so it must not render anything to click.
const LoginProfileNJPage = (): ReactElement => {
  useMountEffect(() => {
    triggerProfileNJSignIn().catch((error: unknown) => {
      console.error("Failed to start ProfileNJ sign-in", error);
    });
  });

  return <LoadingPageComponent />;
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  if (process.env.FEATURE_PROFILE_NJ_LOGIN !== "true") {
    return { notFound: true };
  }
  return { props: { noAuth: true } };
}

export default LoginProfileNJPage;
