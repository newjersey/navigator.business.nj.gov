import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingEmployerId } from "@/components/onboarding/OnboardingEmployerId";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNotes } from "@/components/onboarding/OnboardingNotes";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { OnboardingTaxPin } from "@/components/onboarding/OnboardingTaxPin";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { ProfileDefaults } from "@/display-defaults/ProfileDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { loadUserDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import {
  createProfileFieldErrorMap,
  LoadDisplayContent,
  OnboardingStatus,
  ProfileFieldErrorMap,
  ProfileFields,
  UserDisplayContent,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { getSectionCompletion, OnboardingStatusLookup } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { RoadmapContext } from "@/pages/_app";
import { createEmptyProfileData, Municipality, ProfileData } from "@businessnjgovnavigator/shared";
import { CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import React, { FormEvent, ReactElement, useContext, useEffect, useState } from "react";

interface Props {
  displayContent: LoadDisplayContent;
  municipalities: Municipality[];
}

const ProfilePage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { setRoadmap, setSectionCompletion } = useContext(RoadmapContext);
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userData, update } = useUserData();
  const mergeDisplayContent = (): UserDisplayContent => {
    const hasBusiness = userData?.profileData.hasExistingBusiness ? "OWNING" : "STARTING";
    return {
      ...props.displayContent[hasBusiness],
      ...props.displayContent["PROFILE"],
    } as UserDisplayContent;
  };
  const [mergedDisplayContent] = useState(mergeDisplayContent());

  useEffect(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, [userData]);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  const onBack = () => {
    if (!userData) return;
    if (!userData?.profileData.hasExistingBusiness) {
      analytics.event.profile_back_to_roadmap.click.view_roadmap();
    }
    if (!deepEqual(profileData, userData.profileData)) {
      setEscapeModal(true);
    } else {
      userData?.profileData.hasExistingBusiness ? router.replace("/dashboard") : router.replace("/roadmap");
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;
    analytics.event.profile_save.click.save_profile_changes();
    if (Object.keys(fieldStates).some((k) => fieldStates[k as ProfileFields].invalid)) {
      setAlert("ERROR");
      return;
    }
    setIsLoading(true);
    setAnalyticsDimensions(profileData);
    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);
    setSectionCompletion(getSectionCompletion(newRoadmap, userData));

    console.log("before update");
    update({ ...userData, profileData: profileData, formProgress: "COMPLETED" }).then(async () => {
      console.log("then statement");
      setIsLoading(false);
      setAlert("SUCCESS");

      userData?.profileData.hasExistingBusiness
        ? router.push("/dashboard?success=true")
        : router.push("/roadmap?success=true");
    });
  };

  const startingNewBusiness = (
    <>
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingBusinessName />
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingIndustry />
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingLegalStructureDropdown />
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} h3Heading={true} />
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingEmployerId onValidation={onValidation} fieldStates={fieldStates} />
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingEntityId
        onValidation={onValidation}
        fieldStates={fieldStates}
        disabled={userData?.formationData?.getFilingResponse?.success}
      >
        <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />{" "}
      </OnboardingEntityId>
      <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} />
      <hr className="margin-top-4 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
      <OnboardingNotes />
    </>
  );

  const hasExistingBusiness = (
    <>
      <div className="margin-top-6">
        <Content>{mergedDisplayContent.businessInformation.contentMd}</Content>
      </div>
      <div className="margin-top-4">
        <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
      </div>
      <div className="margin-top-4">
        <OnboardingIndustry headerAriaLevel={3} />
      </div>
      <div className="margin-top-4">
        <OnboardingExistingEmployees
          onValidation={onValidation}
          fieldStates={fieldStates}
          headerAriaLevel={3}
        />
      </div>
      <div className="margin-top-4">
        <OnboardingMunicipality
          onValidation={onValidation}
          fieldStates={fieldStates}
          h3Heading={false}
          headerAriaLevel={3}
        />
      </div>
      <div className="margin-top-4">
        <OnboardingOwnership headerAriaLevel={3} />
      </div>
      <hr className="bg-base-lighter margin-top-3 margin-bottom-4" />
      <Content>{mergedDisplayContent.businessReferences.contentMd}</Content>
      <div className="margin-top-4">
        <OnboardingEmployerId onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
      </div>
      <div className="margin-top-4">
        <OnboardingEntityId onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
      </div>
      <div className="margin-top-4">
        <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
      </div>
      <div className="margin-top-4">
        <OnboardingTaxPin onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
      </div>
      <OnboardingNotes headerAriaLevel={3} />
    </>
  );

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          displayContent: mergedDisplayContent,
          flow: "PROFILE",
          municipalities: props.municipalities,
        },
        setProfileData,
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
              <button
                className="usa-button "
                onClick={() =>
                  userData?.profileData.hasExistingBusiness
                    ? router.replace("/dashboard")
                    : router.replace("/roadmap")
                }
                data-testid="return"
              >
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
                <div data-testid={`toast-alert-${alert}`} className="h3-styling">
                  {OnboardingStatusLookup[alert].header}
                </div>
                <div className="padding-top-05">{OnboardingStatusLookup[alert].body}</div>
              </ToastAlert>
            )}
            <UserDataErrorAlert />
          </SingleColumnContainer>

          <div className="margin-top-6 desktop:margin-top-0">
            <SinglePageLayout wrappedWithMain={false}>
              <SingleColumnContainer>
                {userData === undefined ? (
                  <SinglePageLayout>
                    <div className="fdr fjc fac">
                      <CircularProgress />
                      <div className="margin-left-2 h3-styling">Loading...</div>
                    </div>
                  </SinglePageLayout>
                ) : (
                  <>
                    <Content>{mergedDisplayContent.businessProfile.contentMd}</Content>
                    <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                      {userData?.profileData.hasExistingBusiness === true
                        ? hasExistingBusiness
                        : startingNewBusiness}

                      <hr className="margin-top-7 margin-bottom-2 bg-base-lighter" aria-hidden={true} />
                      <div className="float-right fdr">
                        <button
                          type="button"
                          className="usa-button usa-button--outline"
                          onClick={() => onBack()}
                          data-testid="back"
                        >
                          {ProfileDefaults.backButtonText}
                        </button>
                        <Button
                          style="primary"
                          typeSubmit
                          onClick={() => {}}
                          noRightMargin
                          dataTestid="save"
                          loading={isLoading}
                        >
                          {ProfileDefaults.saveButtonText}
                        </Button>
                      </div>
                    </form>{" "}
                  </>
                )}
              </SingleColumnContainer>
            </SinglePageLayout>
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

export default ProfilePage;
