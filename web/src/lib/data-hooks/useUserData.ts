import { AuthContext } from "@/contexts/authContext";
import { IntercomContext } from "@/contexts/intercomContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import * as api from "@/lib/api-client/apiClient";
import { postUserData } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { UpdateQueue, UserDataError } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { UserData } from "@businessnjgovnavigator/shared/";
import { useContext, useEffect } from "react";
import useSWR from "swr";

export const useUserData = (): UseUserDataResponse => {
  const { state, dispatch } = useContext(AuthContext);
  const { updateQueue, setUpdateQueue } = useContext(UpdateQueueContext);
  const { userDataError, setUserDataError } = useContext(UserDataErrorContext);
  const { setRoadmap } = useContext(RoadmapContext);
  const { data, error, mutate } = useSWR<UserData | undefined>(state.user?.id || null, api.getUserData, {
    isPaused: () => {
      return state.isAuthenticated !== IsAuthenticated.TRUE;
    },
  });
  const dataExists = !!data;
  const { setOperatingPhaseId, setLegalStructureId, setIndustryId, setBusinessPersona } =
    useContext(IntercomContext);

  useEffect(() => {
    setOperatingPhaseId(data?.profileData.operatingPhase);
    setLegalStructureId(data?.profileData.legalStructureId);
    setIndustryId(data?.profileData.industryId);
    setBusinessPersona(data?.profileData.businessPersona);
  }, [
    setOperatingPhaseId,
    data?.profileData.operatingPhase,
    setLegalStructureId,
    data?.profileData.legalStructureId,
    setIndustryId,
    data?.profileData.industryId,
    setBusinessPersona,
    data?.profileData.businessPersona,
  ]);

  useEffect(() => {
    if (updateQueue === undefined && data) {
      setUpdateQueue(new UpdateQueueFactory(data, update));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data || !state.user || state.isAuthenticated !== IsAuthenticated.TRUE) {
      return;
    }
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
    if (error && dataExists && state.isAuthenticated === IsAuthenticated.TRUE) {
      setUserDataError("CACHED_ONLY");
    } else if (error && !dataExists) {
      setUserDataError("NO_DATA");
    } else if (!error && userDataError !== "UPDATE_FAILED") {
      setUserDataError(undefined);
    }
  }, [userDataError, dataExists, error, setUserDataError, state.isAuthenticated]);

  const profileDataHasChanged = (oldUserData: UserData | undefined, newUserData: UserData): boolean => {
    return JSON.stringify(oldUserData?.profileData) !== JSON.stringify(newUserData.profileData);
  };

  const onProfileDataChange = async (newUserData: UserData): Promise<void> => {
    setAnalyticsDimensions(newUserData.profileData);
    const newRoadmap = await buildUserRoadmap(newUserData.profileData);
    setRoadmap(newRoadmap);
  };

  const update = async (newUserData: UserData | undefined, config?: { local?: boolean }): Promise<void> => {
    if (newUserData) {
      mutate(newUserData, false);
      setUpdateQueue(new UpdateQueueFactory(newUserData, update));
      if (config?.local || state.isAuthenticated !== IsAuthenticated.TRUE) {
        if (profileDataHasChanged(data, newUserData)) {
          onProfileDataChange(newUserData);
        }
        return;
      }
      return postUserData(newUserData)
        .then((response: UserData) => {
          if (profileDataHasChanged(data, newUserData)) {
            onProfileDataChange(newUserData);
          }

          setUserDataError(undefined);
          mutate(response, false);
          setUpdateQueue(new UpdateQueueFactory(response, update));
        })
        .catch(() => {
          setUserDataError("UPDATE_FAILED");
          throw undefined;
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
    updateQueue: updateQueue,
  };
};

export type UseUserDataResponse = {
  userData: UserData | undefined;
  isLoading: boolean;
  error: UserDataError | undefined;
  update: (newUserData: UserData | undefined, config?: { local?: boolean }) => Promise<void>;
  refresh: () => Promise<void>;
  updateQueue: UpdateQueue | undefined;
};
