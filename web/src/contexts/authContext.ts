import { createContext } from "react";
import { type AuthContextType, IsAuthenticated } from "@/lib/auth/AuthContext";

export const initialState = {
  activeUser: undefined,
  isAuthenticated: IsAuthenticated.UNKNOWN,
};

export const AuthContext = createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState,
});
