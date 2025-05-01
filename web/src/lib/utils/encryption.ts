import { ShowHideStatus } from "@/components/ShowHideToggleButton";
import { maskingCharacter } from "@businessnjgovnavigator/shared";

export const isEncrypted = (
  maskedValue: string | undefined,
  encryptedValue: string | undefined,
): boolean | undefined => {
  if (maskedValue === undefined || !encryptedValue) {
    return;
  }
  return maskedValue.includes(maskingCharacter);
};

export const getInitialShowHideStatus = (isEncrypted: boolean | undefined): ShowHideStatus => {
  return isEncrypted ? "password-view" : "text-view";
};
