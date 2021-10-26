import React, { FormEvent, ReactElement, useContext, useEffect, useState } from "react";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";

import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";

import { PageSkeleton } from "@/components/PageSkeleton";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import {
  createEmptyOnboardingData,
  createProfileFieldErrorMap,
  Municipality,
  OnboardingData,
  OnboardingDisplayContent,
  OnboardingError,
  ProfileFieldErrorMap,
  ProfileFields,
} from "@/lib/types/types";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ProfileDefaults } from "@/display-content/ProfileDefaults";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { OnboardingContext } from "@/pages/onboarding";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadOnboardingDisplayContent } from "@/lib/static/loadDisplayContent";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { RoadmapContext } from "@/pages/_app";
import { Alert } from "@/components/njwds/Alert";
import { NavBar } from "@/components/navbar/NavBar";
import { OnboardingErrorLookup } from "@/lib/utils/helpers";
import { LoadingButton } from "@/components/njwds-extended/LoadingButton";
import { OnboardingEmployerId } from "@/components/onboarding/OnboardingEmployerId";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { OnboardingNotes } from "@/components/onboarding/OnboardingNotes";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingName";

interface Props {
  displayContent: OnboardingDisplayContent;
  municipalities: Municipality[];
}

interface AlertProps {
  variant: "success" | "warning" | "error";
  body: string;
  header?: string;
  link?: string;
}
type OnboardingStatus = "SUCCESS";

const OnboardingStatusLookup: Record<OnboardingStatus, AlertProps> = {
  SUCCESS: {
    body: ProfileDefaults.successTextBody,
    header: ProfileDefaults.successTextHeader,
    link: ProfileDefaults.successTextLink,
    variant: "success",
  },
};

const ProfilePage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { setRoadmap } = useContext(RoadmapContext);
  const [onboardingData, _setOnboardingData] = useState<OnboardingData>(createEmptyOnboardingData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [error, setError] = useState<OnboardingError | undefined>(undefined);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const setOnboardingData = (value: OnboardingData): void => {
    if (value.municipality) {
      setError(undefined);
    }
    _setOnboardingData(value);
  };

  useEffect(() => {
    if (userData) {
      setOnboardingData(userData.onboardingData);
    }
  }, [userData]);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  const onBack = () => {
    if (!userData) return;
    if (!deepEqual(onboardingData, userData.onboardingData)) {
      setEscapeModal(true);
    } else {
      router.replace("/roadmap");
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;
    if (
      Object.keys(fieldStates).some((k) => fieldStates[k as ProfileFields].invalid) ||
      !onboardingData.municipality
    ) {
      if (!onboardingData.municipality) {
        setError("REQUIRED_MUNICIPALITY");
      }
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setAnalyticsDimensions(onboardingData);
    setRoadmap(await buildUserRoadmap(onboardingData));
    update({ ...userData, onboardingData, formProgress: "COMPLETED" }).then(async () => {
      setIsLoading(false);
      setAlert("SUCCESS");
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        state: {
          onboardingData,
          displayContent: props.displayContent,
          municipalities: props.municipalities,
        },
        setOnboardingData,
        onBack,
      }}
    >
      <PageSkeleton showLegalMessage={true}>
        <NavBar />

        <Dialog
          fullWidth={false}
          maxWidth="sm"
          open={escapeModal}
          onClose={() => setEscapeModal(false)}
          aria-labelledby="escape-modal"
        >
          <DialogTitle id="escape-modal">
            <div className="padding-top-5 padding-x-2 text-bold font-body-lg">
              {ProfileDefaults.escapeModalHeader}
            </div>
            <IconButton
              aria-label="close"
              onClick={() => setEscapeModal(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Icon className="usa-icon--size-4">close</Icon>
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="padding-x-2 padding-bottom-3">
              <p className="padding-bottom-1 font-body-xs">{ProfileDefaults.escapeModalBody}</p>
              <button className="usa-button " onClick={() => router.replace("/roadmap")} data-testid="return">
                {ProfileDefaults.escapeModalReturn}
              </button>
              <button
                className="usa-button usa-button--outline margin-right-0"
                onClick={() => setEscapeModal(false)}
                data-testid="escape"
              >
                {ProfileDefaults.escapeModalEscape}
              </button>
            </div>
          </DialogContent>
        </Dialog>
        <main className="usa-section padding-top-0 desktop:padding-top-3" id="main">
          <SingleColumnContainer>
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
                  {OnboardingStatusLookup[alert].body}
                  <Link href="/roadmap">
                    <a href="/roadmap" data-testid={`toast-link`}>
                      {" "}
                      {OnboardingStatusLookup[alert].link}
                    </a>
                  </Link>
                </div>
              </ToastAlert>
            )}
            <UserDataErrorAlert />
          </SingleColumnContainer>

          <div className="margin-top-6 desktop:margin-top-0">
            <SinglePageLayout wrappedWithMain={false}>
              <UserDataErrorAlert />
              <SingleColumnContainer>
                <div role="heading" aria-level={1} className="h1-element">
                  {ProfileDefaults.pageTitle}
                </div>
                <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                  <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
                  <OnboardingBusinessName />
                  <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
                  <OnboardingIndustry />
                  <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
                  <OnboardingLegalStructure />
                  <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
                  {error && error === "REQUIRED_MUNICIPALITY" && (
                    <Alert
                      data-testid={`error-alert-REQUIRED_MUNICIPALITY`}
                      slim
                      variant="error"
                      className="margin-y-2"
                    >
                      {OnboardingErrorLookup[error]}
                    </Alert>
                  )}
                  <OnboardingMunicipality />
                  <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
                  <OnboardingEmployerId onValidation={onValidation} fieldStates={fieldStates} />
                  <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
                  <OnboardingEntityId onValidation={onValidation} fieldStates={fieldStates}>
                    <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
                  </OnboardingEntityId>
                  <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} />
                  <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
                  <OnboardingNotes />
                  <hr className="margin-top-6 margin-bottom-4 bg-base-lighter" aria-hidden={true} />
                  <div className="float-right fdr">
                    <button
                      type="button"
                      className="usa-button usa-button--outline"
                      onClick={() => onBack()}
                      data-testid="back"
                    >
                      {ProfileDefaults.backButtonText}
                    </button>
                    <LoadingButton
                      onClick={() => {}}
                      loading={isLoading}
                      className="usa-button margin-right-0"
                      type="submit"
                      data-testid="save"
                    >
                      {ProfileDefaults.saveButtonText}
                    </LoadingButton>
                  </div>
                </form>
              </SingleColumnContainer>
            </SinglePageLayout>
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

export default ProfilePage;
