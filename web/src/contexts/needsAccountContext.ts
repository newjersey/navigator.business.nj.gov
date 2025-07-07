import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/businessUser";
import { createContext } from "react";

export interface NeedsAccountContextType {
  isAuthenticated: IsAuthenticated;
  registrationStatus: RegistrationStatus | undefined;
  showNeedsAccountSnackbar: boolean;
  showNeedsAccountModal: boolean;

  showContinueWithoutSaving: boolean;
  setShowContinueWithoutSaving: (value: boolean) => void;

  userWantsToContinueWithoutSaving: boolean;
  setUserWantsToContinueWithoutSaving: (value: boolean) => void;

  setRegistrationStatus: (value: RegistrationStatus | undefined) => void;
  setShowNeedsAccountSnackbar: (value: boolean) => void;
  setShowNeedsAccountModal: (value: boolean) => void;
}

export const NeedsAccountContext = createContext<NeedsAccountContextType>({
  isAuthenticated: IsAuthenticated.UNKNOWN,
  registrationStatus: undefined,
  showNeedsAccountSnackbar: false,
  showContinueWithoutSaving: false,
  setShowContinueWithoutSaving: () => {},
  userWantsToContinueWithoutSaving: false,
  setUserWantsToContinueWithoutSaving: () => {},
  setRegistrationStatus: () => {},
  setShowNeedsAccountSnackbar: () => {},
  showNeedsAccountModal: false,
  setShowNeedsAccountModal: () => {},
});
