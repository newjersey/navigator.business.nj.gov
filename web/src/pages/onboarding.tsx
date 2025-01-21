import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { Alert } from "@/components/njwds-extended/Alert";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { DevOnlySkipOnboardingButton } from "@/components/onboarding/DevOnlySkipOnboardingButton";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { onboardingFlows as onboardingFlowObject } from "@/components/onboarding/OnboardingFlows";
import { ReturnToPreviousBusinessBar } from "@/components/onboarding/ReturnToPreviousBusinessBar";
import { AuthContext } from "@/contexts/authContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { MediaQueries } from "@/lib/PageSizes";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { addAdditionalBusiness } from "@/lib/domain-logic/addAdditionalBusiness";
import { hasEssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { modifyContent } from "@/lib/domain-logic/modifyContent";
import { QUERIES, QUERY_PARAMS_VALUES, ROUTES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import {
  createProfileFieldErrorMap,
  FlowType,
  OnboardingErrors,
  OnboardingStatus,
  Page,
  ProfileError,
  UpdateQueue,
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
import { determineForeignBusinessType } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileData,
  createEmptyUserData,
  LookupMunicipalityByName,
  Municipality,
  OperatingPhaseId,
  ProfileData,
  TaskProgress,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { createEmptyUser } from "@businessnjgovnavigator/shared/businessUser";
import { isRemoteWorkerOrSellerBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/domain-logic/getCurrentBusiness";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/compat/router";
import Link from "next/link";
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
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { updateQueue, createUpdateQueue, hasCompletedFetch } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [currentFlow, setCurrentFlow] = useState<FlowType>("STARTING");
  const hasHandledRouting = useRef<boolean>(false);
  const { Config } = useConfig();
  const [isAdditionalBusiness, setIsAdditionalBusiness] = useState<boolean>(false);
  const [previousBusiness, setPreviousBusiness] = useState<Business | undefined>(undefined);

  const configFields = Config.profileDefaults.fields;
  const OnboardingErrorLookup: Record<ProfileError, string> = {
    REQUIRED_ESSENTIAL_QUESTION: Config.profileDefaults.default.essentialQuestionAlertText,
    REQUIRED_EXISTING_BUSINESS: configFields.businessPersona.default.errorTextRequired,
    REQUIRED_FOREIGN_BUSINESS_TYPE: configFields.foreignBusinessTypeIds.default.errorTextRequired,
    REQUIRED_REVIEW_INFO_BELOW: Config.profileDefaults.default.errorTextBody,
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

    const removeNexusSpecificPages = (): void => {
      if (
        profileData.businessPersona === "FOREIGN" &&
        determineForeignBusinessType(profileData.foreignBusinessTypeIds) !== "NEXUS"
      ) {
        removePageFromFlow("industry-page", "FOREIGN");
        removePageFromFlow("municipality-page", "FOREIGN");
      }
    };

    const removeNonProfitForDomesticEmployer = (): void => {
      const isDomesticEmployer =
        profileData.businessPersona === "STARTING" && profileData.industryId === "domestic-employer";
      if (profileData.businessPersona !== "STARTING") return;
      if (isDomesticEmployer) {
        removePageFromFlow("industry-page", "STARTING");
      } else {
        removePageFromFlow("industry-page-without-nonprofit", "STARTING");
      }
    };

    removeNexusSpecificPages();
    removeNonProfitForDomesticEmployer();

    return onboardingFlows;
  }, [profileData]);

  const routeToPage = useCallback(
    (page: number) => {
      return router && routeShallowWithQuery(router, "page", page);
    },
    [router]
  );

  useEffect(() => {
    setCurrentFlow(getFlow(profileData));
  }, [profileData]);

  const protectUpdateQueueAgainstRaceCondition = (currentUserData: UserData | undefined): boolean => {
    /*
    A user cannot be authenticated and have empty userData. In order to preserve any data that may
    have not yet returned, redirect the user to the landing page and out of the onboarding flow.
    */
    return state.isAuthenticated === IsAuthenticated.TRUE && currentUserData === undefined;
  };

  useEffect(() => {
    (async (): Promise<void> => {
      if (
        !router ||
        hasHandledRouting.current ||
        !state.activeUser ||
        state.isAuthenticated === IsAuthenticated.UNKNOWN ||
        !hasCompletedFetch
      ) {
        return;
      }

      hasHandledRouting.current = true;
      let localUpdateQueue = updateQueue;

      let currentUserData = updateQueue?.current();

      if (protectUpdateQueueAgainstRaceCondition(currentUserData)) {
        router.push(ROUTES.dashboard);
        return;
      }

      if (currentUserData) {
        const queryAdditionalBusiness = router.query[QUERIES.additionalBusiness] as string;
        if (queryAdditionalBusiness === "true") {
          setIsAdditionalBusiness(true);
          setPreviousBusiness(getCurrentBusiness(currentUserData));
          const userDataWithAdditionalBusiness = addAdditionalBusiness(currentUserData);
          await updateQueue?.queue(userDataWithAdditionalBusiness).update({ local: true });
          currentUserData = userDataWithAdditionalBusiness;
        }

        setProfileData(currentUserData.businesses[currentUserData.currentBusinessId].profileData);
        setCurrentFlow(getFlow(currentUserData));
      } else {
        const emptyUser = {
          ...createEmptyUser(),
          email: state.activeUser.email,
          id: state.activeUser.id,
        };
        currentUserData = createEmptyUserData(emptyUser);
        setRegistrationDimension("Began Onboarding");
        localUpdateQueue = await createUpdateQueue(currentUserData);
        setProfileData(currentUserData.businesses[currentUserData.currentBusinessId].profileData);
      }

      const currentBusiness = currentUserData.businesses[currentUserData.currentBusinessId];
      if (currentBusiness.onboardingFormProgress === "COMPLETED") {
        await router.replace(ROUTES.dashboard);
        return;
      } else {
        const queryPage = Number(router.query[QUERIES.page]);
        const queryIndustryId = router.query[QUERIES.industry] as string | undefined;
        const businessMunicipality = router.query[QUERIES.businessMunicipality] as string | undefined;
        const queryFlow = router.query[QUERIES.flow] as string;
        const utmSource = router.query[QUERIES.utmSource] as string | undefined;

        if (businessMunicipality) {
          const municipalityResult = LookupMunicipalityByName(businessMunicipality);
          if (municipalityResult.name) {
            const newProfileData: ProfileData = {
              ...currentBusiness.profileData,
              municipality: municipalityResult,
            };
            setProfileData(newProfileData);
            localUpdateQueue?.queueProfileData(newProfileData);
          }
        }

        if (utmSource) {
          localUpdateQueue
            ?.queueUser({
              accountCreationSource: utmSource,
            })
            .update({ local: true });
        }

        if (industryQueryParamIsValid(queryIndustryId)) {
          const newProfileData: ProfileData = {
            ...currentBusiness.profileData,
            businessPersona: "STARTING",
            industryId: queryIndustryId,
          };

          setProfileData(newProfileData);
          localUpdateQueue?.queueProfileData(newProfileData);

          if (hasEssentialQuestion(queryIndustryId)) {
            setPage({ current: 2, previous: 1 });
          } else {
            completeOnboarding(newProfileData, localUpdateQueue);
          }
        } else if (pageQueryParamisValid(onboardingFlows, currentBusiness, queryPage)) {
          setPage({ current: queryPage, previous: queryPage - 1 });
        } else if (flowQueryParamIsValid(queryFlow)) {
          await setBusinessPersonaAndRouteToPage(queryFlow, localUpdateQueue);
        } else {
          setPage({ current: 1, previous: 1 });
          routeToPage(1);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, state.activeUser, state.isAuthenticated, hasCompletedFetch]);

  const setBusinessPersonaAndRouteToPage = async (
    flow: string,
    updateQueue: UpdateQueue | undefined
  ): Promise<void> => {
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

  const completeOnboarding = async (
    newProfileData: ProfileData,
    updateQueue: UpdateQueue | undefined
  ): Promise<void> => {
    if (!updateQueue) return;

    setRegistrationDimension("Onboarded Guest");
    if (isAdditionalBusiness) {
      analytics.event.onboarding_last_step_save_additional_business_button.click.finish_additional_business_onboarding();
    } else {
      analytics.event.onboarding_last_step.submit.finish_onboarding();
    }

    const isRemoteSellerWorker = isRemoteWorkerOrSellerBusiness({
      ...updateQueue.currentBusiness(),
      profileData: newProfileData,
    });

    let newUserData: UserData = {
      ...updateQueue.current(),
      businesses: {
        ...updateQueue.current().businesses,
        [updateQueue.current().currentBusinessId]: {
          ...updateQueue.currentBusiness(),
          profileData: {
            ...newProfileData,
            operatingPhase: isRemoteSellerWorker
              ? OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE
              : newProfileData.operatingPhase,
          },
          onboardingFormProgress: "COMPLETED",
        },
      },
    };

    newUserData = await api.postGetAnnualFilings(newUserData);
    updateQueue.queue(newUserData);

    if (newProfileData.legalStructureId) {
      const completed: TaskProgress = "COMPLETED";
      updateQueue.queueTaskProgress({ [businessStructureTaskId]: completed });
    }

    await updateQueue.update();

    router &&
      (await router.push({
        pathname: ROUTES.dashboard,
        query: isAdditionalBusiness
          ? { [QUERIES.fromAdditionalBusiness]: "true" }
          : { [QUERIES.fromOnboarding]: "true" },
      }));
  };

  FormFuncWrapper(
    async (): Promise<void> => {
      scrollToTop();
      if (!updateQueue) return;
      let newProfileData = profileData;

      const hasBusinessPersonaChanged =
        profileData.businessPersona !== updateQueue.currentBusiness().profileData.businessPersona;

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
          operatingPhase:
            profileData.businessPersona === "OWNING"
              ? OperatingPhaseId.GUEST_MODE_OWNING
              : OperatingPhaseId.GUEST_MODE,
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

      if (determineForeignBusinessType(profileData.foreignBusinessTypeIds) === "NONE") {
        router &&
          (await router.push({
            pathname: ROUTES.unsupported,
            query: isAdditionalBusiness
              ? { [QUERIES.additionalBusiness]: "true", [QUERIES.previousBusinessId]: previousBusiness?.id }
              : {},
          }));
      } else if (page.current + 1 <= onboardingFlows[currentFlow].pages.length) {
        updateQueue
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
        completeOnboarding(newProfileData, updateQueue);
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

  const pageTitle = modifyContent({
    content: Config.onboardingDefaults.pageTitle,
    condition: () => isAdditionalBusiness,
    modificationMap: {
      Additional: "Additional",
      additional: "additional",
    },
  });

  const header = (): ReactElement => {
    return (
      <div
        className="margin-y-2 desktop:margin-y-0 desktop:padding-bottom-1"
        data-testid={`step-${page.current.toString()}`}
      >
        <h1 ref={headerRef}>{`${[pageTitle, evalHeaderStepsTemplate(page)].join(" ")}`}</h1>
      </div>
    );
  };
  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <ProfileFormContext.Provider value={formContextState}>
        <ProfileDataContext.Provider
          value={{
            state: {
              page: page.current,
              profileData: profileData,
              flow: currentFlow,
            },
            setProfileData,
            onBack,
          }}
        >
          <NextSeo title={getNextSeoTitle(`${pageTitle} ${evalHeaderStepsTemplate(page)}`)} />
          <PageSkeleton
            showNavBar
            previousBusinessId={previousBusiness?.id}
            logoOnly={previousBusiness ? "NAVIGATOR_LOGO" : undefined}
          >
            <ReturnToPreviousBusinessBar previousBusiness={previousBusiness} />
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
                        <Link href={ROUTES.dashboard} data-testid={`snackbar-link`}>
                          {OnboardingStatusLookup()[alert].link}
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
                          <hr className="margin-top-6 margin-bottom-2" />
                          <OnboardingButtonGroup
                            isAdditionalBusiness={isAdditionalBusiness}
                            isFinal={page.current === onboardingFlows[currentFlow].pages.length}
                          />
                          <DevOnlySkipOnboardingButton setPage={setPage} routeToPage={routeToPage} />
                        </form>
                      </SingleColumnContainer>
                    </CSSTransition>
                  );
                })}
              </div>
            </main>
          </PageSkeleton>
        </ProfileDataContext.Provider>
      </ProfileFormContext.Provider>
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
