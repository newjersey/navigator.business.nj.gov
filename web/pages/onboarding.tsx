import React, { FormEvent, ReactElement, useEffect, useState } from "react";
import { PageSkeleton } from "../components/PageSkeleton";
import { useRouter } from "next/router";
import { useUserData } from "../lib/data/useUserData";
import {
  createEmptyOnboardingData,
  createEmptyOnboardingDisplayContent,
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
import { getOnboardingDisplayContent } from "../lib/static/loadOnboardingDisplayContent";

interface Props {
  displayContent: OnboardingDisplayContent;
}

interface OnboardingState {
  page: number;
  onboardingData: OnboardingData;
  displayContent: OnboardingDisplayContent;
}

interface OnboardingContextType {
  state: OnboardingState;
  setOnboardingData: (onboardingData: OnboardingData) => void;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const OnboardingContext = React.createContext<OnboardingContextType>({
  state: {
    page: 1,
    onboardingData: createEmptyOnboardingData(),
    displayContent: createEmptyOnboardingDisplayContent(),
  },
  setOnboardingData: () => {},
  onBack: () => {},
  onSubmit: () => {},
});

const Onboarding = (props: Props): ReactElement => {
  const PAGES = 3;
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

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!userData) return;
    if (page + 1 <= PAGES) {
      update({
        ...userData,
        onboardingData,
      });
      setPage(page + 1);
    } else {
      update({
        ...userData,
        onboardingData,
        formProgress: "COMPLETED",
      });
      router.push("/roadmap");
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

  if (!userData) {
    return <></>;
  }

  return (
    <OnboardingContext.Provider
      value={{
        state: { page, onboardingData, displayContent: props.displayContent },
        setOnboardingData,
        onBack,
        onSubmit,
      }}
    >
      <PageSkeleton>
        <MobilePageTitle>{header()}</MobilePageTitle>
        <main className="usa-section">
          <SingleColumnContainer>
            {isLargeScreen && <h2 className="padding-bottom-4">{header()}</h2>}
          </SingleColumnContainer>
          <SwipeableViews index={page - 1} disabled={true}>
            <SingleColumnContainer>
              <OnboardingBusinessName />
            </SingleColumnContainer>
            <SingleColumnContainer>
              <OnboardingIndustry />
            </SingleColumnContainer>
            <SingleColumnContainer>
              <OnboardingLegalStructure />
            </SingleColumnContainer>
          </SwipeableViews>
        </main>
      </PageSkeleton>
    </OnboardingContext.Provider>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      displayContent: getOnboardingDisplayContent(),
    },
  };
};

export default Onboarding;
