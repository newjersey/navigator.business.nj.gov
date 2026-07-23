import Image from "next/image";

export interface MobileAccountDrawerContentProps {
  readonly getStartedLabel: string;
  readonly logInLabel: string;
  readonly accountAppUrl: string;
}

export const MobileAccountDrawerContent = ({
  getStartedLabel,
  logInLabel,
  accountAppUrl,
}: MobileAccountDrawerContentProps) => {
  return (
    <ul className="usa-mobile-nav-drawer__nav">
      <li className="usa-mobile-nav-drawer__nav-item">
        <a className="usa-mobile-nav-drawer__auth-link" href={accountAppUrl}>
          <span className="usa-mobile-nav-drawer__auth-icon">
            <Image
              alt=""
              aria-hidden="true"
              height={22}
              src="/img/play-with-circle.svg"
              unoptimized
              width={22}
            />
          </span>
          {getStartedLabel}
        </a>
      </li>
      <li className="usa-mobile-nav-drawer__nav-item">
        <a className="usa-mobile-nav-drawer__auth-link" href={`${accountAppUrl}/login`}>
          <span className="usa-mobile-nav-drawer__auth-icon">
            <Image
              alt=""
              aria-hidden="true"
              height={22}
              src="/img/login.svg"
              unoptimized
              width={22}
            />
          </span>
          {logInLabel}
        </a>
      </li>
    </ul>
  );
};
