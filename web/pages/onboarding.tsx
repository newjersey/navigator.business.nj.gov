import React, {
  FormEvent,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useMediaQuery } from "@material-ui/core";
import { CSSTransition } from "react-transition-group";
import { GetStaticPropsResult } from "next";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  createEmptyOnboardingData,
  createEmptyOnboardingDisplayContent,
  Municipality,
  OnboardingData,
  OnboardingDisplayContent,
} from "@/lib/types/types";
import { MediaQueries } from "@/lib/PageSizes";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { MobilePageTitle } from "@/components/njwds/MobilePageTitle";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingName";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingButtonGroup } from "@/components/onboarding/OnboardingButtonGroup";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingDefaults } from "@/display-content/onboarding/OnboardingDefaults";
import { scrollToTop, templateEval } from "@/lib/utils/helpers";
import { loadOnboardingDisplayContent } from "@/lib/static/loadDisplayContent";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { Alert } from "@/components/njwds/Alert";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { RoadmapContext } from "@/pages/_app";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";

interface Props {
  displayContent: OnboardingDisplayContent;
  municipalities: Municipality[];
}

interface OnboardingState {
  page: number;
  onboardingData: OnboardingData;
  displayContent: OnboardingDisplayContent;
  municipalities: Municipality[];
}

interface OnboardingContextType {
  state: OnboardingState;
  setOnboardingData: (onboardingData: OnboardingData) => void;
  onBack: () => void;
}

export const OnboardingContext = createContext<OnboardingContextType>({
  state: {
    page: 1,
    onboardingData: createEmptyOnboardingData(),
    displayContent: createEmptyOnboardingDisplayContent(),
    municipalities: [],
  },
  setOnboardingData: () => {},
  onBack: () => {},
});

type OnboardingError = "REQUIRED_LEGAL" | "REQUIRED_MUNICIPALITY";
const OnboardingErrorLookup: Record<OnboardingError, string> = {
  REQUIRED_LEGAL: OnboardingDefaults.errorTextRequiredLegal,
  REQUIRED_MUNICIPALITY: OnboardingDefaults.errorTextRequiredMunicipality,
};

const OnboardingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { setRoadmap } = useContext(RoadmapContext);

  const PAGES = 4;
  const router = useRouter();
  const [page, setPage] = useState<{ current: number; previous: number }>({ current: 1, previous: 1 });
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(createEmptyOnboardingData());
  const [error, setError] = useState<OnboardingError | undefined>(undefined);
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);

  useEffect(() => {
    if (userData) {
      setOnboardingData(userData.onboardingData);
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

    if (page.current === 3 && !onboardingData.legalStructure) {
      setError("REQUIRED_LEGAL");
      scrollToTop();
      return;
    }
    if (page.current === 4 && !onboardingData.municipality) {
      setError("REQUIRED_MUNICIPALITY");
      scrollToTop();
      return;
    }

    setAnalyticsDimensions(onboardingData);
    setError(undefined);

    setRoadmap(await buildUserRoadmap(onboardingData));

    if (page.current + 1 <= PAGES) {
      update({ ...userData, onboardingData }).then(() => {
        const nextCurrentPage = page.current + 1;
        setPage({
          current: nextCurrentPage,
          previous: page.current,
        });
        queryShallowPush(nextCurrentPage);
      });
    } else {
      update({ ...userData, onboardingData, formProgress: "COMPLETED" }).then(async () => {
        await router.push("/roadmap");
      });
    }
  };

  const onBack = () => {
    if (page.current + 1 > 0) {
      setError(undefined);
      const previousPage = page.current - 1;
      setPage({
        current: previousPage,
        previous: page.current,
      });
      queryShallowPush(previousPage);
    }
  };

  const header = () => (
    <>
      {OnboardingDefaults.pageTitle}{" "}
      <span className="weight-400" data-testid={`step-${page.current.toString()}`}>
        {templateEval(OnboardingDefaults.stepXofYTemplate, {
          currentPage: page.current.toString(),
          totalPages: PAGES.toString(),
        })}
      </span>
    </>
  );

  const asOnboardingPage = (onboardingPage: ReactNode) => (
    <SingleColumnContainer>
      <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
        {onboardingPage}
        <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
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
          onboardingData,
          displayContent: props.displayContent,
          municipalities: props.municipalities,
        },
        setOnboardingData,
        onBack,
      }}
    >
      <PageSkeleton>
        <MobilePageTitle>{header()}</MobilePageTitle>
        <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
          <SingleColumnContainer>
            {isLargeScreen && <h2 className="padding-bottom-4">{header()}</h2>}
            {error && (
              <Alert data-testid={`error-alert-${error}`} slim variant="error" className="margin-y-2">
                {OnboardingErrorLookup[error]}
              </Alert>
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
              {asOnboardingPage(<OnboardingMunicipality />)}
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
      displayContent: loadOnboardingDisplayContent(),
      municipalities,
    },
  };
};

export default OnboardingPage;
