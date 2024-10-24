import { AuthContext } from "@/contexts/authContext";
import { IntercomContext } from "@/contexts/intercomContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import * as api from "@/lib/api-client/apiClient";
import { postUserData } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { isLicenseDataFromDatabaseDataMoreRecent } from "@/lib/domain-logic/isLicenseDataFromDatabaseDataMoreRecent";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { UpdateQueue, UserDataError } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { licenseDataModifyingFunction } from "@/lib/utils/licenseStatus";
import { modifyCurrentBusiness, UserData } from "@businessnjgovnavigator/shared/";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { useContext, useEffect, useRef } from "react";
import useSWR from "swr";

const NOT_YET_FETCHED = "NOT_YET_FETCHED";

export const useUserData = (): UseUserDataResponse => {
  const { state } = useContext(AuthContext);
  const { updateQueue, setUpdateQueue } = useContext(UpdateQueueContext);
  const { userDataError, setUserDataError } = useContext(UserDataErrorContext);
  const { setRoadmap } = useContext(RoadmapContext);
  const fetchedUserId = useRef<string | undefined>(NOT_YET_FETCHED);
  const { data, error, mutate } = useSWR<UserData | undefined>(
    state.activeUser?.id || null,
    api.getUserData,
    {
      isPaused: () => {
        return state.isAuthenticated !== IsAuthenticated.TRUE;
      },
    }
  );
  const dataExists = !!data;
  const { setOperatingPhaseId, setLegalStructureId, setIndustryId, setBusinessPersona } =
    useContext(IntercomContext);

  useEffect(() => {
    const profileData = data?.businesses[data?.currentBusinessId].profileData;
    setOperatingPhaseId(profileData?.operatingPhase);
    setLegalStructureId(profileData?.legalStructureId);
    setIndustryId(profileData?.industryId);
    setBusinessPersona(profileData?.businessPersona);
  }, [
    setOperatingPhaseId,
    data?.currentBusinessId,
    setLegalStructureId,
    setIndustryId,
    setBusinessPersona,
    data?.businesses,
  ]);

  useEffect(() => {
    fetchedUserId.current = data?.user.id;

    let licenseDataFromDatabaseDataMoreRecent = false;
    if (data?.businesses[data.currentBusinessId] && updateQueue?.currentBusiness()) {
      licenseDataFromDatabaseDataMoreRecent = isLicenseDataFromDatabaseDataMoreRecent({
        businessFromDb: data?.businesses[data.currentBusinessId],
        businessFromUpdateQueue: updateQueue?.currentBusiness(),
      });
    }

    if (updateQueue === undefined && data) {
      setUpdateQueue(new UpdateQueueFactory(data, update));
    } else if (updateQueue?.current() === undefined && data) {
      updateQueue?.queue(data);
    } else if (licenseDataFromDatabaseDataMoreRecent && updateQueue && data) {
      const mergedData = modifyCurrentBusiness(updateQueue?.current(), licenseDataModifyingFunction(data));
      updateQueue?.queue(mergedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateQueue]);

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
    const oldProfileData = oldUserData?.businesses[oldUserData?.currentBusinessId].profileData;
    const newProfileData = newUserData.businesses[newUserData.currentBusinessId].profileData;

    return JSON.stringify(oldProfileData) !== JSON.stringify(newProfileData);
  };

  const onProfileDataChange = async (newUserData: UserData): Promise<void> => {
    const newProfileData = newUserData.businesses[newUserData.currentBusinessId].profileData;
    setAnalyticsDimensions(newProfileData);
    const newRoadmap = await buildUserRoadmap(newProfileData);
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

  const calculateHasFetched = (): boolean => {
    if (state.isAuthenticated === IsAuthenticated.UNKNOWN) return false;
    if (fetchedUserId.current === NOT_YET_FETCHED) return false;
    if (state.activeUser?.id === undefined) return false;
    if (data && !updateQueue) return false;
    return true;
  };

  return {
    userData: updateQueue?.current(),
    business: updateQueue?.currentBusiness(),
    isLoading: !error && !data,
    hasCompletedFetch: calculateHasFetched(),
    error: userDataError,
    refresh: refresh,
    updateQueue: updateQueue,
    createUpdateQueue: createUpdateQueue,
  };
};

export type UseUserDataResponse = {
  userData: UserData | undefined;
  business: Business | undefined;
  isLoading: boolean;
  hasCompletedFetch: boolean;
  error: UserDataError | undefined;
  refresh: () => Promise<void>;
  updateQueue: UpdateQueue | undefined;
  createUpdateQueue: (userData: UserData) => Promise<UpdateQueue>;
};
