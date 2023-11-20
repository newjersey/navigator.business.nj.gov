import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  useSmall?: boolean;
}

export const NavigatorLogo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <Link href={ROUTES.dashboard} passHref>
      <a href={ROUTES.dashboard}>
        <img
          className={props.useSmall ? "height-3" : "height-4"}
          src="/img/Navigator-logo@2x.png"
          alt={Config.pagesMetadata.titlePrefix}
        />
      </a>
    </Link>
  );
};
