import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/businessUser";
import { createContext } from "react";

export interface AuthAlertContextType {
  isAuthenticated: IsAuthenticated;
  registrationAlertStatus: RegistrationStatus | undefined;
  alertIsVisible: boolean;
  modalIsVisible: boolean;
  setRegistrationAlertStatus: (value: RegistrationStatus | undefined) => void;
  setAlertIsVisible: (value: boolean) => void;
  setModalIsVisible: (value: boolean) => void;
}

export const AuthAlertContext = createContext<AuthAlertContextType>({
  isAuthenticated: IsAuthenticated.UNKNOWN,
  registrationAlertStatus: undefined,
  alertIsVisible: false,
  setRegistrationAlertStatus: () => {},
  setAlertIsVisible: () => {},
  modalIsVisible: false,
  setModalIsVisible: () => {},
});
