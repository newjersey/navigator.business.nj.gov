import useSWR from "swr";
import * as api from "../api-client/apiClient";
import { UserData } from "../types/types";
import { useContext } from "react";
import { AuthContext } from "../../pages/_app";
import { postUserData } from "../api-client/apiClient";

export const useUserData = (): UseUserDataResponse => {
  const { state } = useContext(AuthContext);
  const { data, error, mutate } = useSWR<UserData>(state.user?.id || null, api.getUserData);

  const update = async (newUserData: UserData): Promise<void> => {
    mutate(newUserData, false);
    await postUserData(newUserData);
    mutate(newUserData);
  };

  return {
    userData: data as UserData,
    isLoading: !error && !data,
    isError: error,
    update: update,
  };
};

export type UseUserDataResponse = {
  userData: UserData;
  isLoading: boolean;
  isError: boolean;
  update: (newUserData: UserData) => Promise<void>;
};
