import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { KeyboardEvent, useContext } from "react";

/**
 * Locks a text field for guest users so interacting with it opens the Needs Account modal.
 *
 * The modal must not open on focus alone: that is a change of context on focus (WCAG 3.2.1), and
 * MUI's Dialog restores focus to the field it was opened from, which would immediately reopen the
 * modal and trap the user. The field is readOnly rather than disabled so it stays focusable and
 * announces its locked state via aria-readonly.
 */
export const useNeedsAccountLockedField = (): {
  readOnly: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
} => {
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const isLocked = isAuthenticated !== IsAuthenticated.TRUE;

  const openModalWhenLocked = (): void => {
    if (isLocked) {
      setShowNeedsAccountModal(true);
    }
  };

  // We want to handle the case where users who navigate via keyboard never click the field,
  // and open the modal when they try to type into the field.
  const openModalWhenEnteringValue = (event: KeyboardEvent<HTMLInputElement>): void => {
    const isShortcut = event.ctrlKey || event.metaKey || event.altKey;
    const isValueKey = event.key === "Enter" || event.key.length === 1;
    if (isValueKey && !isShortcut) {
      openModalWhenLocked();
    }
  };

  return {
    readOnly: isLocked,
    onClick: openModalWhenLocked,
    onKeyDown: openModalWhenEnteringValue,
  };
};
