import { Dispatch, Reducer } from "react";

export type UserActionType = "LOGIN" | "LOGOUT" | "LOGIN_GUEST";

export enum IsAuthenticated {
  TRUE = "TRUE",
  FALSE = "FALSE",
  UNKNOWN = "UNKNOWN",
}

export interface ActiveUser {
  id: string;
  email: string;
  encounteredMyNjLinkingError?: boolean | undefined;
}

export interface AuthState {
  activeUser: ActiveUser | undefined;
  isAuthenticated: IsAuthenticated;
}

export interface AuthAction {
  type: UserActionType;
  activeUser: ActiveUser | undefined;
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
        activeUser: action.activeUser,
        isAuthenticated: IsAuthenticated.TRUE,
      };
    case "LOGIN_GUEST":
      return {
        activeUser: action.activeUser,
        isAuthenticated: IsAuthenticated.FALSE,
      };
    case "LOGOUT":
      return {
        activeUser: undefined,
        isAuthenticated: IsAuthenticated.FALSE,
      };
  }
};
