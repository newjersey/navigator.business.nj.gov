import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/businessUser";
import { createContext } from "react";

export interface AuthAlertContextType {
  isAuthenticated: IsAuthenticated;
  registrationAlertStatus: RegistrationStatus | undefined;
  registrationAlertIsVisible: boolean;
  registrationModalIsVisible: boolean;
  setRegistrationAlertStatus: (value: RegistrationStatus | undefined) => void;
  setRegistrationAlertIsVisible: (value: boolean) => void;
  setRegistrationModalIsVisible: (value: boolean) => void;
}

export const AuthAlertContext = createContext<AuthAlertContextType>({
  isAuthenticated: IsAuthenticated.UNKNOWN,
  registrationAlertStatus: undefined,
  registrationAlertIsVisible: false,
  setRegistrationAlertStatus: () => {},
  setRegistrationAlertIsVisible: () => {},
  registrationModalIsVisible: false,
  setRegistrationModalIsVisible: () => {},
});
