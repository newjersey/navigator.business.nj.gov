import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import Link from "next/link";
import { ReactElement, useMemo } from "react";

export const NavigatorLogo = (): ReactElement => {
  const { userData } = useUserData();
  const redirectUrl = useMemo(
    () => routeForPersona(userData?.profileData.businessPersona),
    [userData?.profileData.businessPersona]
  );

  return (
    <Link href={redirectUrl} passHref>
      <a href={redirectUrl}>
        <img className="height-4" src="/img/Navigator-logo@2x.png" alt="Business.NJ.Gov Navigator" />
      </a>
    </Link>
  );
};
