import { AuthContextType, IsAuthenticated } from "@/lib/auth/AuthContext";
import { createContext } from "react";

export const initialState = {
  user: undefined,
  isAuthenticated: IsAuthenticated.UNKNOWN
};

export const AuthContext = createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState
});
