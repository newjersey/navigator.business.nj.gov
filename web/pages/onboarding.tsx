import React, { FormEvent, ReactElement, ReactNode, useEffect, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { useRouter } from "next/router";
import { useUserData } from "../lib/data-hooks/useUserData";
import {
  createEmptyOnboardingData,
  createEmptyOnboardingDisplayContent,
  Municipality,
  OnboardingData,
  OnboardingDisplayContent,
} from "../lib/types/types";
import { useMediaQuery } from "@material-ui/core";
import { MediaQueries } from "../lib/PageSizes";
import SwipeableViews from "react-swipeable-views";
import { SingleColumnContainer } from "../components/njwds/SingleColumnContainer";
import { MobilePageTitle } from "../components/njwds/MobilePageTitle";
import { OnboardingBusinessName } from "../components/onboarding/OnboardingName";
import { OnboardingIndustry } from "../components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "../components/onboarding/OnboardingLegalStructure";
import { GetStaticPropsResult } from "next";
import { loadOnboardingDisplayContent } from "../lib/static/loadOnboardingDisplayContent";
import { OnboardingButtonGroup } from "../components/onboarding/OnboardingButtonGroup";
import { loadAllMunicipalities } from "../lib/static/loadMunicipalities";
import { OnboardingMunicipality } from "../components/onboarding/OnboardingMunicipality";

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

const Onboarding = (props: Props): ReactElement => {
  const PAGES = 4;
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(createEmptyOnboardingData());
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);

  useEffect(() => {
    if (userData) {
      setOnboardingData(userData.onboardingData);
    }
  }, [userData]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;
    if (page + 1 <= PAGES) {
      await update({
        ...userData,
        onboardingData,
      });
      setPage(page + 1);
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
    if (page + 1 > 0) {
      setPage(page - 1);
    }
  };

  const header = () => (
    <>
      Onboarding{" "}
      <span className="weight-400">
        Step {page} of {PAGES}
      </span>
    </>
  );

  const asOnboardingPage = (page: ReactNode) => (
    <SingleColumnContainer>
      <form onSubmit={onSubmit} className="usa-prose">
        {page}
        <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" />
        <OnboardingButtonGroup />
      </form>
    </SingleColumnContainer>
  );

  return (
    <OnboardingContext.Provider
      value={{
        state: {
          page,
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
          </SingleColumnContainer>
          <SwipeableViews index={page - 1} disabled={true}>
            {asOnboardingPage(<OnboardingBusinessName />)}
            {asOnboardingPage(<OnboardingIndustry />)}
            {asOnboardingPage(<OnboardingLegalStructure />)}
            {asOnboardingPage(<OnboardingMunicipality />)}
          </SwipeableViews>
        </main>
      </PageSkeleton>
    </OnboardingContext.Provider>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  const municipalities = await loadAllMunicipalities();

  return {
    props: {
      displayContent: await loadOnboardingDisplayContent(),
      municipalities,
    },
  };
};

export default Onboarding;
