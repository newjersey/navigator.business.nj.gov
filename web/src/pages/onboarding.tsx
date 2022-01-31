import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Alert } from "@/components/njwds/Alert";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getOnboardingFlows } from "@/components/onboarding/getOnboardingFlows";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
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
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import {
  featureFlags,
  getSectionCompletion,
  OnboardingErrorLookup,
  OnboardingStatusLookup,
  scrollToTop,
  templateEval,
} from "@/lib/utils/helpers";
import { RoadmapContext } from "@/pages/_app";
import { createEmptyProfileData, Municipality, ProfileData } from "@businessnjgovnavigator/shared";
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
  displayContent: UserDisplayContent;
  flow?: UserContentType;
  municipalities: Municipality[];
}

interface ProfileDataContextType {
  state: ProfileDataState;
  setProfileData: (profileData: ProfileData) => void;
  onBack: () => void;
}

export const ProfileDataContext = createContext<ProfileDataContextType>({
  state: {
    page: 1,
    profileData: createEmptyProfileData(),
    flow: "STARTING",
    displayContent: createEmptyUserDisplayContent(),
    municipalities: [],
  },
  setProfileData: () => {},
  onBack: () => {},
});

const OnboardingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { setRoadmap, setSectionCompletion } = useContext(RoadmapContext);

  const router = useRouter();
  const [page, setPage] = useState<{ current: number; previous: number }>({ current: 1, previous: 1 });
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [currentFlow, setCurrentFlow] = useState<FlowType>("STARTING");
  const hasHandledRouting = useRef<boolean>(false);

  const { featureDisableOscarOnboarding: shouldDisableOscarFlow } = featureFlags(router.query);
  const onValidation = useCallback(
    (field: ProfileFields, invalid: boolean): void => {
      setFieldStates({ ...fieldStates, [field]: { invalid } });
    },
    [setFieldStates, fieldStates]
  );

  const onboardingFlows = useMemo(() => {
    const onboardingFlows = getOnboardingFlows(profileData, onValidation, fieldStates);
    if (shouldDisableOscarFlow) {
      return {
        STARTING: { pages: onboardingFlows.STARTING.pages.slice(1) },
        OWNING: { pages: onboardingFlows.OWNING.pages.slice(1) },
      };
    }
    return onboardingFlows;
  }, [profileData, onValidation, fieldStates, shouldDisableOscarFlow]);

  useEffect(() => {
    if (userData) {
      setProfileData(userData.profileData);
      if (!shouldDisableOscarFlow) {
        setCurrentFlow(userData.profileData.hasExistingBusiness ? "OWNING" : "STARTING");
      }
    }
  }, [userData, shouldDisableOscarFlow, setProfileData]);

  const queryShallowPush = useCallback(
    (page: number) => router.push({ query: { page: page } }, undefined, { shallow: true }),
    [router]
  );

  useEffect(() => {
    if (!router.isReady || !userData || hasHandledRouting.current) return;

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
  }, [router.isReady, router.query.page, userData, onboardingFlows, queryShallowPush, hasHandledRouting]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;

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
    if (shouldDisableOscarFlow) {
      newProfileData = {
        ...profileData,
        hasExistingBusiness: false,
      };
      setProfileData(newProfileData);
    } else {
      const hasExistingBusinessChanged =
        profileData.hasExistingBusiness !== userData.profileData.hasExistingBusiness;

      if (page.current === 1 && hasExistingBusinessChanged) {
        newProfileData = {
          businessName: profileData.businessName,
          industryId: profileData.industryId,
          homeBasedBusiness: profileData.homeBasedBusiness,
          liquorLicense: profileData.liquorLicense,
          municipality: profileData.municipality,
          hasExistingBusiness: profileData.hasExistingBusiness,
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
        };

        setProfileData(newProfileData);
        setCurrentFlow(profileData.hasExistingBusiness ? "OWNING" : "STARTING");
      }
    }

    setAnalyticsDimensions(newProfileData);
    setAlert(undefined);
    setError(undefined);

    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    setSectionCompletion(getSectionCompletion(newRoadmap, userData));

    if (page.current + 1 <= onboardingFlows[currentFlow].pages.length) {
      update({ ...userData, profileData: newProfileData }).then(() => {
        const nextCurrentPage = page.current + 1;
        setPage({
          current: nextCurrentPage,
          previous: page.current,
        });
        queryShallowPush(nextCurrentPage);
        headerRef.current?.focus();
      });
    } else {
      update({ ...userData, profileData: newProfileData, formProgress: "COMPLETED" }).then(async () => {
        if (newProfileData.hasExistingBusiness) {
          await router.push("/dashboard");
        } else {
          await router.push("/roadmap");
        }
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
      queryShallowPush(previousPage);
      headerRef.current?.focus();
    }
  };

  const evalHeaderStepsTemplate = (): string => {
    if (page.current === 1 && !shouldDisableOscarFlow) {
      return templateEval(OnboardingDefaults.stepOneTemplate, {
        currentPage: page.current.toString(),
      });
    } else {
      return templateEval(OnboardingDefaults.stepXofYTemplate, {
        currentPage: page.current.toString(),
        totalPages: onboardingFlows[currentFlow].pages.length.toString(),
      });
    }
  };

  const header = () => (
    <div
      ref={headerRef}
      role="heading"
      aria-level={1}
      className={`margin-y-2 desktop:margin-y-0 desktop:padding-bottom-4 h2-styling`}
    >
      {OnboardingDefaults.pageTitle}{" "}
      <span className="text-light" data-testid={`step-${page.current.toString()}`}>
        {evalHeaderStepsTemplate()}
      </span>
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
          flow: currentFlow,
          displayContent: props.displayContent[currentFlow] as UserDisplayContent,
          municipalities: props.municipalities,
        },
        setProfileData,
        onBack,
      }}
    >
      <NextSeo
        title={`Business.NJ.gov Navigator - ${OnboardingDefaults.pageTitle} ${evalHeaderStepsTemplate()} `}
      />
      <PageSkeleton>
        <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
          <SingleColumnContainer>
            {header()}
            {!isLargeScreen && <hr className="bg-base-lighter" />}
            {error && (
              <Alert data-testid={`error-alert-${error}`} slim variant="error" className="margin-y-2">
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
                    <Link href="/roadmap">
                      <a href="/roadmap" data-testid={`toast-link`}>
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
                    <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
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
