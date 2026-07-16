import { UserDataContext, UseUserDataResponse } from "@/contexts/userDataContext";
import { useContext } from "react";

export const useUserData = (): UseUserDataResponse => {
  const userData = useContext(UserDataContext);
  if (!userData) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return userData;
};

export type { UseUserDataResponse } from "@/contexts/userDataContext";
