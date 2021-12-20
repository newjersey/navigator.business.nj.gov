import * as api from "@/lib/api-client/apiClient";
import { postUserData } from "@/lib/api-client/apiClient";
import { UserDataError } from "@/lib/types/types";
import { AuthContext, UserDataErrorContext } from "@/pages/_app";
import { externalSyncUser, UserData } from "@businessnjgovnavigator/shared/";
import { useContext, useEffect } from "react";
import useSWR from "swr";

export const useUserData = (): UseUserDataResponse => {
  const { state, dispatch } = useContext(AuthContext);
  const { userDataError, setUserDataError } = useContext(UserDataErrorContext);
  const { data, error, mutate } = useSWR<UserData | undefined>(state.user?.id || null, api.getUserData);

  const dataExists = !!data;

  useEffect(() => {
    if (!data || !state.user) return;
    dispatch({
      type: "UPDATE_USER",
      user: {
        ...state.user,
        name: data.user.name,
        myNJUserKey: data.user.myNJUserKey,
        intercomHash: data.user.intercomHash,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataExists]);

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
      mutate({ ...newUserData, user: externalSyncUser(newUserData.user) }, false);
      return postUserData(newUserData)
        .then((response: UserData) => {
          setUserDataError(undefined);
          mutate(response, false);
        })
        .catch(() => {
          setUserDataError("UPDATE_FAILED");
          return Promise.reject();
        });
    }
  };

  const refresh = async (): Promise<void> => {
    await mutate();
  };

  return {
    userData: data as UserData,
    isLoading: !error && !data,
    error: userDataError,
    update: update,
    refresh: refresh,
  };
};

export type UseUserDataResponse = {
  userData: UserData | undefined;
  isLoading: boolean;
  error: UserDataError | undefined;
  update: (newUserData: UserData | undefined) => Promise<void>;
  refresh: () => Promise<void>;
};
