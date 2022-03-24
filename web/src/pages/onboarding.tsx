import { Alert } from "@/components/njwds-extended/Alert";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getOnboardingFlows } from "@/components/onboarding/getOnboardingFlows";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { loadUserDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import {
  createEmptyUserDisplayContent,
  createProfileFieldErrorMap,
  FlowType,
  LoadDisplayContent,
  OnboardingStatus,
  ProfileError,
  ProfileFieldErrorMap,
  ProfileFields,
  UserContentType,
  UserDisplayContent,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions, setRegistrationDimension } from "@/lib/utils/analytics-helpers";
import {
  getSectionCompletion,
  OnboardingErrorLookup,
  OnboardingStatusLookup,
  scrollToTop,
  templateEval,
} from "@/lib/utils/helpers";
import { AuthContext, RoadmapContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  createEmptyProfileData,
  createEmptyUser,
  createEmptyUserData,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  createContext,
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
  displayContent: LoadDisplayContent;
  municipalities: Municipality[];
}

interface ProfileDataState {
  page?: number;
  profileData: ProfileData;
  user?: BusinessUser;
  displayContent: UserDisplayContent;
  flow?: UserContentType;
  municipalities: Municipality[];
}

interface ProfileDataContextType {
  state: ProfileDataState;
  setProfileData: (profileData: ProfileData) => void;
  setUser: (user: BusinessUser) => void;
  onBack: () => void;
}

export const ProfileDataContext = createContext<ProfileDataContextType>({
  state: {
    page: 1,
    profileData: createEmptyProfileData(),
    user: createEmptyUser(),
    flow: "STARTING",
    displayContent: createEmptyUserDisplayContent(),
    municipalities: [],
  },
  setProfileData: () => {},
  setUser: () => {},
  onBack: () => {},
});

const OnboardingPage = (props: Props): ReactElement => {
  const { setRoadmap, setSectionCompletion } = useContext(RoadmapContext);
  const { state } = useContext(AuthContext);

  const router = useRouter();
  const [page, setPage] = useState<{ current: number; previous: number }>({ current: 1, previous: 1 });
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [user, setUser] = useState<BusinessUser>(createEmptyUser());
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [currentFlow, setCurrentFlow] = useState<FlowType>("STARTING");
  const hasHandledRouting = useRef<boolean>(false);

  const onValidation = useCallback(
    (field: ProfileFields, invalid: boolean): void => {
      setFieldStates({ ...fieldStates, [field]: { invalid } });
    },
    [setFieldStates, fieldStates]
  );

  const onboardingFlows = useMemo(() => {
    const onboardingFlows = getOnboardingFlows(profileData, user, onValidation, fieldStates);
    return onboardingFlows;
  }, [profileData, user, onValidation, fieldStates]);

  useEffect(() => {
    if (userData) {
      setProfileData(userData.profileData);
      setUser(userData.user);
      setCurrentFlow(userData.profileData.hasExistingBusiness ? "OWNING" : "STARTING");
    } else if (state.user && state.isAuthenticated == IsAuthenticated.FALSE) {
      const _userData = createEmptyUserData(state.user);
      setRegistrationDimension("Began Onboarding");
      update(_userData, { local: true });
      setProfileData(_userData.profileData);
      setUser(_userData.user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated, state.user, userData]);

  const queryShallowPush = useCallback(
    (page: number) => router.push({ query: { page: page } }, undefined, { shallow: true }),
    [router]
  );

  useEffect(() => {
    if (!router.isReady || !userData || hasHandledRouting.current) return;

    (async () => {
      if (userData?.formProgress === "COMPLETED") {
        await router.replace("/profile");
        return;
      } else {
        const queryPage = Number(router.query.page);

        const hasAnsweredExistingBusiness = userData.profileData.hasExistingBusiness !== undefined;
        const currentFlowInUserData = userData.profileData.hasExistingBusiness ? "OWNING" : "STARTING";
        const requestedPageIsInRange =
          queryPage <= onboardingFlows[currentFlowInUserData].pages.length && queryPage > 0;

        if (hasAnsweredExistingBusiness && requestedPageIsInRange) {
          setPage({ current: queryPage, previous: queryPage - 1 });
        } else {
          setPage({ current: 1, previous: 1 });
          queryShallowPush(1);
        }

        hasHandledRouting.current = true;
      }
    })();
  }, [
    router,
    router.isReady,
    router.query.page,
    userData,
    onboardingFlows,
    queryShallowPush,
    hasHandledRouting,
  ]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    let currentUserData = userData;
    if (!currentUserData) {
      currentUserData = createEmptyUserData(user);
    }

    const currentPageFlow = onboardingFlows[currentFlow].pages[page.current - 1];
    const errorMap = currentPageFlow.getErrorMap();
    if (errorMap) {
      if (errorMap.banner && errorMap.banner.some((error) => !error.valid)) {
        setError(errorMap.banner.find((error) => !error.valid)?.name);
        scrollToTop();
        headerRef.current?.focus();
        return;
      } else if (errorMap.inline && errorMap.inline.some((error) => !error.valid)) {
        setAlert("ERROR");
        onValidation(errorMap.inline.find((error) => !error.valid)?.name as ProfileFields, true);
        scrollToTop();
        headerRef.current?.focus();
        return;
      }
    }

    let newProfileData = profileData;

    const hasExistingBusinessChanged =
      profileData.hasExistingBusiness !== currentUserData.profileData.hasExistingBusiness;

    if (page.current === 1 && hasExistingBusinessChanged) {
      let initialOnboardingFlow = profileData.initialOnboardingFlow;
      if (currentUserData.formProgress !== "COMPLETED") {
        initialOnboardingFlow = profileData.hasExistingBusiness ? "OWNING" : "STARTING";
      }

      newProfileData = {
        initialOnboardingFlow: initialOnboardingFlow,
        businessName: profileData.businessName,
        industryId: profileData.hasExistingBusiness === true ? "generic" : undefined,
        homeBasedBusiness: profileData.homeBasedBusiness,
        liquorLicense: profileData.liquorLicense,
        municipality: profileData.municipality,
        hasExistingBusiness: profileData.hasExistingBusiness,
        cannabisLicenseType: undefined,
        legalStructureId: undefined,
        dateOfFormation: undefined,
        entityId: undefined,
        constructionRenovationPlan: undefined,
        employerId: undefined,
        taxId: undefined,
        notes: "",
        ownershipTypeIds: [],
        existingEmployees: undefined,
        taxPin: undefined,
        sectorId: undefined,
      };

      setProfileData(newProfileData);
      setCurrentFlow(profileData.hasExistingBusiness ? "OWNING" : "STARTING");
    }

    setAnalyticsDimensions(newProfileData);
    setAlert(undefined);
    setError(undefined);

    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    setSectionCompletion(getSectionCompletion(newRoadmap, currentUserData));

    if (page.current + 1 <= onboardingFlows[currentFlow].pages.length) {
      update({ ...currentUserData, user, profileData: newProfileData }, { local: true }).then(() => {
        const nextCurrentPage = page.current + 1;
        setPage({
          current: nextCurrentPage,
          previous: page.current,
        });
        queryShallowPush(nextCurrentPage);
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

      await update(newUserData);
      await router.push(newUserData.profileData.hasExistingBusiness ? "/dashboard" : "/roadmap");
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
      queryShallowPush(previousPage);
      headerRef.current?.focus();
    }
  };

  const evalHeaderStepsTemplate = (): string => {
    if (page.current === 1) {
      return templateEval(Config.onboardingDefaults.stepOneTemplate, {
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

  const redirectUrl = useMemo(
    () => (userData?.profileData.hasExistingBusiness ? "/dashboard" : "/roadmap"),
    [userData?.profileData.hasExistingBusiness]
  );

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          page: page.current,
          profileData: profileData,
          user: user,
          flow: currentFlow,
          displayContent: props.displayContent[currentFlow] as UserDisplayContent,
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
        <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
          <SingleColumnContainer>
            {header()}
            {!isLargeScreen && <hr />}
            {error && (
              <Alert dataTestid={`error-alert-${error}`} variant="error">
                {OnboardingErrorLookup[error]}
              </Alert>
            )}
            {alert && (
              <ToastAlert
                variant={OnboardingStatusLookup[alert].variant}
                isOpen={alert !== undefined}
                close={() => setAlert(undefined)}
              >
                <div data-testid={`toast-alert-${alert}`} className="h3-styling">
                  {OnboardingStatusLookup[alert].header}
                </div>
                <div className="padding-top-05">
                  {OnboardingStatusLookup[alert].body}{" "}
                  {OnboardingStatusLookup[alert] && (
                    <Link href={redirectUrl}>
                      <a href={redirectUrl} data-testid={`toast-link`}>
                        {OnboardingStatusLookup[alert].link}
                      </a>
                    </Link>
                  )}
                </div>
              </ToastAlert>
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
                <SingleColumnContainer>
                  <form
                    onSubmit={onSubmit}
                    className={`usa-prose onboarding-form margin-top-2`}
                    data-testid={`page-${index + 1}-form`}
                  >
                    {onboardingPage.component}
                    <hr className="margin-top-6 margin-bottom-4" aria-hidden={true} />
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
      displayContent: loadUserDisplayContent(),
      municipalities,
    },
  };
};

export default OnboardingPage;
