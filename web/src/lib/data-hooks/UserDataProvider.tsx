import { AuthContext } from "@/contexts/authContext";
import { IntercomContext } from "@/contexts/intercomContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataContext } from "@/contexts/userDataContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { isLicenseDataFromDatabaseDataMoreRecent } from "@/lib/domain-logic/isLicenseDataFromDatabaseDataMoreRecent";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { UserDataStorage, UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { UpdateQueue, UpdateQueueFactory } from "@/lib/UpdateQueue";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { licenseDataModifyingFunction } from "@/lib/utils/licenseStatus";
import { modifyCurrentBusiness, UserData } from "@businessnjgovnavigator/shared/";
import {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";

interface UserDataProviderProps {
  readonly children: ReactNode;
  readonly userDataStorage?: UserDataStorage;
}

const profileDataHasChanged = (
  oldUserData: UserData | undefined,
  newUserData: UserData,
): boolean => {
  const oldProfileData = oldUserData?.businesses[oldUserData.currentBusinessId].profileData;
  const newProfileData = newUserData.businesses[newUserData.currentBusinessId].profileData;

  return JSON.stringify(oldProfileData) !== JSON.stringify(newProfileData);
};

export const UserDataProvider = ({
  children,
  userDataStorage: injectedUserDataStorage,
}: UserDataProviderProps): ReactElement => {
  const { state } = useContext(AuthContext);
  const { updateQueue, setUpdateQueue } = useContext(UpdateQueueContext);
  const { userDataError, setUserDataError } = useContext(UserDataErrorContext);
  const { setRoadmap } = useContext(RoadmapContext);
  const { setOperatingPhaseId, setLegalStructureId, setIndustryId, setBusinessPersona } =
    useContext(IntercomContext);
  const [defaultUserDataStorage] = useState(() => UserDataStorageFactory());
  const userDataStorage = injectedUserDataStorage ?? defaultUserDataStorage;
  const activeUserId = state.activeUser?.id;
  const [localUserId, setLocalUserId] = useState<string>();
  const ownerUserId = activeUserId ?? localUserId;
  const persistedUserData = useMemo(() => {
    return activeUserId ? userDataStorage.get(activeUserId) : undefined;
  }, [activeUserId, userDataStorage]);
  const [completedFetchUserId, setCompletedFetchUserId] = useState<string>();
  const previousActiveUserId = useRef(activeUserId);
  const activeUserIdRef = useRef(activeUserId);
  const ownerUserIdRef = useRef(ownerUserId);
  const authenticationRef = useRef(state.isAuthenticated);

  activeUserIdRef.current = activeUserId;
  ownerUserIdRef.current = ownerUserId;
  authenticationRef.current = state.isAuthenticated;

  const { data, error, mutate } = useSWR<UserData | undefined>(
    activeUserId || null,
    api.getUserData,
    {
      fallbackData: persistedUserData,
      revalidateOnMount: state.isAuthenticated === IsAuthenticated.TRUE,
      isPaused: () => {
        return state.isAuthenticated !== IsAuthenticated.TRUE;
      },
      onSuccess: (userData, requestUserId) => {
        if (activeUserIdRef.current !== requestUserId) {
          return;
        }
        setCompletedFetchUserId(requestUserId);
        if (userData?.user.id === requestUserId) {
          userDataStorage.set(requestUserId, userData);
        }
      },
      onError: (_error, requestUserId) => {
        if (activeUserIdRef.current === requestUserId) {
          setCompletedFetchUserId(requestUserId);
        }
      },
    },
  );

  const activeData = data?.user.id === ownerUserId ? data : undefined;
  const activeUpdateQueue =
    updateQueue?.current().user.id === ownerUserId ? updateQueue : undefined;
  const dataRef = useRef(activeData);
  const updateQueueRef = useRef(activeUpdateQueue);

  dataRef.current = activeData;
  updateQueueRef.current = activeUpdateQueue;

  const onProfileDataChange = useCallback(
    async (newUserData: UserData): Promise<void> => {
      const newProfileData = newUserData.businesses[newUserData.currentBusinessId].profileData;
      const roadmapTaskData = newUserData.businesses[newUserData.currentBusinessId].roadmapTaskData;
      setAnalyticsDimensions(newUserData);
      const newRoadmap = await buildUserRoadmap(
        newProfileData,
        roadmapTaskData,
        newUserData.user.abExperience || "ExperienceA",
      );
      if (ownerUserIdRef.current === newUserData.user.id) {
        setRoadmap(newRoadmap);
      }
    },
    [setRoadmap],
  );

  const update = useCallback(
    async (newUserData: UserData | undefined, config?: { local?: boolean }): Promise<void> => {
      if (!newUserData) {
        return;
      }

      const updateUserId = newUserData.user.id;
      if (ownerUserIdRef.current !== updateUserId) {
        return;
      }
      const shouldSaveRemotely =
        !config?.local && authenticationRef.current === IsAuthenticated.TRUE;
      let localUpdateQueue = updateQueueRef.current;
      if (!localUpdateQueue || localUpdateQueue.current().user.id !== updateUserId) {
        localUpdateQueue = new UpdateQueueFactory(newUserData, update);
        updateQueueRef.current = localUpdateQueue;
        setUpdateQueue(localUpdateQueue);
      }

      const hasProfileDataChanged = profileDataHasChanged(dataRef.current, newUserData);
      await mutate(newUserData, false);
      userDataStorage.set(newUserData.user.id, newUserData);
      localUpdateQueue.queue(newUserData);

      if (!shouldSaveRemotely) {
        if (hasProfileDataChanged && ownerUserIdRef.current === updateUserId) {
          await onProfileDataChange(newUserData);
        }
        return;
      }

      let response: UserData;
      try {
        response = await api.postUserData(newUserData);
        if (response.user.id !== updateUserId) {
          throw new Error("User data save returned a different user");
        }
      } catch (error) {
        if (ownerUserIdRef.current === updateUserId) {
          setUserDataError("UPDATE_FAILED");
        }
        throw error;
      }

      if (ownerUserIdRef.current !== updateUserId) {
        return;
      }
      setUserDataError(undefined);
      await mutate(response, false);
      userDataStorage.set(response.user.id, response);
      localUpdateQueue.queue(response);

      if (hasProfileDataChanged && ownerUserIdRef.current === updateUserId) {
        try {
          await onProfileDataChange(newUserData);
        } catch (error) {
          console.error("Failed to synchronize profile-derived state after user data save", error);
        }
      }
    },
    [mutate, onProfileDataChange, setUpdateQueue, setUserDataError, userDataStorage],
  );

  useEffect(() => {
    if (previousActiveUserId.current === activeUserId) {
      return;
    }

    previousActiveUserId.current = activeUserId;
    setCompletedFetchUserId(undefined);
    ownerUserIdRef.current = activeUserId;
    setLocalUserId(undefined);
    updateQueueRef.current = undefined;
    setUpdateQueue(undefined);
    setUserDataError(undefined);
  }, [activeUserId, setUpdateQueue, setUserDataError]);

  useEffect(() => {
    const profileData = activeData?.businesses[activeData.currentBusinessId].profileData;
    setOperatingPhaseId(profileData?.operatingPhase);
    setLegalStructureId(profileData?.legalStructureId);
    setIndustryId(profileData?.industryId);
    setBusinessPersona(profileData?.businessPersona);
  }, [activeData, setBusinessPersona, setIndustryId, setLegalStructureId, setOperatingPhaseId]);

  useEffect(() => {
    let localUpdateQueue = updateQueueRef.current;
    const currentBusinessId = localUpdateQueue?.current().currentBusinessId;
    const hasNewerLicenseData =
      currentBusinessId &&
      activeData?.businesses[currentBusinessId] &&
      localUpdateQueue?.currentBusiness()
        ? isLicenseDataFromDatabaseDataMoreRecent({
            businessFromDb: activeData.businesses[currentBusinessId],
            businessFromUpdateQueue: localUpdateQueue.currentBusiness(),
          })
        : false;

    if (!localUpdateQueue && activeData) {
      localUpdateQueue = new UpdateQueueFactory(activeData, update);
      updateQueueRef.current = localUpdateQueue;
      setUpdateQueue(localUpdateQueue);
    } else if (currentBusinessId && hasNewerLicenseData && localUpdateQueue && activeData) {
      const mergedData = modifyCurrentBusiness(
        localUpdateQueue.current(),
        licenseDataModifyingFunction(activeData, currentBusinessId),
      );
      localUpdateQueue.queue(mergedData);
    }
  }, [activeData, setUpdateQueue, update]);

  useEffect(() => {
    if (error && activeData && state.isAuthenticated === IsAuthenticated.TRUE) {
      setUserDataError("CACHED_ONLY");
    } else if (error && !activeData) {
      setUserDataError("NO_DATA");
    } else if (!error && userDataError !== "UPDATE_FAILED") {
      setUserDataError(undefined);
    }
  }, [activeData, error, setUserDataError, state.isAuthenticated, userDataError]);

  const createUpdateQueue = useCallback(
    async (userData: UserData): Promise<UpdateQueue> => {
      const userId = userData.user.id;
      const currentOwnerUserId = ownerUserIdRef.current;
      if (currentOwnerUserId && currentOwnerUserId !== userId) {
        throw new Error("Cannot create an update queue for a different user");
      }
      if (!activeUserIdRef.current) {
        ownerUserIdRef.current = userId;
        setLocalUserId(userId);
      }
      const createdQueue = new UpdateQueueFactory(userData, update);
      updateQueueRef.current = createdQueue;
      setUpdateQueue(createdQueue);
      await update(userData, { local: true });
      return createdQueue;
    },
    [setUpdateQueue, update],
  );

  const refresh = useCallback(async (): Promise<void> => {
    const refreshUserId = activeUserId;
    const updatedUserData = await mutate();
    if (
      !refreshUserId ||
      activeUserIdRef.current !== refreshUserId ||
      !updatedUserData ||
      updatedUserData.user.id !== refreshUserId
    ) {
      return;
    }

    userDataStorage.set(updatedUserData.user.id, updatedUserData);
    let localUpdateQueue = updateQueueRef.current;
    if (localUpdateQueue && localUpdateQueue.current().user.id !== refreshUserId) {
      return;
    }
    if (!localUpdateQueue) {
      localUpdateQueue = new UpdateQueueFactory(updatedUserData, update);
      updateQueueRef.current = localUpdateQueue;
      setUpdateQueue(localUpdateQueue);
    }
    localUpdateQueue.queue(updatedUserData);
  }, [activeUserId, mutate, setUpdateQueue, update, userDataStorage]);

  const hasCompletedFetch = ((): boolean => {
    if (!activeUserId && localUserId) return activeUpdateQueue !== undefined;
    if (state.isAuthenticated === IsAuthenticated.UNKNOWN) return false;
    if (activeUserId === undefined) return false;
    if (state.isAuthenticated === IsAuthenticated.FALSE) {
      return !activeData || activeUpdateQueue !== undefined;
    }
    if (completedFetchUserId !== activeUserId) return false;
    if (activeData && !activeUpdateQueue) return false;
    return true;
  })();

  return (
    <UserDataContext.Provider
      value={{
        userData: activeUpdateQueue?.current(),
        business: activeUpdateQueue?.currentBusiness(),
        isLoading: !error && !activeData && !activeUpdateQueue,
        hasCompletedFetch,
        error: userDataError,
        refresh,
        updateQueue: activeUpdateQueue,
        createUpdateQueue,
        clearUserDataError: () => setUserDataError(undefined),
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
