import type { RegistrationStatus } from "@businessnjgovnavigator/shared/businessUser";
import { createContext } from "react";
import { IsAuthenticated } from "@/lib/auth/AuthContext";

export interface NeedsAccountContextType {
  isAuthenticated: IsAuthenticated;
  registrationStatus: RegistrationStatus | undefined;
  showNeedsAccountSnackbar: boolean;
  showNeedsAccountModal: boolean;

  setRegistrationStatus: (value: RegistrationStatus | undefined) => void;
  setShowNeedsAccountSnackbar: (value: boolean) => void;
  setShowNeedsAccountModal: (value: boolean) => void;
}

export const NeedsAccountContext = createContext<NeedsAccountContextType>({
  isAuthenticated: IsAuthenticated.UNKNOWN,
  registrationStatus: undefined,
  showNeedsAccountSnackbar: false,
  setRegistrationStatus: () => {},
  setShowNeedsAccountSnackbar: () => {},
  showNeedsAccountModal: false,
  setShowNeedsAccountModal: () => {},
});
