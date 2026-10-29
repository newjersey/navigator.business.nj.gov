import { maskingCharacter } from "@businessnjgovnavigator/shared";
import type { ShowHideStatus } from "@/components/ShowHideToggleButton";

export const isEncrypted = (
  maskedValue: string | undefined,
  encryptedValue: string | undefined,
): boolean | undefined => {
  if (maskedValue === undefined || !encryptedValue) {
    return;
  }
  return maskedValue.includes(maskingCharacter);
};

export const getInitialShowHideStatus = (maskedValue: string | undefined): ShowHideStatus => {
  return maskedValue?.includes(maskingCharacter) ? "password-view" : "text-view";
};
