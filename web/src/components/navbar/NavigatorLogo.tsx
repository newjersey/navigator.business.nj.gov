import { ROUTES } from "@/lib/domain-logic/routes";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  useSmall?: boolean;
}

export const NavigatorLogo = (props: Props): ReactElement => {
  return (
    <Link href={ROUTES.dashboard} passHref>
      <a href={ROUTES.dashboard}>
        <img
          className={props.useSmall ? "height-3" : "height-4"}
          src="/img/Navigator-logo@2x.png"
          alt="Business.NJ.Gov Navigator"
        />
      </a>
    </Link>
  );
};
