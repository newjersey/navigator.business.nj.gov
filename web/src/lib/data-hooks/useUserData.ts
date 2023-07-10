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
import { Business, UserData } from "@businessnjgovnavigator/shared/";
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
  const currentBusiness = data?.businesses[data.currentBusinessID]
  const { setOperatingPhaseId, setLegalStructureId, setIndustryId, setBusinessPersona } =
    useContext(IntercomContext);

  useEffect(() => {
    setOperatingPhaseId(currentBusiness?.profileData.operatingPhase);
    setLegalStructureId(currentBusiness?.profileData.legalStructureId);
    setIndustryId(currentBusiness?.profileData.industryId);
    setBusinessPersona(currentBusiness?.profileData.businessPersona);
  }, [
    setOperatingPhaseId,
    currentBusiness?.profileData.operatingPhase,
    setLegalStructureId,
    currentBusiness?.profileData.legalStructureId,
    setIndustryId,
    currentBusiness?.profileData.industryId,
    setBusinessPersona,
    currentBusiness?.profileData.businessPersona,
    data?.currentBusinessID
  ]);

  useEffect(() => {
    if (updateQueue === undefined && data) {
      setUpdateQueue(new UpdateQueueFactory(data, update));
    } else if (updateQueue?.current() === undefined && data) {
      updateQueue?.queue(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateQueue]);

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
    const oldCurrentBusinessProfileData = oldUserData?.businesses[oldUserData?.currentBusinessID].profileData
    const newCurrentBusinessProfileData = newUserData.businesses[newUserData.currentBusinessID].profileData

    return JSON.stringify(oldCurrentBusinessProfileData) !== JSON.stringify(newCurrentBusinessProfileData);
  };

  const onProfileDataChange = async (newUserData: UserData): Promise<void> => {
    const newCurrentBusinessProfileData = newUserData.businesses[newUserData.currentBusinessID].profileData
    setAnalyticsDimensions(newCurrentBusinessProfileData);
    const newRoadmap = await buildUserRoadmap(newCurrentBusinessProfileData);
    setRoadmap(newRoadmap);
  };

  const update = async (newUserData: UserData | undefined, config?: { local?: boolean }): Promise<void> => {
    if (newUserData) {
      const localUpdateQueue = updateQueue ?? new UpdateQueueFactory(newUserData, update);
      if (!updateQueue) {
        setUpdateQueue(localUpdateQueue);
      }

      await mutate(newUserData, false);
      localUpdateQueue.queue(newUserData);
      if (config?.local || state.isAuthenticated !== IsAuthenticated.TRUE) {
        if (profileDataHasChanged(data, newUserData)) {
          await onProfileDataChange(newUserData);
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
          localUpdateQueue.queue(response);
        })
        .catch(() => {
          setUserDataError("UPDATE_FAILED");
          throw undefined;
        });
    }
  };

  const createUpdateQueue = async (userData: UserData): Promise<UpdateQueue> => {
    const createdQueue = new UpdateQueueFactory(userData, update);
    setUpdateQueue(createdQueue);
    await update(userData, { local: true });
    return createdQueue;
  };

  const refresh = async (): Promise<void> => {
    const updatedUserData = await mutate();
    if (updatedUserData) {
      const localUpdateQueue = updateQueue ?? new UpdateQueueFactory(updatedUserData, update);
      if (!updateQueue) {
        setUpdateQueue(localUpdateQueue);
      }
      localUpdateQueue.queue(updatedUserData);
    }
  };

  return {
    userData: updateQueue?.current(),
    currentBusiness: updateQueue?.current().businesses[updateQueue?.current().currentBusinessID],
    isLoading: !error && !data,
    error: userDataError,
    refresh: refresh,
    updateQueue: updateQueue,
    createUpdateQueue: createUpdateQueue,
  };
};

export type UseUserDataResponse = {
  userData: UserData | undefined;
  currentBusiness: Business | undefined;
  isLoading: boolean;
  error: UserDataError | undefined;
  refresh: () => Promise<void>;
  updateQueue: UpdateQueue | undefined;
  createUpdateQueue: (userData: UserData) => Promise<UpdateQueue>;
};
