"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";

export interface HeaderAuthButtonsProps {
  readonly logInLabel: string;
  readonly myAccountLabel: string;
  readonly getStartedLabel: string;
  readonly accountIconAlt: string;
  readonly dropdownArrowAlt: string;
  readonly accountAppUrl: string;
}

export const HeaderAuthButtons = ({
  logInLabel,
  myAccountLabel,
  getStartedLabel,
  accountIconAlt,
  dropdownArrowAlt,
  accountAppUrl,
}: HeaderAuthButtonsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  return (
    <div className="usa-nav__auth-buttons">
      <a className="usa-nav__auth-login" href={`${accountAppUrl}/login`}>
        {logInLabel}
      </a>
      <div className="usa-nav__auth-account" ref={accountRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="usa-nav__auth-account-button"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          <Icon className="usa-icon--size-4" iconName="account_circle" label={accountIconAlt} />
          <span>{myAccountLabel}</span>
          <Icon iconName="arrow_drop_down" label={dropdownArrowAlt} />
        </button>
        {isOpen && (
          <ul className="usa-nav__auth-dropdown">
            <li>
              <a href={accountAppUrl}>{getStartedLabel}</a>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
