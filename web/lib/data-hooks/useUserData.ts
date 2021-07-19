import useSWR from "swr";
import { useContext } from "react";
import * as api from "@/lib/api-client/apiClient";
import { postUserData } from "@/lib/api-client/apiClient";
import { UserData, UserDataError } from "@/lib/types/types";
import { AuthContext } from "@/pages/_app";

export const useUserData = (): UseUserDataResponse => {
  const { state } = useContext(AuthContext);
  const { data, error, mutate } = useSWR<UserData | undefined>(state.user?.id || null, api.getUserData);

  const update = async (newUserData: UserData | undefined): Promise<void> => {
    if (newUserData) {
      mutate(newUserData, false);
      await postUserData(newUserData);
      mutate(newUserData);
    }
  };

  let userDataError: UserDataError | undefined = undefined;
  if (error && data) {
    userDataError = "CACHED_ONLY";
  } else if (error && !data) {
    userDataError = "NO_DATA";
  }

  return {
    userData: data as UserData,
    isLoading: !error && !data,
    error: userDataError,
    update: update,
  };
};

export type UseUserDataResponse = {
  userData: UserData | undefined;
  isLoading: boolean;
  error: UserDataError | undefined;
  update: (newUserData: UserData | undefined) => Promise<void>;
};
