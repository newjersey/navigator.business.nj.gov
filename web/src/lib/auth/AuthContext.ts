import { BusinessUser } from "@businessnjgovnavigator/shared/";
import { Dispatch, Reducer } from "react";

export type UserActionType = "LOGIN" | "LOGOUT" | "UPDATE_USER" | "LOGIN_GUEST" | "UPDATE_GUEST";

export enum IsAuthenticated {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNKNOWN = "UNKNOWN",
}

export interface AuthState {
  user: BusinessUser | undefined;
  isAuthenticated: IsAuthenticated;
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
        isAuthenticated: IsAuthenticated.TRUE,
      };
    case "LOGIN_GUEST":
      return {
        user: action.user,
        isAuthenticated: IsAuthenticated.FALSE,
      };
    case "UPDATE_GUEST":
      return {
        user: action.user,
        isAuthenticated: IsAuthenticated.FALSE,
      };
    case "LOGOUT":
      return {
        user: undefined,
        isAuthenticated: IsAuthenticated.FALSE,
      };
    case "UPDATE_USER":
      return {
        user: action.user,
        isAuthenticated: IsAuthenticated.TRUE,
      };
  }
};
