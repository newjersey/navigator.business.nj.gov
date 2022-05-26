import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { Icon } from "@/components/njwds/Icon";
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
import { ProfileNaicsCode } from "@/components/onboarding/ProfileNaicsCode";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Documents } from "@/components/profile/Documents";
import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileToastAlert } from "@/components/profile/ProfileToastAlert";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import {
  createProfileFieldErrorMap,
  OnboardingStatus,
  ProfileFieldErrorMap,
  ProfileFields,
  ProfileTabs,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { getFlow, getSectionCompletion, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  createEmptyFormationFormData,
  createEmptyProfileData,
  LookupLegalStructureById,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { Box, CircularProgress } from "@mui/material";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import React, { FormEvent, ReactElement, ReactNode, useContext, useState } from "react";

interface Props {
  municipalities: Municipality[];
  CMS_ONLY_hasExistingBusiness?: boolean; // for CMS only
  CMS_ONLY_tab?: ProfileTabs; // for CMS only
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
  CMS_ONLY_showEscapeModal?: boolean; // for CMS only
  CMS_ONLY_showSuccessAlert?: boolean; // for CMS only
  CMS_ONLY_showErrorAlert?: boolean; // for CMS only
}

const ProfilePage = (props: Props): ReactElement => {
  const { setRoadmap, setSectionCompletion } = useContext(RoadmapContext);
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userDataFromHook = useUserData();
  const update = userDataFromHook.update;
  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);
  const [profileTab, setProfileTab] = useState<ProfileTabs>(props.CMS_ONLY_tab ?? "info");
  const { Config } = useConfig();

  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const hasExistingBusiness = props.CMS_ONLY_hasExistingBusiness ?? userData?.profileData.hasExistingBusiness;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (params?: { [key: string]: any }, routerType = router.push) =>
    router.query.path === "businessFormation"
      ? routerType("/tasks/form-business-entity")
      : hasExistingBusiness
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
    if (!hasExistingBusiness) {
      analytics.event.profile_back_to_roadmap.click.view_roadmap();
    }
    if (!deepEqual(profileData, userData.profileData)) {
      setEscapeModal(true);
    } else {
      redirect(undefined, router.replace);
    }
  };

  const showRegistrationModalForGuest = (): (() => void) | undefined => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return () => setModalIsVisible(true);
    }
    return undefined;
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
    if (
      profileData.legalStructureId != userData.profileData.legalStructureId &&
      !newUserData.formationData.formationResponse?.success
    ) {
      newUserData = {
        ...newUserData,
        formationData: { ...newUserData.formationData, formationFormData: createEmptyFormationFormData() },
      };
    }
    update(newUserData).then(async () => {
      setIsLoading(false);
      setAlert("SUCCESS");
      redirect({ success: true });
    });
  };

  const startingNewBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
      </>
    ),
    documents: (
      <>
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        {LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling ? (
          <Documents />
        ) : (
          <></>
        )}
      </>
    ),
    info: (
      <>
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {" "}
          {Config.profileDefaults.profileTabInfoTitle}
        </h2>
        <OnboardingBusinessName disabled={userData?.formationData.getFilingResponse?.success} />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <OnboardingLegalStructureDropdown disabled={userData?.formationData.getFilingResponse?.success} />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} h3Heading={true} />
      </>
    ),
    numbers: (
      <>
        <hr className="margin-top-4" aria-hidden={true} />
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {" "}
          {Config.profileDefaults.profileTabRefTitle}
        </h2>
        <OnboardingEmployerId
          onValidation={onValidation}
          fieldStates={fieldStates}
          handleChangeOverride={showRegistrationModalForGuest()}
        />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <OnboardingEntityId
          onValidation={onValidation}
          fieldStates={fieldStates}
          disabled={userData?.formationData?.getFilingResponse?.success}
          handleChangeOverride={showRegistrationModalForGuest()}
        />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <OnboardingTaxId
          onValidation={onValidation}
          fieldStates={fieldStates}
          handleChangeOverride={showRegistrationModalForGuest()}
        />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <ProfileNaicsCode />
      </>
    ),
  };

  const hasExistingBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        <OnboardingNotes headerAriaLevel={3} handleChangeOverride={showRegistrationModalForGuest()} />
      </>
    ),
    documents: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        <Documents />
      </>
    ),
    info: (
      <>
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {Config.profileDefaults.profileTabInfoTitle}
        </h2>
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
      </>
    ),
    numbers: (
      <>
        <hr className="margin-top-4 margin-bottom-2" />{" "}
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {" "}
          {Config.profileDefaults.profileTabRefTitle}
        </h2>
        <div className="margin-top-4">
          <OnboardingEmployerId
            onValidation={onValidation}
            fieldStates={fieldStates}
            headerAriaLevel={3}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
        <div className="margin-top-4">
          <OnboardingEntityId
            onValidation={onValidation}
            fieldStates={fieldStates}
            headerAriaLevel={3}
            disabled={userData?.formationData.getFilingResponse?.success}
            handleChangeOverride={showRegistrationModalForGuest()}
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
          <OnboardingTaxId
            onValidation={onValidation}
            fieldStates={fieldStates}
            headerAriaLevel={3}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
        <div className="margin-top-4">
          <OnboardingTaxPin
            onValidation={onValidation}
            fieldStates={fieldStates}
            headerAriaLevel={3}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
      </>
    ),
  };

  const border = "2px #e6e6e6";
  const profileNav = (
    <Box sx={{ fontSize: 18, fontWeight: 500 }}>
      <Box className="bg-base-lightest padding-y-2 padding-x-3" sx={{ border, borderStyle: "solid" }}>
        <Content>{Config.profileDefaults.pageTitle}</Content>
      </Box>
      <Box
        className="bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3"
        sx={{
          "&:hover, & .selected": {
            color: "primary.dark",
            fontWeight: "bold",
            opacity: [0.8],
          },
          border,
          borderStyle: "none solid solid solid",
        }}
        data-testid="info"
        onClick={() => setProfileTab("info")}
      >
        <span className={profileTab == "info" ? "selected" : ""}>
          {Config.profileDefaults.profileTabInfoTitle}
        </span>
        <Icon className="usa-icon--size-3 margin-x-1">navigate_next</Icon>
      </Box>
      <Box
        className="bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3"
        sx={{
          "&:hover, & .selected": {
            color: "primary.dark",
            fontWeight: "bold",
            opacity: [0.8],
          },
          border,
          borderStyle: "none solid solid solid",
        }}
        data-testid="numbers"
        onClick={() => setProfileTab("numbers")}
      >
        <span className={profileTab == "numbers" ? "selected" : ""}>
          {Config.profileDefaults.profileTabRefTitle}
        </span>
        <Icon className="usa-icon--size-3 margin-x-1">navigate_next</Icon>
      </Box>
      {userData?.formationData.getFilingResponse?.success ||
      (hasExistingBusiness == false &&
        LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling) ? (
        <Box
          className="bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3"
          sx={{
            "&:hover, & .selected": {
              color: "primary.dark",
              fontWeight: "bold",
              opacity: [0.8],
            },
            border,
            borderStyle: "none solid solid solid",
          }}
          data-testid="documents"
          onClick={() => setProfileTab("documents")}
        >
          <span className={profileTab == "documents" ? "selected" : ""}>
            {Config.profileDefaults.profileTabDocsTitle}
          </span>
          <Icon className="usa-icon--size-3 margin-x-1">navigate_next</Icon>
        </Box>
      ) : (
        <></>
      )}
      <Box
        className="bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3"
        sx={{
          "&:hover, & .selected": {
            color: "primary.dark",
            fontWeight: "bold",
            opacity: [0.8],
          },
          border,
          borderStyle: "none solid solid solid",
        }}
        data-testid="notes"
        onClick={() => setProfileTab("notes")}
      >
        <span className={profileTab == "notes" ? "selected" : ""}>
          {Config.profileDefaults.profileTabNoteTitle}
        </span>
        <Icon className="usa-icon--size-3 margin-x-1">navigate_next</Icon>
      </Box>
    </Box>
  );

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: getFlow(profileData),
          municipalities: props.municipalities,
        },
        setUser: () => {},
        setProfileData,
        onBack,
      }}
    >
      <PageSkeleton>
        <NavBar />
        <main id="main">
          <div className="usa-section padding-top-0 desktop:padding-top-3">
            <EscapeModal
              isOpen={escapeModal}
              close={() => setEscapeModal(false)}
              primaryButtonOnClick={() => redirect()}
            />
            <SingleColumnContainer>
              {alert && <ProfileToastAlert alert={alert} close={() => setAlert(undefined)} />}
              <UserDataErrorAlert />
            </SingleColumnContainer>
            <div className="margin-top-6 desktop:margin-top-0">
              <SidebarPageLayout navChildren={profileNav} divider={false} outlineBox={false} stackNav={true}>
                {userData === undefined ? (
                  <div className="flex flex-justify-center flex-align-center padding-top-0 desktop:padding-top-6 padding-bottom-15">
                    <CircularProgress
                      id="profilePage"
                      aria-label="profile page progress bar"
                      aria-busy={true}
                    />
                    <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
                  </div>
                ) : (
                  <>
                    <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                      {hasExistingBusiness === true
                        ? hasExistingBusinessElements[profileTab]
                        : startingNewBusinessElements[profileTab]}

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
                    </form>
                  </>
                )}
              </SidebarPageLayout>
            </div>
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
      municipalities,
    },
  };
};

export default ProfilePage;
