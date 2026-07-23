import { UserDataContext, UseUserDataResponse } from "@/contexts/userDataContext";
import { UpdateQueue, UpdateQueueFactory } from "@/lib/UpdateQueue";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { render, RenderResult } from "@testing-library/react";
import { ReactElement } from "react";

const createDefaultUserDataContext = (): UseUserDataResponse => {
  return {
    userData: undefined,
    business: undefined,
    isLoading: true,
    hasCompletedFetch: false,
    error: undefined,
    refresh: async (): Promise<void> => {},
    updateQueue: undefined,
    createUpdateQueue: async (userData: UserData): Promise<UpdateQueue> => {
      return new UpdateQueueFactory(userData, async (): Promise<void> => {});
    },
    clearUserData: async (): Promise<void> => {},
    clearUserDataError: (): void => {},
  };
};

export const renderWithUserData = (
  subject: ReactElement,
  value: UseUserDataResponse = createDefaultUserDataContext(),
): RenderResult => {
  return render(<UserDataContext.Provider value={value}>{subject}</UserDataContext.Provider>);
};
