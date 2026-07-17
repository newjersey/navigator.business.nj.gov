import { UpdateQueue } from "@/lib/UpdateQueue";
import { UserDataError } from "@businessnjgovnavigator/shared/types";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import { createContext } from "react";

export interface UseUserDataResponse {
  userData: UserData | undefined;
  business: Business | undefined;
  isLoading: boolean;
  hasCompletedFetch: boolean;
  error: UserDataError | undefined;
  refresh: () => Promise<void>;
  updateQueue: UpdateQueue | undefined;
  createUpdateQueue: (userData: UserData) => Promise<UpdateQueue>;
  clearUserData: () => Promise<void>;
  clearUserDataError: () => void;
}

export const UserDataContext = createContext<UseUserDataResponse | undefined>(undefined);

UserDataContext.displayName = "User Data";
