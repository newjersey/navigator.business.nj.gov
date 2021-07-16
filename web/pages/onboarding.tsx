import React, { FormEvent, ReactElement, ReactNode, useEffect, useState } from "react";
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
import { templateEval } from "@/lib/utils/helpers";
import { loadOnboardingDisplayContent } from "@/lib/static/loadDisplayContent";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { Alert } from "@/components/njwds/Alert";

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

export const OnboardingContext = React.createContext<OnboardingContextType>({
  state: {
    page: 1,
    onboardingData: createEmptyOnboardingData(),
    displayContent: createEmptyOnboardingDisplayContent(),
    municipalities: [],
  },
  setOnboardingData: () => {},
  onBack: () => {},
});

type OnboardingError = "REQUIRED";
const OnboardingErrorLookup: Record<OnboardingError, string> = {
  REQUIRED: OnboardingDefaults.errorTextRequired,
};

const OnboardingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

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

  const queryShallowPush = (page: number) =>
    router.push(
      {
        query: { page: page },
      },
      undefined,
      { shallow: true }
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
  }, [router.isReady]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;

    if (
      (page.current === 3 && !onboardingData.legalStructure) ||
      (page.current === 4 && !onboardingData.municipality)
    ) {
      setError("REQUIRED");
      return;
    }

    setError(undefined);
    if (page.current + 1 <= PAGES) {
      await update({
        ...userData,
        onboardingData,
      });
      const nextCurrentPage = page.current + 1;
      setPage({
        current: nextCurrentPage,
        previous: page.current,
      });
      queryShallowPush(nextCurrentPage);
    } else {
      await update({
        ...userData,
        onboardingData,
        formProgress: "COMPLETED",
      });
      await router.push("/roadmap");
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
        <main className="usa-section">
          <SingleColumnContainer>
            {isLargeScreen && <h2 className="padding-bottom-4">{header()}</h2>}
            {error && (
              <Alert data-testid={`error-alert-${error}`} slim variant="error" className="margin-y-2">
                {OnboardingErrorLookup[error]}
              </Alert>
            )}
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
