import { Dispatch, Reducer } from "react";
import { BusinessUser } from "../types/BusinessUser";

export type UserActionType = "LOGIN" | "LOGOUT";

export interface AuthState {
  user: BusinessUser | undefined;
  isAuthenticated: boolean;
}

export interface AuthAction {
  type: UserActionType;
  user: BusinessUser | undefined;
}

export interface AuthContextType {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
}

export type AuthReducer = Reducer<AuthState, AuthAction>;

export const authReducer: AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.user,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return {
        user: undefined,
        isAuthenticated: false,
      };
  }
};
