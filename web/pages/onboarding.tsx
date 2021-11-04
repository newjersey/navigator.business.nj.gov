import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
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
  ProfileData,
  ProfileDisplayContent,
  ProfileError,
  ProfileFieldErrorMap,
  ProfileFields,
} from "@/lib/types/types";
import { MediaQueries } from "@/lib/PageSizes";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingName";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
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
import { Municipality } from "@businessnjgovnavigator/shared";
import Link from "next/link";

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

  const PAGES = 4;
  const router = useRouter();
  const [page, setPage] = useState<{ current: number; previous: number }>({ current: 1, previous: 1 });
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [error, setError] = useState<ProfileError | undefined>(undefined);
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const headerRef = useRef<HTMLDivElement>(null);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  useEffect(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, [userData]);

  const queryShallowPush = useCallback(
    (page: number) =>
      router.push(
        {
          query: { page: page },
        },
        undefined,
        { shallow: true }
      ),
    [router]
  );

  useEffect(() => {
    if (!router.isReady) return;
    const queryPage = Number(router.query.page);
    if (isNaN(queryPage)) {
      const startPage = 1;
      setPage({
        current: startPage,
        previous: startPage,
      });
      queryShallowPush(startPage);
    } else if (queryPage <= PAGES && queryPage > 0) {
      const queryPagePrevious = queryPage - 1;
      setPage({
        current: queryPage,
        previous: queryPagePrevious,
      });
    } else {
      router.push("/onboarding?page=1");
    }
  }, [router.isReady, router, queryShallowPush]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;

    if (page.current === 3 && !profileData.legalStructureId) {
      setError("REQUIRED_LEGAL");
      scrollToTop();
      headerRef.current?.focus();
      return;
    }
    if (page.current === 4 && !profileData.municipality) {
      setAlert("ERROR");
      setFieldStates({ ...fieldStates, municipality: { invalid: true } });
      scrollToTop();
      headerRef.current?.focus();
      return;
    }

    setAnalyticsDimensions(profileData);
    setAlert(undefined);
    setError(undefined);

    setRoadmap(await buildUserRoadmap(profileData));

    if (page.current + 1 <= PAGES) {
      update({ ...userData, profileData: profileData }).then(() => {
        const nextCurrentPage = page.current + 1;
        setPage({
          current: nextCurrentPage,
          previous: page.current,
        });
        queryShallowPush(nextCurrentPage);
        headerRef.current?.focus();
      });
    } else {
      update({ ...userData, profileData: profileData, formProgress: "COMPLETED" }).then(async () => {
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
        {templateEval(OnboardingDefaults.stepXofYTemplate, {
          currentPage: page.current.toString(),
          totalPages: PAGES.toString(),
        })}
      </span>
    </div>
  );

  const asOnboardingPage = (onboardingPage: ReactNode) => (
    <SingleColumnContainer>
      <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
        {onboardingPage}
        <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
        <OnboardingButtonGroup />
      </form>
    </SingleColumnContainer>
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
        title={`Business.NJ.gov Navigator - ${OnboardingDefaults.pageTitle} ${templateEval(
          OnboardingDefaults.stepXofYTemplate,
          {
            currentPage: page.current.toString(),
            totalPages: PAGES.toString(),
          }
        )} `}
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
            <CSSTransition
              in={page.current === 1}
              unmountOnExit
              timeout={getTimeout(1)}
              classNames={`width-100 ${getAnimation()}`}
            >
              {asOnboardingPage(<OnboardingBusinessName />)}
            </CSSTransition>
            <CSSTransition
              in={page.current === 2}
              unmountOnExit
              timeout={getTimeout(2)}
              classNames={`width-100 ${getAnimation()}`}
            >
              {asOnboardingPage(<OnboardingIndustry />)}
            </CSSTransition>
            <CSSTransition
              in={page.current === 3}
              unmountOnExit
              timeout={getTimeout(3)}
              classNames={`width-100 ${getAnimation()}`}
            >
              {asOnboardingPage(<OnboardingLegalStructure />)}
            </CSSTransition>
            <CSSTransition
              in={page.current === 4}
              unmountOnExit
              timeout={getTimeout(4)}
              classNames={`width-100 ${getAnimation()}`}
            >
              {asOnboardingPage(
                <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
              )}
            </CSSTransition>
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
