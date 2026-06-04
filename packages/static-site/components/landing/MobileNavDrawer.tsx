"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";

export interface MobileNavDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly closeAriaLabel: string;
  readonly children: React.ReactNode;
}

export const MobileNavDrawer = ({
  isOpen,
  onClose,
  title,
  closeAriaLabel,
  children,
}: MobileNavDrawerProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <>
      <div
        aria-hidden="true"
        className={`usa-mobile-nav-overlay${isOpen ? " usa-mobile-nav-overlay--visible" : ""}`}
        onClick={onClose}
      />
      <div
        aria-label={title}
        aria-modal="true"
        className={`usa-mobile-nav-drawer${isOpen ? " usa-mobile-nav-drawer--open" : ""}`}
        role="dialog"
      >
        <div className="usa-mobile-nav-drawer__header">
          <span className="usa-mobile-nav-drawer__title">{title}</span>
          <button
            aria-label={closeAriaLabel}
            className="usa-mobile-nav-drawer__close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <Icon iconName="close" label={closeAriaLabel} />
          </button>
        </div>
        <div className="usa-mobile-nav-drawer__body">{children}</div>
      </div>
    </>
  );
};
