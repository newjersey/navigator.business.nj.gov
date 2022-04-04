import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingEmployerId } from "@/components/onboarding/OnboardingEmployerId";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNotes } from "@/components/onboarding/OnboardingNotes";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { OnboardingTaxPin } from "@/components/onboarding/OnboardingTaxPin";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TwoButtonDialog } from "@/components/TwoButtonDialog";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
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
import { getSectionCompletion, OnboardingStatusLookup, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import { RoadmapContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyProfileData, Municipality, ProfileData, UserData } from "@businessnjgovnavigator/shared";
import { CircularProgress } from "@mui/material";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import React, { FormEvent, ReactElement, useContext, useMemo, useState } from "react";

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
  const mergedDisplayContent = useMemo(mergeDisplayContent, [
    props.displayContent,
    userData?.profileData.hasExistingBusiness,
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (params?: { [key: string]: any }, routerType = router.push) =>
    router.query.path === "businessFormation"
      ? routerType("/tasks/form-business-entity")
      : userData?.profileData.hasExistingBusiness
      ? routerType(`/dashboard${params ? `?${new URLSearchParams(params).toString()}` : ""}`)
      : routerType(`/roadmap${params ? `?${new URLSearchParams(params).toString()}` : ""}`);

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

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
      redirect(undefined, router.replace);
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

    let newUserData: UserData = { ...userData, profileData: profileData, formProgress: "COMPLETED" };
    setSectionCompletion(getSectionCompletion(newRoadmap, newUserData));
    newUserData = await postGetAnnualFilings(newUserData);

    update(newUserData).then(async () => {
      setIsLoading(false);
      setAlert("SUCCESS");
      redirect({ success: true });
    });
  };

  const startingNewBusiness = (
    <>
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingBusinessName disabled={userData?.formationData.getFilingResponse?.success} />
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingLegalStructureDropdown />
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} h3Heading={true} />
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingEmployerId onValidation={onValidation} fieldStates={fieldStates} />
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingEntityId
        onValidation={onValidation}
        fieldStates={fieldStates}
        disabled={userData?.formationData?.getFilingResponse?.success}
      >
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      </OnboardingEntityId>
      <OnboardingTaxId onValidation={onValidation} fieldStates={fieldStates} />
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <OnboardingNotes />
    </>
  );

  const hasExistingBusiness = (
    <>
      <div className="margin-top-6">
        <Content>{mergedDisplayContent.businessInformation.contentMd}</Content>
      </div>
      <div className="margin-top-4">
        <OnboardingBusinessName
          onValidation={onValidation}
          fieldStates={fieldStates}
          headerAriaLevel={3}
          disabled={userData?.formationData.getFilingResponse?.success}
        />
      </div>
      <div className="margin-top-4">
        <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
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
      <hr className="margin-top-3 margin-bottom-4" />
      <Content>{mergedDisplayContent.businessReferences.contentMd}</Content>
      <div className="margin-top-4">
        <OnboardingEmployerId onValidation={onValidation} fieldStates={fieldStates} headerAriaLevel={3} />
      </div>
      <div className="margin-top-4">
        <OnboardingEntityId
          onValidation={onValidation}
          fieldStates={fieldStates}
          headerAriaLevel={3}
          disabled={userData?.formationData.getFilingResponse?.success}
        />
      </div>
      <div className="margin-top-4">
        <OnboardingDateOfFormation
          onValidation={onValidation}
          fieldStates={fieldStates}
          headerAriaLevel={3}
          disabled={userData?.formationData.getFilingResponse?.success}
        />
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
        setUser: () => {},
        setProfileData,
        onBack,
      }}
    >
      <PageSkeleton showLegalMessage={true}>
        <NavBar />
        <TwoButtonDialog
          isOpen={escapeModal}
          close={() => setEscapeModal(false)}
          title={Config.profileDefaults.escapeModalHeader}
          body={Config.profileDefaults.escapeModalBody}
          primaryButtonText={Config.profileDefaults.escapeModalReturn}
          primaryButtonOnClick={() => redirect()}
          secondaryButtonText={Config.profileDefaults.escapeModalEscape}
        />
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
                    <div className="flex flex-justify-center flex-align-center">
                      <CircularProgress
                        id="profilePage"
                        aria-label="profile page progress bar"
                        aria-busy={true}
                      />
                      <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
                    </div>
                  </SinglePageLayout>
                ) : (
                  <>
                    <Content>{mergedDisplayContent.businessProfile.contentMd}</Content>
                    <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                      {userData?.profileData.hasExistingBusiness === true
                        ? hasExistingBusiness
                        : startingNewBusiness}

                      <hr className="margin-top-7 margin-bottom-2" aria-hidden={true} />
                      <div className="float-right fdr">
                        <Button style="secondary" onClick={() => onBack()} dataTestid="back">
                          {Config.profileDefaults.backButtonText}
                        </Button>
                        <Button
                          style="primary"
                          typeSubmit
                          onClick={() => {}}
                          noRightMargin
                          dataTestid="save"
                          loading={isLoading}
                        >
                          {Config.profileDefaults.saveButtonText}
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
