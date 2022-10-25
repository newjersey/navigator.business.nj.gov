import { NavBar } from "@/components/navbar/NavBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { DevOnlySkipOnboardingButton } from "@/components/onboarding/DevOnlySkipOnboardingButton";
import { getOnboardingFlows } from "@/components/onboarding/getOnboardingFlows";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AuthContext } from "@/contexts/authContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import {
  createProfileFieldErrorMap,
  FlowType,
  OnboardingStatus,
  ProfileError,
  ProfileFieldErrorMap,
  ProfileFields,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  sendOnboardingOnSubmitEvents,
  setAnalyticsDimensions,
  setRegistrationDimension,
} from "@/lib/utils/analytics-helpers";
import {
  getFlow,
  getSectionCompletion,
  OnboardingErrorLookup,
  OnboardingStatusLookup,
  scrollToTop,
  templateEval,
} from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyProfileData,
  createEmptyUser,
  createEmptyUserData,
  LookupIndustryById,
  LookupLegalStructureById,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FormEvent,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CSSTransition } from "react-transition-group";

interface Props {
  municipalities: Municipality[];
}

const OnboardingPage = (props: Props): ReactElement => {
  const { setRoadmap, setSectionCompletion } = useContext(RoadmapContext);
  const { state } = useContext(AuthContext);

  const router = useRouter();
  const [page, setPage] = useState<{ current: number; previous: number }>({ current: 1, previous: 1 });
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [user, setUser] = useState<BusinessUser>(createEmptyUser(ABStorageFactory().getExperience()));
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [currentFlow, setCurrentFlow] = useState<FlowType>("STARTING");
  const hasHandledRouting = useRef<boolean>(false);

  const onValidation = (field: ProfileFields, invalid: boolean): void => {
    setFieldStates((prevFieldStates) => ({ ...prevFieldStates, [field]: { invalid } }));
  };

  const onboardingFlows = useMemo(() => {
    let onboardingFlows = getOnboardingFlows(profileData, user, onValidation, fieldStates);

    const removePageFromFlow = (pageName: string, flow: FlowType): void => {
      onboardingFlows = {
        ...onboardingFlows,
        [flow]: {
          ...onboardingFlows[flow],
          pages: onboardingFlows[flow].pages.filter((it) => it.name !== pageName),
        },
      };
    };

    const requiresPublicFiling = LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling;
    if (!requiresPublicFiling) {
      removePageFromFlow("date-and-entity-id-for-public-filing", "OWNING");
    }

    if (profileData.businessPersona === "FOREIGN" && profileData.foreignBusinessType !== "NEXUS") {
      removePageFromFlow("industry-page", "FOREIGN");
      removePageFromFlow("legal-structure-page", "FOREIGN");
      removePageFromFlow("municipality-page", "FOREIGN");
    }

    return onboardingFlows;
  }, [profileData, user, fieldStates]);

  const routeToPage = useCallback((page: number) => routeShallowWithQuery(router, "page", page), [router]);

  const industryQueryParamIsValid = (industryId: string | undefined): boolean => {
    return !!LookupIndustryById(industryId).id;
  };

  useEffect(() => {
    setCurrentFlow(getFlow(profileData));
  }, [profileData]);

  useEffect(() => {
    (async () => {
      if (
        !router.isReady ||
        hasHandledRouting.current ||
        !state.user ||
        state.isAuthenticated === IsAuthenticated.UNKNOWN
      )
        return;

      let currentUserData = userData;

      if (currentUserData) {
        setProfileData(currentUserData.profileData);
        setUser(currentUserData.user);
        setCurrentFlow(getFlow(currentUserData));
      } else if (state.isAuthenticated == IsAuthenticated.FALSE) {
        currentUserData = createEmptyUserData(state.user);
        setRegistrationDimension("Began Onboarding");
        await update(currentUserData);
        setProfileData(currentUserData.profileData);
        setUser(currentUserData.user);
      }

      if (currentUserData) {
        if (currentUserData?.formProgress === "COMPLETED") {
          await router.replace(ROUTES.profile);
          return;
        } else {
          const queryPage = Number(router.query[QUERIES.page]);
          const queryIndustryId = router.query[QUERIES.industry] as string | undefined;

          if (industryQueryParamIsValid(queryIndustryId)) {
            await setIndustryAndRouteToPage2(currentUserData, queryIndustryId);
          } else if (pageQueryParamisValid(currentUserData, queryPage)) {
            setPage({ current: queryPage, previous: queryPage - 1 });
          } else {
            setPage({ current: 1, previous: 1 });
            routeToPage(1);
          }

          hasHandledRouting.current = true;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, state.user, state.isAuthenticated]);

  const pageQueryParamisValid = (userData: UserData, page: number): boolean => {
    const hasAnsweredBusinessPersona = userData?.profileData.businessPersona !== undefined;
    const requestedPageIsInRange = page <= onboardingFlows[currentFlow].pages.length && page > 0;

    return hasAnsweredBusinessPersona && requestedPageIsInRange;
  };

  const setIndustryAndRouteToPage2 = async (
    userData: UserData,
    industryId: string | undefined
  ): Promise<void> => {
    setProfileData({
      ...profileData,
      businessPersona: "STARTING",
      industryId: industryId,
    });
    setPage({ current: 2, previous: 1 });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    scrollToTop();
    const currentUserData = userData as UserData;

    const currentPageFlow = onboardingFlows[currentFlow].pages[page.current - 1];
    const errorMap = currentPageFlow.getErrorMap();
    const hasErrors = {
      banner: errorMap?.banner && errorMap?.banner.some((error) => !error.valid),
      inline: errorMap?.inline && errorMap?.inline.some((error) => !error.valid),
    };

    if (hasErrors.banner || hasErrors.inline) {
      if (hasErrors.banner && errorMap?.banner) {
        setError(errorMap.banner.find((bannerError) => !bannerError.valid)?.name);
      }
      if (hasErrors.inline && errorMap?.inline) {
        setAlert("ERROR");
        onValidation(errorMap.inline.find((error) => !error.valid)?.name as ProfileFields, true);
      }
      headerRef.current?.focus();
      scrollToTop();
      return;
    }

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
        legalStructureId: profileData.legalStructureId,
        requiresCpa: profileData.requiresCpa,
        providesStaffingService: profileData.providesStaffingService,
        certifiedInteriorDesigner: profileData.certifiedInteriorDesigner,
        realEstateAppraisalManagement: profileData.realEstateAppraisalManagement,
        operatingPhase: profileData.businessPersona === "OWNING" ? "GUEST_MODE_OWNING" : "GUEST_MODE",
        interstateTransport: profileData.interstateTransport,
      };

      setProfileData(newProfileData);
      setCurrentFlow(getFlow(profileData));
    }

    const currentPage = onboardingFlows[currentFlow].pages[page.current - 1];
    sendOnboardingOnSubmitEvents(newProfileData, currentPage?.name);
    setAnalyticsDimensions(newProfileData);
    setAlert(undefined);
    setError(undefined);

    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    setSectionCompletion(getSectionCompletion(newRoadmap, currentUserData));

    if (profileData.foreignBusinessType === "NONE") {
      await router.push(ROUTES.unsupported);
    } else if (page.current + 1 <= onboardingFlows[currentFlow].pages.length) {
      update({ ...currentUserData, user, profileData: newProfileData }, { local: true }).then(() => {
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
      let newUserData: UserData = {
        ...currentUserData,
        user,
        profileData: newProfileData,
        formProgress: "COMPLETED",
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
            ? newUserData.preferences.visibleSidebarCards.filter(
                (cardId: string) => cardId !== "task-progress"
              )
            : [...newUserData.preferences.visibleSidebarCards, "task-progress"],
      };

      const updatedUserData = {
        ...newUserData,
        preferences: newPreferencesData,
      };

      await update(updatedUserData);
      await router.push({
        pathname: ROUTES.dashboard,
        query: { [QUERIES.fromOnboarding]: "true" },
      });
    }
  };

  const onBack = () => {
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

  const evalHeaderStepsTemplate = (): string => {
    if (page.current === 1) {
      return templateEval(Config.onboardingDefaults.stepXTemplate, {
        currentPage: page.current.toString(),
      });
    } else if (page.current === 2 && profileData.businessPersona === "FOREIGN") {
      return templateEval(Config.onboardingDefaults.stepXTemplate, {
        currentPage: page.current.toString(),
      });
    } else {
      return templateEval(Config.onboardingDefaults.stepXofYTemplate, {
        currentPage: page.current.toString(),
        totalPages: onboardingFlows[currentFlow].pages.length.toString(),
      });
    }
  };

  const header = () => (
    <div className="margin-y-2 desktop:margin-y-0 desktop:padding-bottom-4">
      <h1 ref={headerRef}>
        {Config.onboardingDefaults.pageTitle}{" "}
        <span className="text-light" data-testid={`step-${page.current.toString()}`}>
          {evalHeaderStepsTemplate()}
        </span>
      </h1>
    </div>
  );

  const getAnimation = (): string => {
    return page.previous < page.current ? "slide" : "slide-back";
  };

  const getTimeout = (slidePage: number): number => {
    return slidePage === page.previous ? 100 : 300;
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          page: page.current,
          profileData: profileData,
          user: user,
          flow: currentFlow,
          municipalities: props.municipalities,
        },
        setProfileData,
        setUser,
        onBack,
      }}
    >
      <NextSeo
        title={`Business.NJ.gov Navigator - ${
          Config.onboardingDefaults.pageTitle
        } ${evalHeaderStepsTemplate()} `}
      />
      <PageSkeleton>
        <NavBar />
        <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
          <SingleColumnContainer isSmallerWidth>
            {header()}
            {!isLargeScreen && <hr />}
            {error && (
              <Alert dataTestid={`error-alert-${error}`} variant="error">
                {OnboardingErrorLookup[error]}
              </Alert>
            )}
            {alert && (
              <SnackbarAlert
                variant={OnboardingStatusLookup()[alert].variant}
                isOpen={alert !== undefined}
                close={() => setAlert(undefined)}
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
            {onboardingFlows[currentFlow].pages.map((onboardingPage, index) => (
              <CSSTransition
                key={index}
                in={page.current === index + 1}
                unmountOnExit
                timeout={getTimeout(index + 1)}
                classNames={`width-100 ${getAnimation()}`}
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
            ))}
          </div>
        </main>
      </PageSkeleton>
    </ProfileDataContext.Provider>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  const municipalities = await loadAllMunicipalities();

  return {
    props: {
      municipalities,
    },
  };
};

export default OnboardingPage;
