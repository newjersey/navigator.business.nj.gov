import { UserDataContext, UseUserDataResponse } from "@/contexts/userDataContext";
import { UpdateQueue, UpdateQueueFactory } from "@/lib/UpdateQueue";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useMemo } from "react";

interface CmsUserDataProviderProps {
  readonly children: ReactNode;
}

// Decap mounts previews in its own React root, outside the _app.tsx provider tree.
// Previews needing populated data pass it via CMS_ONLY_fakeBusiness instead.
export const CmsUserDataProvider = ({ children }: CmsUserDataProviderProps): ReactElement => {
  const value = useMemo<UseUserDataResponse>(() => {
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
  }, []);

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};
