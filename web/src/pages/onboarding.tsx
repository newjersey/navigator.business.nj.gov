import React, {
  FormEvent,
  ReactElement,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mui/material";
import { CSSTransition } from "react-transition-group";
import { GetStaticPropsResult } from "next";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  createEmptyProfileData,
  createEmptyProfileDisplayContent,
  createProfileFieldErrorMap,
  OnboardingStatus,
  ProfileDisplayContent,
  ProfileError,
  ProfileFieldErrorMap,
  ProfileFields,
} from "@/lib/types/types";
import { MediaQueries } from "@/lib/PageSizes";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { OnboardingDefaults } from "@/display-defaults/onboarding/OnboardingDefaults";
import {
  OnboardingErrorLookup,
  OnboardingStatusLookup,
  scrollToTop,
  templateEval,
} from "@/lib/utils/helpers";
import { loadProfileDisplayContent } from "@/lib/static/loadDisplayContent";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { Alert } from "@/components/njwds/Alert";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { RoadmapContext } from "@/pages/_app";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { NextSeo } from "next-seo";
import { Municipality, ProfileData } from "@businessnjgovnavigator/shared";
import Link from "next/link";
import { FlowType, getOnboardingFlows } from "@/components/onboarding/getOnboardingFlows";

interface Props {
  displayContent: ProfileDisplayContent;
  municipalities: Municipality[];
}

interface OnboardingState {
  page?: number;
  profileData: ProfileData;
  displayContent: ProfileDisplayContent;
  municipalities: Municipality[];
}

interface OnboardingContextType {
  state: OnboardingState;
  setProfileData: (profileData: ProfileData) => void;
  onBack: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType>({
  state: {
    page: 1,
    profileData: createEmptyProfileData(),
    displayContent: createEmptyProfileDisplayContent(),
    municipalities: [],
  },
  setProfileData: () => {},
  onBack: () => {},
});

const OnboardingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { setRoadmap } = useContext(RoadmapContext);

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

  const shouldDisableOscarFlow = process.env.FEATURE_DISABLE_OSCAR_ONBOARDING === "true";

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
          entityId: undefined,
          constructionRenovationPlan: undefined,
          employerId: undefined,
          taxId: undefined,
          notes: "",
          certificationIds: [],
          existingEmployees: undefined,
        };

        setProfileData(newProfileData);
        setCurrentFlow(profileData.hasExistingBusiness ? "OWNING" : "STARTING");
      }
    }

    setAnalyticsDimensions(newProfileData);
    setAlert(undefined);
    setError(undefined);

    setRoadmap(await buildUserRoadmap(newProfileData));

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
        await router.push("/roadmap");
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
      className={`margin-y-2 desktop:margin-y-0 desktop:padding-bottom-4 ${
        isLargeScreen ? "h1-element" : "h2-element font-heading-xl"
      }`}
    >
      {OnboardingDefaults.pageTitle}{" "}
      <span className="weight-400" data-testid={`step-${page.current.toString()}`}>
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
    <OnboardingContext.Provider
      value={{
        state: {
          page: page.current,
          profileData: profileData,
          displayContent: props.displayContent,
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
                <div data-testid={`toast-alert-${alert}`} className="h3-element">
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
                  <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                    {onboardingPage.component}
                    <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
                    <OnboardingButtonGroup />
                  </form>
                </SingleColumnContainer>
              </CSSTransition>
            ))}
          </div>
        </main>
      </PageSkeleton>
    </OnboardingContext.Provider>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  const municipalities = await loadAllMunicipalities();

  return {
    props: {
      displayContent: loadProfileDisplayContent(),
      municipalities,
    },
  };
};

export default OnboardingPage;
