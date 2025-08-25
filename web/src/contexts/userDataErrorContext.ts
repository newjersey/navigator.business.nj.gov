import { UserDataError } from "@businessnjgovnavigator/shared/types";
import { createContext } from "react";

export interface UserDataErrorContextType {
  userDataError: UserDataError | undefined;
  setUserDataError: (userDataError: UserDataError | undefined) => void;
}

export const UserDataErrorContext = createContext<UserDataErrorContextType>({
  userDataError: undefined,
  setUserDataError: () => {},
});
