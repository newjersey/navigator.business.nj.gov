import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingEmployerId } from "@/components/onboarding/OnboardingEmployerId";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNotes } from "@/components/onboarding/OnboardingNotes";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { OnboardingTaxPin } from "@/components/onboarding/OnboardingTaxPin";
import { ProfileNaicsCode } from "@/components/onboarding/ProfileNaicsCode";
import { ProfileNexusBusinessNameField } from "@/components/onboarding/ProfileNexusBusinessNameField";
import { ProfileNexusDBANameField } from "@/components/onboarding/ProfileNexusDBANameField";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Documents } from "@/components/profile/Documents";
import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ProfileTabNav } from "@/components/profile/ProfileTabNav";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
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
import {
  getFlow,
  getSectionCompletion,
  getTaskFromRoadmap,
  useMountEffectWhenDefined,
} from "@/lib/utils/helpers";
import { BusinessPersona, ForeignBusinessType, formationTaskId } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileData,
  einTaskId,
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import deepEqual from "fast-deep-equal/es6/react";
import { cloneDeep } from "lodash";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { FormEvent, ReactElement, ReactNode, useContext, useState } from "react";

interface Props {
  municipalities: Municipality[];
  CMS_ONLY_businessPersona?: BusinessPersona; // for CMS only
  CMS_ONLY_foreignBusinessType?: ForeignBusinessType; // for CMS only
  CMS_ONLY_tab?: ProfileTabs; // for CMS only
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
  CMS_ONLY_showEscapeModal?: boolean; // for CMS only
  CMS_ONLY_showSuccessAlert?: boolean; // for CMS only
  CMS_ONLY_showErrorAlert?: boolean; // for CMS only
}

const defaultTabForPersona: Record<string, ProfileTabs> = {
  STARTING: "info",
  OWNING: "info",
  FOREIGN: "numbers",
};

const ProfilePage = (props: Props): ReactElement => {
  const { setRoadmap } = useContext(RoadmapContext);
  const { roadmap, updateSectionCompletion } = useRoadmap();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userDataFromHook = useUserData();
  const update = userDataFromHook.update;
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();

  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const businessPersona: BusinessPersona =
    props.CMS_ONLY_businessPersona ?? userData?.profileData.businessPersona;
  const foreignBusinessType: ForeignBusinessType =
    props.CMS_ONLY_foreignBusinessType ?? userData?.profileData.foreignBusinessType;

  const defaultTab =
    businessPersona && foreignBusinessType !== "NEXUS" ? defaultTabForPersona[businessPersona] : "info";
  const [profileTab, setProfileTab] = useState<ProfileTabs>(props.CMS_ONLY_tab ?? defaultTab);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (params?: { [key: string]: any }, routerType = router.push): Promise<boolean> => {
    if (checkQueryValue(router, QUERIES.path, "businessFormation")) {
      const formationUrlSlug = getTaskFromRoadmap(roadmap, formationTaskId)?.urlSlug ?? "";
      return routerType(`/tasks/${formationUrlSlug}`);
    }

    const route = routeForPersona(businessPersona);
    const urlParams = params ? `?${new URLSearchParams(params).toString()}` : "";
    return routerType(`${route}${urlParams}`);
  };

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates((prevFieldStates) => ({ ...prevFieldStates, [field]: { invalid } }));
  };

  const onBack = () => {
    if (!userData) return;
    if (businessPersona === "STARTING") {
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
      return () => setRegistrationModalIsVisible(true);
    }
    return undefined;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!userData) return;
    analytics.event.profile_save.click.save_profile_changes();

    const fieldStatesCopy = cloneDeep(fieldStates);
    if (profileData.sectorId) {
      onValidation("sectorId", false);
      fieldStatesCopy["sectorId"] = { invalid: false };
    }
    if (Object.keys(fieldStatesCopy).some((k) => fieldStatesCopy[k as ProfileFields].invalid)) {
      setAlert("ERROR");
      return;
    }

    setIsLoading(true);
    setAnalyticsDimensions(profileData);
    const newRoadmap = await buildUserRoadmap(profileData);
    setRoadmap(newRoadmap);

    const { taskProgress } = userData;
    let { taxFilingData } = userData;

    if (profileData.employerId && profileData.employerId.length > 0) {
      taskProgress[einTaskId] = "COMPLETED";
    }

    if (userData.profileData.taxId != profileData.taxId) {
      taxFilingData = { ...taxFilingData, state: undefined, registered: false, filings: [] };
    }

    if (
      userData.profileData.dateOfFormation !== profileData.dateOfFormation &&
      !!profileData.dateOfFormation
    ) {
      analytics.event.profile_formation_date.submit.formation_date_changed();
    }

    let newUserData: UserData = {
      ...userData,
      profileData: profileData,
      formProgress: "COMPLETED",
      taskProgress,
      taxFilingData,
    };

    updateSectionCompletion(getSectionCompletion(newRoadmap, newUserData));
    newUserData = await postGetAnnualFilings(newUserData);
    update(newUserData).then(async () => {
      setIsLoading(false);
      setAlert("SUCCESS");
      redirect({ success: true });
    });
  };

  const getElements = (): ReactNode => {
    switch (businessPersona) {
      case "STARTING": {
        return startingNewBusinessElements[profileTab];
      }
      case "OWNING": {
        return owningBusinessElements[profileTab];
      }
      case "FOREIGN": {
        return foreignBusinessType === "NEXUS"
          ? nexusBusinessElements[profileTab]
          : foreignBusinessElements[profileTab];
      }
    }
  };

  const shouldShowNexusBusinessNameElements = (): boolean => {
    if (!userData) return false;
    return LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling;
  };

  const displayHomedBaseBusinessQuestion = (): boolean => {
    if (!userData) return false;
    if (!profileData.industryId) return true;
    if (profileData.foreignBusinessType === "NEXUS" && profileData.nexusLocationInNewJersey) {
      return false;
    }
    return isHomeBasedBusinessApplicable(profileData.industryId);
  };

  const nexusBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {" "}
          {Config.profileDefaults.profileTabInfoTitle}
        </h2>
        {shouldShowNexusBusinessNameElements() && (
          <>
            <div className="margin-top-3" aria-hidden={true} />
            <ProfileNexusBusinessNameField />
            <div className="margin-top-3" aria-hidden={true} />
            {profileData.nexusDbaName && (
              <>
                <FieldLabelProfile fieldName="nexusDbaName" />
                <ProfileNexusDBANameField />
              </>
            )}
            <div className="margin-top-3" aria-hidden={true} />
          </>
        )}
        <FieldLabelProfile fieldName="industryId" />
        <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />
        <div className="margin-top-3" aria-hidden={true} />
        <FieldLabelProfile fieldName="legalStructureId" />
        <OnboardingLegalStructureDropdown disabled={userData?.formationData.getFilingResponse?.success} />
        <div className="margin-top-3" aria-hidden={true} />
        <FieldLabelProfile fieldName="nexusLocationInNewJersey" />
        <OnboardingLocationInNewJersey />
        {profileData.nexusLocationInNewJersey && (
          <>
            <div className="margin-top-3" aria-hidden={true} />
            <FieldLabelProfile fieldName="municipality" />
            <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
          </>
        )}
        {displayHomedBaseBusinessQuestion() && (
          <div className="margin-top-3">
            <FieldLabelProfile fieldName="homeBasedBusiness" />
            <OnboardingHomeBasedBusiness />
          </div>
        )}
      </>
    ),
    documents: <></>,
    notes: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        <FieldLabelProfile fieldName="notes" />
        <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
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
          <FieldLabelProfile fieldName="taxId" />
          <OnboardingTaxId
            onValidation={onValidation}
            fieldStates={fieldStates}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
      </>
    ),
  };

  const foreignBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: <></>,
    documents: <></>,
    notes: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        <FieldLabelProfile fieldName="notes" />
        <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
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
          <FieldLabelProfile fieldName="taxId" />
          <OnboardingTaxId
            onValidation={onValidation}
            fieldStates={fieldStates}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
      </>
    ),
  };

  const startingNewBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <FieldLabelProfile fieldName="notes" />
        <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
      </>
    ),
    documents: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        {LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling && (
          <>
            <FieldLabelProfile fieldName="documents" />
            <Documents />
          </>
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

        <FieldLabelProfile fieldName="businessName" />
        <OnboardingBusinessName disabled={userData?.formationData.getFilingResponse?.success} />

        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />

        <FieldLabelProfile fieldName="industryId" />
        <OnboardingIndustry onValidation={onValidation} fieldStates={fieldStates} />
        {(profileData.industryId === "generic" || props.CMS_ONLY_fakeUserData) && (
          <div className="margin-top-4 margin-bottom-2">
            <FieldLabelProfile fieldName="sectorId" />
            <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} />
          </div>
        )}

        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />

        <FieldLabelProfile fieldName="legalStructureId" />
        <OnboardingLegalStructureDropdown disabled={userData?.formationData.getFilingResponse?.success} />

        <hr className="margin-top-6 margin-bottom-2" aria-hidden={true} />

        <FieldLabelProfile fieldName="municipality" />
        <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />

        {displayHomedBaseBusinessQuestion() && (
          <div className="margin-top-3">
            <FieldLabelProfile fieldName="homeBasedBusiness" />
            <OnboardingHomeBasedBusiness />
          </div>
        )}

        {LookupOperatingPhaseById(userData?.profileData.operatingPhase)
          .displayCompanyDemographicProfileFields && (
          <>
            <hr className="margin-top-6 margin-bottom-2" aria-hidden={true} />
            <FieldLabelProfile fieldName="ownershipTypeIds" />
            <OnboardingOwnership />
            <hr className="margin-top-6 margin-bottom-2" aria-hidden={true} />
            <FieldLabelProfile fieldName="existingEmployees" />
            <OnboardingExistingEmployees onValidation={onValidation} fieldStates={fieldStates} />
          </>
        )}
      </>
    ),
    numbers: (
      <>
        <hr className="margin-top-4" aria-hidden={true} />
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {Config.profileDefaults.profileTabRefTitle}
        </h2>
        <ProfileNaicsCode />
        {userData?.profileData.dateOfFormation && (
          <>
            <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
            <FieldLabelProfile fieldName="dateOfFormation" />
            <OnboardingDateOfFormation
              onValidation={onValidation}
              fieldStates={fieldStates}
              disabled={userData?.formationData.getFilingResponse?.success}
              futureAllowed={true}
              required
            />
          </>
        )}
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <FieldLabelProfile fieldName="entityId" />
        <OnboardingEntityId
          onValidation={onValidation}
          fieldStates={fieldStates}
          disabled={userData?.formationData?.getFilingResponse?.success}
          handleChangeOverride={showRegistrationModalForGuest()}
        />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <FieldLabelProfile fieldName="employerId" />
        <OnboardingEmployerId
          onValidation={onValidation}
          fieldStates={fieldStates}
          handleChangeOverride={showRegistrationModalForGuest()}
        />
        <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
        <FieldLabelProfile fieldName="taxId" />
        <OnboardingTaxId
          onValidation={onValidation}
          fieldStates={fieldStates}
          handleChangeOverride={showRegistrationModalForGuest()}
        />
      </>
    ),
  };

  const owningBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        <FieldLabelProfile fieldName="notes" />
        <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
      </>
    ),
    documents: (
      <>
        <hr className="margin-top-4 margin-bottom-4" aria-hidden={true} />
        <FieldLabelProfile fieldName="documents" />
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
          <FieldLabelProfile fieldName="businessName" />
          <OnboardingBusinessName onValidation={onValidation} fieldStates={fieldStates} />
        </div>
        {(props.CMS_ONLY_fakeUserData || true) && (
          <div className="margin-top-4">
            <FieldLabelProfile fieldName="sectorId" />
            <OnboardingSectors onValidation={onValidation} fieldStates={fieldStates} />
          </div>
        )}
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="existingEmployees" />
          <OnboardingExistingEmployees onValidation={onValidation} fieldStates={fieldStates} />
        </div>
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="municipality" />
          <OnboardingMunicipality onValidation={onValidation} fieldStates={fieldStates} />
        </div>
        {displayHomedBaseBusinessQuestion() && (
          <div className="margin-top-3">
            <FieldLabelProfile fieldName="homeBasedBusiness" />
            <OnboardingHomeBasedBusiness />
          </div>
        )}
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="ownershipTypeIds" />
          <OnboardingOwnership />
        </div>
      </>
    ),
    numbers: (
      <>
        <hr className="margin-top-4 margin-bottom-2" />
        <h2 className="padding-bottom-3" style={{ fontWeight: 300 }}>
          {Config.profileDefaults.profileTabRefTitle}
        </h2>
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="dateOfFormation" />
          <OnboardingDateOfFormation
            onValidation={onValidation}
            fieldStates={fieldStates}
            futureAllowed={false}
          />
        </div>
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="entityId" />
          <OnboardingEntityId
            onValidation={onValidation}
            fieldStates={fieldStates}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="employerId" />
          <OnboardingEmployerId
            onValidation={onValidation}
            fieldStates={fieldStates}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="taxId" />
          <OnboardingTaxId
            onValidation={onValidation}
            fieldStates={fieldStates}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
        <div className="margin-top-4">
          <FieldLabelProfile fieldName="taxPin" />
          <OnboardingTaxPin
            onValidation={onValidation}
            fieldStates={fieldStates}
            handleChangeOverride={showRegistrationModalForGuest()}
          />
        </div>
      </>
    ),
  };

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
              {alert && <ProfileSnackbarAlert alert={alert} close={() => setAlert(undefined)} />}
              <UserDataErrorAlert />
            </SingleColumnContainer>
            <div className="margin-top-6 desktop:margin-top-0">
              <SidebarPageLayout
                divider={false}
                outlineBox={false}
                stackNav={true}
                navChildren={
                  <ProfileTabNav
                    userData={userData}
                    businessPersona={businessPersona}
                    foreignBusinessType={foreignBusinessType}
                    activeTab={profileTab}
                    setProfileTab={setProfileTab}
                  />
                }
              >
                {userData === undefined ? (
                  <div className="padding-top-0 desktop:padding-top-6 padding-bottom-15">
                    <LoadingIndicator />
                  </div>
                ) : (
                  <>
                    <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                      {getElements()}

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
