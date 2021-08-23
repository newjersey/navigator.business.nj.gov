import useSWR from "swr";
import { useContext, useEffect } from "react";
import * as api from "@/lib/api-client/apiClient";
import { postUserData } from "@/lib/api-client/apiClient";
import { UserData, UserDataError } from "@/lib/types/types";
import { AuthContext, UserDataErrorContext } from "@/pages/_app";

export const useUserData = (): UseUserDataResponse => {
  const { state } = useContext(AuthContext);
  const { userDataError, setUserDataError } = useContext(UserDataErrorContext);
  const { data, error, mutate } = useSWR<UserData | undefined>(state.user?.id || null, api.getUserData);

  const dataExists = !!data;

  useEffect(() => {
    if (error && dataExists) {
      setUserDataError("CACHED_ONLY");
    } else if (error && !dataExists) {
      setUserDataError("NO_DATA");
    } else if (!error && userDataError !== "UPDATE_FAILED") {
      setUserDataError(undefined);
    }
  }, [userDataError, dataExists, error, setUserDataError]);

  const update = async (newUserData: UserData | undefined): Promise<void> => {
    if (newUserData) {
      mutate(newUserData, false);
      return postUserData(newUserData)
        .then(() => {
          setUserDataError(undefined);
          mutate(newUserData);
        })
        .catch(() => {
          setUserDataError("UPDATE_FAILED");
          return Promise.reject();
        });
    }
  };

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
