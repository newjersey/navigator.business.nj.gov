import { NavBar } from "@/components/navbar/NavBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { DevOnlySkipOnboardingButton } from "@/components/onboarding/DevOnlySkipOnboardingButton";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { onboardingFlows as onboardingFlowObject } from "@/components/onboarding/OnboardingFlows";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AuthContext } from "@/contexts/authContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { hasEssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import { QUERIES, QUERY_PARAMS_VALUES, ROUTES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import {
  createProfileFieldErrorMap,
  FlowType,
  OnboardingErrors,
  OnboardingStatus,
  Page,
  ProfileError,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  sendOnboardingOnSubmitEvents,
  setAnalyticsDimensions,
  setRegistrationDimension,
} from "@/lib/utils/analytics-helpers";
import { getFlow, OnboardingStatusLookup, scrollToTop } from "@/lib/utils/helpers";
import {
  evalHeaderStepsTemplate,
  flowQueryParamIsValid,
  getAnimation,
  getTimeout,
  industryQueryParamIsValid,
  mapFlowQueryToPersona,
  pageQueryParamisValid,
} from "@/lib/utils/onboardingPageHelpers";
import {
  BusinessUser,
  createEmptyProfileData,
  createEmptyUser,
  createEmptyUserData,
  LookupLegalStructureById,
  Municipality,
  ProfileData,
  TaskProgress,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

interface Props {
  municipalities: Municipality[];
}

const OnboardingPage = (props: Props): ReactElement => {
  const { state } = useContext(AuthContext);

  const router = useRouter();
  const [page, setPage] = useState<Page>({ current: 1, previous: 1 });
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [user, setUser] = useState<BusinessUser>(createEmptyUser(ABStorageFactory().getExperience()));
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { updateQueue, userData, createUpdateQueue } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [currentFlow, setCurrentFlow] = useState<FlowType>("STARTING");
  const hasHandledRouting = useRef<boolean>(false);
  const { Config } = useConfig();

  const configFields = Config.profileDefaults.fields;
  const OnboardingErrorLookup: Record<ProfileError, string> = {
    REQUIRED_ESSENTIAL_QUESTION: Config.profileDefaults.essentialQuestionAlertText,
    REQUIRED_EXISTING_BUSINESS: configFields.businessPersona.default.errorTextRequired,
    REQUIRED_FOREIGN_BUSINESS_TYPE: configFields.foreignBusinessTypeIds.default.errorTextRequired,
    REQUIRED_NEXUS_LOCATION_IN_NJ: configFields.nexusLocationInNewJersey.default.errorTextRequired,
    REQUIRED_REVIEW_INFO_BELOW: Config.profileDefaults.errorTextBody,
  };

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap<OnboardingErrors>());

  const onboardingFlows = useMemo(() => {
    let onboardingFlows = onboardingFlowObject;

    const removePageFromFlow = (pageName: string, flow: FlowType): void => {
      onboardingFlows = {
        ...onboardingFlows,
        [flow]: {
          ...onboardingFlows[flow],
          pages: onboardingFlows[flow].pages.filter((it) => {
            return it.name !== pageName;
          }),
        },
      };
    };

    const removeDateAndEntityIdForPublicFilingPages = (): void => {
      if (profileData.legalStructureId) {
        const requiresPublicFiling = LookupLegalStructureById(
          profileData.legalStructureId
        ).requiresPublicFiling;
        if (!requiresPublicFiling) {
          removePageFromFlow("date-and-entity-id-for-public-filing", "OWNING");
        }
      }
    };

    const removeNexusSpecificPages = (): void => {
      if (profileData.businessPersona === "FOREIGN" && profileData.foreignBusinessType !== "NEXUS") {
        removePageFromFlow("industry-page", "FOREIGN");
        removePageFromFlow("legal-structure-page", "FOREIGN");
        removePageFromFlow("municipality-page", "FOREIGN");
      }
    };

    removeDateAndEntityIdForPublicFilingPages();
    removeNexusSpecificPages();

    return onboardingFlows;
  }, [profileData]);

  const routeToPage = useCallback(
    (page: number) => {
      return routeShallowWithQuery(router, "page", page);
    },
    [router]
  );

  useEffect(() => {
    setCurrentFlow(getFlow(profileData));
  }, [profileData]);

  useEffect(() => {
    (async (): Promise<void> => {
      if (
        !router.isReady ||
        hasHandledRouting.current ||
        !state.user ||
        state.isAuthenticated === IsAuthenticated.UNKNOWN
      ) {
        return;
      }

      let currentUserData = userData;
      if (currentUserData) {
        setProfileData(currentUserData.profileData);
        setUser(currentUserData.user);
        setCurrentFlow(getFlow(currentUserData));
      } else if (state.isAuthenticated === IsAuthenticated.FALSE) {
        currentUserData = createEmptyUserData(state.user);
        setRegistrationDimension("Began Onboarding");
        await createUpdateQueue(currentUserData);
        setProfileData(currentUserData.profileData);
        setUser(currentUserData.user);
      }
      if (currentUserData) {
        if (currentUserData?.onboardingFormProgress === "COMPLETED") {
          await router.replace(ROUTES.profile);
          return;
        } else {
          const queryPage = Number(router.query[QUERIES.page]);
          const queryIndustryId = router.query[QUERIES.industry] as string | undefined;
          const queryFlow = router.query[QUERIES.flow] as string;

          if (industryQueryParamIsValid(queryIndustryId)) {
            setIndustryAndRouteToPage(currentUserData, queryIndustryId);
          } else if (pageQueryParamisValid(onboardingFlows, currentUserData, queryPage)) {
            setPage({ current: queryPage, previous: queryPage - 1 });
          } else if (flowQueryParamIsValid(queryFlow)) {
            setBusinessPersonaAndRouteToPage(queryFlow);
          } else {
            setPage({ current: 1, previous: 1 });
            routeToPage(1);
          }

          hasHandledRouting.current = true;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, state.user, state.isAuthenticated, updateQueue]);

  const setIndustryAndRouteToPage = (userData: UserData, industryId: string | undefined): void => {
    const newProfileData: ProfileData = {
      ...userData.profileData,
      businessPersona: "STARTING",
      industryId: industryId,
    };

    setProfileData(newProfileData);
    if (hasEssentialQuestion(industryId)) {
      setPage({ current: 2, previous: 1 });
    } else {
      setPage({ current: 3, previous: 2 });
    }
    updateQueue?.queueProfileData(newProfileData);
  };

  const setBusinessPersonaAndRouteToPage = (flow: string): void => {
    const flowType = mapFlowQueryToPersona[flow as QUERY_PARAMS_VALUES["flow"]];
    const newProfileData: ProfileData = {
      ...profileData,
      businessPersona: flowType,
    };

    setProfileData(newProfileData);
    setCurrentFlow(flowType);
    if (flowType === "OWNING") {
      setPage({ current: 1, previous: 1 });
    } else {
      setPage({ current: 2, previous: 1 });
    }
    updateQueue?.queueProfileData(newProfileData);
  };

  FormFuncWrapper(
    async (): Promise<void> => {
      scrollToTop();
      if (!updateQueue) return;
      const currentUserData = updateQueue.current();
      let newProfileData = profileData;
      const hasBusinessPersonaChanged =
        profileData.businessPersona !== currentUserData?.profileData.businessPersona;

      if (page.current === 1 && hasBusinessPersonaChanged) {
        newProfileData = {
          ...emptyProfileData,
          businessName: profileData.businessName,
          industryId: profileData.businessPersona === "OWNING" ? "generic" : undefined,
          homeBasedBusiness: profileData.homeBasedBusiness,
          liquorLicense: profileData.liquorLicense,
          municipality: profileData.municipality,
          businessPersona: profileData.businessPersona,
          requiresCpa: profileData.requiresCpa,
          providesStaffingService: profileData.providesStaffingService,
          certifiedInteriorDesigner: profileData.certifiedInteriorDesigner,
          realEstateAppraisalManagement: profileData.realEstateAppraisalManagement,
          operatingPhase: profileData.businessPersona === "OWNING" ? "GUEST_MODE_OWNING" : "GUEST_MODE",
          interstateLogistics: profileData.interstateLogistics,
          interstateMoving: profileData.interstateMoving,
          sectorId: profileData.sectorId,
        };

        setProfileData(newProfileData);
        setCurrentFlow(getFlow(profileData));
      }

      const currentPage = onboardingFlows[currentFlow].pages[page.current - 1];
      sendOnboardingOnSubmitEvents(newProfileData, currentPage?.name);
      setAnalyticsDimensions(newProfileData);

      if (profileData.foreignBusinessType === "NONE") {
        await router.push(ROUTES.unsupported);
      } else if (page.current + 1 <= onboardingFlows[currentFlow].pages.length) {
        updateQueue
          .queueUser(user)
          .queueProfileData(newProfileData)
          .update({ local: true })
          .then(() => {
            const nextCurrentPage = page.current + 1;
            setPage({
              current: nextCurrentPage,
              previous: page.current,
            });
            routeToPage(nextCurrentPage);
            headerRef.current?.focus();
          });
      } else {
        setRegistrationDimension("Onboarded Guest");
        analytics.event.onboarding_last_step.submit.finish_onboarding();

        const isRemoteSellerWorker =
          newProfileData.businessPersona === "FOREIGN" &&
          (newProfileData.foreignBusinessType === "REMOTE_SELLER" ||
            newProfileData.foreignBusinessType === "REMOTE_WORKER");

        let newUserData: UserData = {
          ...currentUserData,
          user,
          profileData: {
            ...newProfileData,
            operatingPhase: isRemoteSellerWorker
              ? "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
              : newProfileData.operatingPhase,
          },
          onboardingFormProgress: "COMPLETED",
        };

        if (newUserData.user.receiveNewsletter) {
          newUserData = await api.postNewsletter(newUserData);
        }

        if (newUserData.user.userTesting) {
          newUserData = await api.postUserTesting(newUserData);
        }

        newUserData = await api.postGetAnnualFilings(newUserData);

        const newPreferencesData = {
          ...newUserData.preferences,
          visibleSidebarCards:
            newProfileData.businessPersona === "OWNING"
              ? newUserData.preferences.visibleSidebarCards.filter((cardId: string) => {
                  return cardId !== "task-progress";
                })
              : [...newUserData.preferences.visibleSidebarCards, "task-progress"],
        };

        if (newProfileData.operatingPhase === "GUEST_MODE_OWNING") {
          newPreferencesData.visibleSidebarCards = newPreferencesData.visibleSidebarCards.filter(
            (cardId: string) => {
              return cardId !== "welcome";
            }
          );
          newPreferencesData.visibleSidebarCards = [
            ...newPreferencesData.visibleSidebarCards,
            "welcome-up-and-running",
          ];
        }

        const completed: TaskProgress = "COMPLETED";
        const updatedUserData = {
          ...newUserData,
          taskProgress: newUserData.profileData.legalStructureId
            ? { ...newUserData.taskProgress, [businessStructureTaskId]: completed }
            : { ...newUserData.taskProgress },
          preferences: newPreferencesData,
        };

        await updateQueue.queue(updatedUserData).update();
        await router.push({
          pathname: ROUTES.dashboard,
          query: { [QUERIES.fromOnboarding]: "true" },
        });
      }
    },
    (isValid, errors) => {
      if (errors.length > 0 && !isValid) {
        scrollToTop();
        if (errors.includes("ALERT_BAR")) {
          setAlert("ERROR");
        }
        const banner = errors.filter((error) => error !== "ALERT_BAR") as ProfileError[];
        if (banner.length > 0) {
          setError(banner[0]);
        }
        headerRef.current?.focus();
      } else {
        setError(undefined);
        setAlert(undefined);
      }
    }
  );

  const onBack = (): void => {
    if (page.current + 1 > 0) {
      setAlert(undefined);
      setError(undefined);
      const previousPage = page.current - 1;
      setPage({
        current: previousPage,
        previous: page.current,
      });
      routeToPage(previousPage);
      headerRef.current?.focus();
    }
  };

  const header = (): ReactElement => {
    return (
      <div className="margin-y-2 desktop:margin-y-0 desktop:padding-bottom-1">
        <h1 ref={headerRef}>
          {Config.onboardingDefaults.pageTitle}{" "}
          <span className="text-light" data-testid={`step-${page.current.toString()}`}>
            {evalHeaderStepsTemplate(onboardingFlows, currentFlow, profileData, page)}
          </span>
        </h1>
      </div>
    );
  };

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <profileFormContext.Provider value={formContextState}>
        <ProfileDataContext.Provider
          value={{
            state: {
              page: page.current,
              profileData: profileData,
              user: user,
              flow: currentFlow,
            },
            setProfileData,
            setUser,
            onBack,
          }}
        >
          <NextSeo
            title={`Business.NJ.gov Navigator - ${
              Config.onboardingDefaults.pageTitle
            } ${evalHeaderStepsTemplate(onboardingFlows, currentFlow, profileData, page)}`}
          />
          <PageSkeleton>
            <NavBar />
            <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
              <SingleColumnContainer isSmallerWidth>
                {header()}
                {!isLargeScreen && <hr />}
                {error && (
                  <Alert dataTestid={`banner-alert-${error}`} variant="error">
                    {OnboardingErrorLookup[error]}
                  </Alert>
                )}
                {alert && (
                  <SnackbarAlert
                    variant={OnboardingStatusLookup()[alert].variant}
                    isOpen={true}
                    close={(): void => setAlert(undefined)}
                    dataTestid={`snackbar-alert-${alert}`}
                    heading={OnboardingStatusLookup()[alert].header}
                  >
                    <>
                      {OnboardingStatusLookup()[alert].body}
                      {OnboardingStatusLookup()[alert] && (
                        <Link href={ROUTES.dashboard}>
                          <a href={ROUTES.dashboard} data-testid={`snackbar-link`}>
                            {OnboardingStatusLookup()[alert].link}
                          </a>
                        </Link>
                      )}
                    </>
                  </SnackbarAlert>
                )}

                <UserDataErrorAlert />
              </SingleColumnContainer>
              <div className="slide-container">
                {onboardingFlows[currentFlow].pages.map((onboardingPage, index) => {
                  return (
                    <CSSTransition
                      key={index}
                      in={page.current === index + 1}
                      unmountOnExit
                      timeout={getTimeout(page, index + 1)}
                      classNames={`width-100 ${getAnimation(page)}`}
                    >
                      <SingleColumnContainer isSmallerWidth>
                        <form
                          onSubmit={onSubmit}
                          className={`usa-prose onboarding-form margin-top-2`}
                          data-testid={`page-${index + 1}-form`}
                        >
                          {onboardingPage.component}
                          <hr className="margin-top-6 margin-bottom-4" aria-hidden={true} />
                          <DevOnlySkipOnboardingButton setPage={setPage} routeToPage={routeToPage} />
                          <OnboardingButtonGroup
                            isFinal={page.current === onboardingFlows[currentFlow].pages.length}
                          />
                        </form>
                      </SingleColumnContainer>
                    </CSSTransition>
                  );
                })}
              </div>
            </main>
          </PageSkeleton>
        </ProfileDataContext.Provider>
      </profileFormContext.Provider>
    </MunicipalitiesContext.Provider>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  return {
    props: {
      municipalities: loadAllMunicipalities(),
    },
  };
};

export default OnboardingPage;
