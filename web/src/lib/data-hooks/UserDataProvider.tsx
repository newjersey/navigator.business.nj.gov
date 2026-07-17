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
import { reportUserDataSync, setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
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

const USER_DATA_RESOURCE = "user-data";

/**
 * Identifies an authenticated user's data in SWR.
 *
 * `resource` namespaces the cache entry, while `userId` scopes the entry and
 * supplies the identifier used by the fetcher.
 */
type UserDataKey = readonly [resource: typeof USER_DATA_RESOURCE, userId: string];

interface CreateUserDataKeyParameters {
  /** The current authentication state that determines whether SWR may fetch. */
  readonly authenticationStatus: IsAuthenticated;
  /** The authenticated user's identifier, when authentication has resolved. */
  readonly activeUserId: string | undefined;
}

interface UserDataProviderProps {
  readonly children: ReactNode;
  readonly userDataStorage?: UserDataStorage;
  readonly swrIntervals?: UserDataSWRIntervals;
}

interface UserDataSWRIntervals {
  readonly dedupingInterval?: number;
  readonly errorRetryInterval?: number;
  readonly focusThrottleInterval?: number;
}

const USER_DATA_ERROR_RETRY_COUNT = 3;
const USER_DATA_ERROR_RETRY_INTERVAL = 5_000;
const USER_DATA_DEDUPING_INTERVAL = 2_000;
const USER_DATA_FOCUS_THROTTLE_INTERVAL = 5_000;
const NON_RETRYABLE_USER_DATA_STATUSES = new Set([400, 401, 403, 404]);
const USER_DATA_DEBUG_STAGES = new Set<string | undefined>([undefined, "testing", "dev"]);

/**
 * Creates the SWR key for an authenticated user's data.
 *
 * A null key disables SWR until authentication and user identity are both
 * available. SWR serializes tuple keys by value, so this key does not need
 * referential stability between renders.
 *
 * @param parameters Authentication and identity values used to determine
 * whether fetching is enabled.
 * @returns The namespaced user-data key, or null when SWR should not fetch.
 */
const createUserDataKey = (parameters: CreateUserDataKeyParameters): UserDataKey | null => {
  const { authenticationStatus, activeUserId } = parameters;
  if (authenticationStatus !== IsAuthenticated.TRUE || !activeUserId) {
    return null;
  }

  return [USER_DATA_RESOURCE, activeUserId];
};

const shouldRetryUserDataFetch = (error: unknown): boolean => {
  return typeof error !== "number" || !NON_RETRYABLE_USER_DATA_STATUSES.has(error);
};

/**
 * Determines whether user-data fetch diagnostics are enabled for a deployment stage.
 *
 * @param stage The build-time deployment stage exposed by Next.js.
 * @returns True when the stage is unset, `testing`, or `dev`.
 */
const shouldDebugUserDataFetch = (stage: string | undefined): boolean => {
  return USER_DATA_DEBUG_STAGES.has(stage);
};

/**
 * Fetches the user data identified by an SWR key and validates its ownership.
 *
 * @param key The resource namespace and authenticated user ID supplied by SWR.
 * @returns User data whose payload identity matches the requested user.
 * @throws When the API returns data owned by a different user.
 */
const userDataFetcher = async (key: UserDataKey): Promise<UserData> => {
  const [resource, userId] = key;
  if (shouldDebugUserDataFetch(process.env.STAGE)) {
    console.debug("Fetching SWR user data", { resource, userId });
  }

  const userData = await api.getUserData(userId);
  if (userData.user.id !== userId) {
    throw new Error(`${resource} fetch returned data for a different user`);
  }
  return userData;
};

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
  swrIntervals,
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
  const [localUserData, setLocalUserData] = useState<UserData>();
  const ownerUserId = activeUserId ?? localUserId;
  const persistedUserData = useMemo(() => {
    return activeUserId ? userDataStorage.get(activeUserId) : undefined;
  }, [activeUserId, userDataStorage]);
  const userDataKey = createUserDataKey({
    authenticationStatus: state.isAuthenticated,
    activeUserId,
  });
  const [completedFetchUserId, setCompletedFetchUserId] = useState<string>();
  const [settledActiveUserId, setSettledActiveUserId] = useState(activeUserId);
  const activeUserIdRef = useRef(activeUserId);
  const ownerUserIdRef = useRef(ownerUserId);
  const authenticationRef = useRef(state.isAuthenticated);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const saveGenerationRef = useRef(0);
  const hasActiveSaveErrorRef = useRef(false);
  const isUpdateQueueDirtyRef = useRef(false);
  const isProfileSyncPendingRef = useRef(false);
  const dataRef = useRef<UserData>();

  activeUserIdRef.current = activeUserId;
  ownerUserIdRef.current = ownerUserId;
  authenticationRef.current = state.isAuthenticated;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    UserData,
    unknown,
    UserDataKey | null
  >(userDataKey, userDataFetcher, {
    fallbackData: userDataKey ? persistedUserData : undefined,
    revalidateOnMount: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: swrIntervals?.dedupingInterval ?? USER_DATA_DEDUPING_INTERVAL,
    focusThrottleInterval: swrIntervals?.focusThrottleInterval ?? USER_DATA_FOCUS_THROTTLE_INTERVAL,
    shouldRetryOnError: shouldRetryUserDataFetch,
    errorRetryCount: USER_DATA_ERROR_RETRY_COUNT,
    errorRetryInterval: swrIntervals?.errorRetryInterval ?? USER_DATA_ERROR_RETRY_INTERVAL,
    onSuccess: (successfulUserData) => {
      const requestUserId = userDataKey?.[1];
      if (!requestUserId || activeUserIdRef.current !== requestUserId) {
        return;
      }
      setCompletedFetchUserId(requestUserId);
      if (!isUpdateQueueDirtyRef.current) {
        userDataStorage.set(requestUserId, successfulUserData);
      }
    },
    onError: (fetchError) => {
      reportUserDataSync({
        operation: "fetch",
        outcome: "error",
        error: fetchError,
      });
      const requestUserId = userDataKey?.[1];
      if (activeUserIdRef.current === requestUserId) {
        setCompletedFetchUserId(requestUserId);
      }
    },
    onDiscarded: () => {
      reportUserDataSync({ operation: "fetch", outcome: "discarded" });
      const requestUserId = userDataKey?.[1];
      if (
        requestUserId &&
        activeUserIdRef.current === requestUserId &&
        dataRef.current?.user.id === requestUserId
      ) {
        setCompletedFetchUserId(requestUserId);
      }
    },
  });

  const resolvedLocalUserData =
    localUserData?.user.id === ownerUserId ? localUserData : persistedUserData;
  const resolvedData =
    state.isAuthenticated === IsAuthenticated.TRUE ? data : resolvedLocalUserData;
  const activeData = resolvedData?.user.id === ownerUserId ? resolvedData : undefined;
  const activeUpdateQueue =
    updateQueue?.current().user.id === ownerUserId ? updateQueue : undefined;
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
      if (shouldSaveRemotely && hasProfileDataChanged) {
        isProfileSyncPendingRef.current = true;
      }
      if (authenticationRef.current === IsAuthenticated.TRUE) {
        isUpdateQueueDirtyRef.current = true;
        await mutate(newUserData, { revalidate: false });
      } else {
        setLocalUserData(newUserData);
      }
      const saveGeneration = ++saveGenerationRef.current;
      userDataStorage.set(newUserData.user.id, newUserData);
      localUpdateQueue.queue(newUserData);

      if (!shouldSaveRemotely) {
        if (hasProfileDataChanged && ownerUserIdRef.current === updateUserId) {
          try {
            await onProfileDataChange(newUserData);
          } catch (profileSyncError) {
            reportUserDataSync({
              operation: "profile-sync",
              outcome: "error",
              error: profileSyncError,
            });
            throw profileSyncError;
          }
        }
        return;
      }

      const saveForActiveOwner = async (): Promise<UserData | undefined> => {
        if (
          ownerUserIdRef.current !== updateUserId ||
          authenticationRef.current !== IsAuthenticated.TRUE
        ) {
          return undefined;
        }

        return mutate<UserData>(
          async () => {
            const response = await api.postUserData(newUserData);
            if (response.user.id !== updateUserId) {
              throw new Error("User data save returned a different user");
            }
            return response;
          },
          {
            populateCache: (response, currentData) => {
              const isLatestSave =
                ownerUserIdRef.current === updateUserId &&
                saveGenerationRef.current === saveGeneration;
              return isLatestSave ? response : (currentData ?? response);
            },
            revalidate: false,
            rollbackOnError: false,
          },
        );
      };
      const saveRequest = saveChainRef.current.then(saveForActiveOwner);
      saveChainRef.current = saveRequest.then(
        () => undefined,
        () => undefined,
      );

      let response: UserData | undefined;
      try {
        response = await saveRequest;
      } catch (saveError) {
        reportUserDataSync({
          operation: "save",
          outcome: "error",
          error: saveError,
        });
        if (
          ownerUserIdRef.current === updateUserId &&
          saveGenerationRef.current === saveGeneration
        ) {
          hasActiveSaveErrorRef.current = true;
          setUserDataError("UPDATE_FAILED");
        }
        throw saveError;
      }

      if (
        !response ||
        ownerUserIdRef.current !== updateUserId ||
        saveGenerationRef.current !== saveGeneration
      ) {
        return;
      }
      hasActiveSaveErrorRef.current = false;
      isUpdateQueueDirtyRef.current = false;
      setUserDataError(undefined);
      userDataStorage.set(response.user.id, response);
      localUpdateQueue.queue(response);

      const shouldSyncProfile = isProfileSyncPendingRef.current;
      isProfileSyncPendingRef.current = false;
      if (shouldSyncProfile && ownerUserIdRef.current === updateUserId) {
        try {
          await onProfileDataChange(response);
        } catch (profileSyncError) {
          reportUserDataSync({
            operation: "profile-sync",
            outcome: "error",
            error: profileSyncError,
          });
        }
      }
    },
    [mutate, onProfileDataChange, setUpdateQueue, setUserDataError, userDataStorage],
  );

  useEffect(() => {
    if (settledActiveUserId === activeUserId) {
      return;
    }

    setCompletedFetchUserId(undefined);
    ownerUserIdRef.current = activeUserId;
    saveGenerationRef.current += 1;
    saveChainRef.current = Promise.resolve();
    hasActiveSaveErrorRef.current = false;
    isUpdateQueueDirtyRef.current = false;
    isProfileSyncPendingRef.current = false;
    setLocalUserId(undefined);
    setLocalUserData(undefined);
    updateQueueRef.current = undefined;
    setUpdateQueue(undefined);
    setUserDataError(undefined);
    setSettledActiveUserId(activeUserId);
  }, [activeUserId, setUpdateQueue, setUserDataError, settledActiveUserId]);

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
    } else if (localUpdateQueue && activeData && !isUpdateQueueDirtyRef.current) {
      const replacementQueue = new UpdateQueueFactory(activeData, update);
      updateQueueRef.current = replacementQueue;
      setUpdateQueue(replacementQueue);
    } else if (currentBusinessId && hasNewerLicenseData && localUpdateQueue && activeData) {
      const mergedData = modifyCurrentBusiness(
        localUpdateQueue.current(),
        licenseDataModifyingFunction(activeData, currentBusinessId),
      );
      const replacementQueue = new UpdateQueueFactory(mergedData, update);
      updateQueueRef.current = replacementQueue;
      setUpdateQueue(replacementQueue);
    }
  }, [activeData, setUpdateQueue, update]);

  useEffect(() => {
    if (hasActiveSaveErrorRef.current) {
      if (userDataError !== "UPDATE_FAILED") {
        setUserDataError("UPDATE_FAILED");
      }
      return;
    }

    if (error && activeData && state.isAuthenticated === IsAuthenticated.TRUE) {
      setUserDataError("CACHED_ONLY");
    } else if (error && !activeData) {
      setUserDataError("NO_DATA");
    } else if (!error && userDataError !== undefined) {
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
    const refreshSaveGeneration = saveGenerationRef.current;
    const updatedUserData = await mutate();
    if (
      !refreshUserId ||
      activeUserIdRef.current !== refreshUserId ||
      saveGenerationRef.current !== refreshSaveGeneration ||
      !updatedUserData ||
      updatedUserData.user.id !== refreshUserId
    ) {
      return;
    }

    if (isUpdateQueueDirtyRef.current) {
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

  const clearUserData = useCallback(async (): Promise<void> => {
    const userId = ownerUserIdRef.current;
    saveGenerationRef.current += 1;
    saveChainRef.current = Promise.resolve();
    hasActiveSaveErrorRef.current = false;
    isUpdateQueueDirtyRef.current = false;
    isProfileSyncPendingRef.current = false;
    if (userId) {
      userDataStorage.delete(userId);
    }
    await mutate(undefined, { revalidate: false });
    setCompletedFetchUserId(undefined);
    setLocalUserId(undefined);
    setLocalUserData(undefined);
    updateQueueRef.current = undefined;
    setUpdateQueue(undefined);
    setUserDataError(undefined);
  }, [mutate, setUpdateQueue, setUserDataError, userDataStorage]);

  const hasCompletedFetch = ((): boolean => {
    if (settledActiveUserId !== activeUserId) return false;
    if (!activeUserId && localUserId) return activeUpdateQueue !== undefined;
    if (state.isAuthenticated === IsAuthenticated.UNKNOWN) return false;
    if (state.isAuthenticated === IsAuthenticated.FALSE && activeUserId) {
      return !activeData || activeUpdateQueue !== undefined;
    }
    if (activeUserId === undefined) return false;
    if (isValidating && completedFetchUserId !== activeUserId) return false;
    if (completedFetchUserId !== activeUserId) return false;
    if (activeData && !activeUpdateQueue) return false;
    return true;
  })();

  return (
    <UserDataContext.Provider
      value={{
        userData: activeUpdateQueue?.current(),
        business: activeUpdateQueue?.currentBusiness(),
        isLoading:
          state.isAuthenticated === IsAuthenticated.TRUE &&
          isLoading &&
          !activeData &&
          !activeUpdateQueue,
        hasCompletedFetch,
        error: userDataError,
        refresh,
        updateQueue: activeUpdateQueue,
        createUpdateQueue,
        clearUserData,
        clearUserDataError: () => {
          hasActiveSaveErrorRef.current = false;
          setUserDataError(undefined);
        },
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
