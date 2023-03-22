import { FormationDateDeletionModal } from "@/components/FormationDateDeletionModal";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingEmployerId } from "@/components/onboarding/OnboardingEmployerId";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructureDropdown } from "@/components/onboarding/OnboardingLegalStructureDropDown";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNotes } from "@/components/onboarding/OnboardingNotes";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { OnboardingTaxPin } from "@/components/onboarding/OnboardingTaxPin";
import { ProfileNaicsCode } from "@/components/onboarding/ProfileNaicsCode";
import { ProfileNexusBusinessNameField } from "@/components/onboarding/ProfileNexusBusinessNameField";
import { ProfileNexusDBANameField } from "@/components/onboarding/ProfileNexusDBANameField";
import { DisabledTaxId } from "@/components/onboarding/taxId/DisabledTaxId";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Documents } from "@/components/profile/Documents";
import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileOpportunitiesAlert } from "@/components/profile/ProfileOpportunitiesAlert";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { ProfileTabNav } from "@/components/profile/ProfileTabNav";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { checkQueryValue, QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { createProfileFieldErrorMap, OnboardingStatus, profileTabs, ProfileTabs } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getFlow, useMountEffectWhenDefined, useScrollToPathAnchor } from "@/lib/utils/helpers";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import {
  BusinessPersona,
  createEmptyProfileData,
  einTaskId,
  ForeignBusinessType,
  formationTaskId,
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useContext, useState } from "react";

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

const ProfilePage = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormationDateDeletionModalOpen, setFormationDateDeletionModalOpen] = useState<boolean>(false);

  const userDataFromHook = useUserData();
  const updateQueue = userDataFromHook.updateQueue;
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const businessPersona: BusinessPersona = props.CMS_ONLY_businessPersona ?? profileData.businessPersona;
  const foreignBusinessType: ForeignBusinessType =
    props.CMS_ONLY_foreignBusinessType ?? profileData.foreignBusinessType;

  const {
    FormFuncWrapper,
    onSubmit,
    tab: profileTab,
    onTabChange: setProfileTab,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap(), props.CMS_ONLY_tab ?? profileTabs[0]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (params?: { [key: string]: any }, routerType = router.push): Promise<boolean> => {
    if (checkQueryValue(router, QUERIES.path, "businessFormation")) {
      const formationUrlSlug = getTaskFromRoadmap(roadmap, formationTaskId)?.urlSlug ?? "";
      return routerType(`/tasks/${formationUrlSlug}`);
    }

    const urlParams = params ? `?${new URLSearchParams(params).toString()}` : "";
    return routerType(`${ROUTES.dashboard}${urlParams}`);
  };

  useScrollToPathAnchor();

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const formatDate = (date: string) => {
    if (!date) {
      return "";
    }

    const dateIsValid = /^\d{2}\/\d{4}$/.test(date);

    if (dateIsValid) {
      return dayjs(date).format("MM/YYY");
    } else {
      return date;
    }
  };

  const onBack = async () => {
    if (!userData) {
      return;
    }
    if (businessPersona === "STARTING") {
      analytics.event.profile_back_to_roadmap.click.view_roadmap();
    }
    if (deepEqual(profileData, userData.profileData)) {
      await redirect(undefined, router.replace);
    } else {
      setEscapeModal(true);
    }
  };

  const showRegistrationModalForGuest = (): (() => void) | undefined => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return () => {
        return setRegistrationModalIsVisible(true);
      };
    }
    return undefined;
  };

  FormFuncWrapper(
    () => {
      if (!updateQueue) {
        return;
      }

      const dateOfFormationHasBeenDeleted =
        updateQueue.current().profileData.dateOfFormation !== profileData.dateOfFormation &&
        profileData.dateOfFormation === undefined;

      if (dateOfFormationHasBeenDeleted) {
        if (isFormationDateDeletionModalOpen) {
          setFormationDateDeletionModalOpen(false);
          updateQueue.queueTaskProgress({ [formationTaskId]: "IN_PROGRESS" });
        } else {
          setFormationDateDeletionModalOpen(true);
          return;
        }
      }

      analytics.event.profile_save.click.save_profile_changes();

      setIsLoading(true);

      sendOnSaveAnalytics(updateQueue.current().profileData, profileData);

      if (profileData.employerId && profileData.employerId.length > 0) {
        updateQueue.queueTaskProgress({ [einTaskId]: "COMPLETED" });
      }

      if (updateQueue.current().profileData.taxId !== profileData.taxId) {
        updateQueue.queueTaxFilingData({ state: undefined, registeredISO: undefined, filings: [] });
      }

      updateQueue.queueProfileData(profileData);

      (async () => {
        updateQueue.queue(await postGetAnnualFilings(updateQueue.current()));
        updateQueue.update().then(async () => {
          setIsLoading(false);
          setAlert("SUCCESS");
          await redirect({ success: true });
        });
      })();
    },
    (isValid, _errors, pageChange) => {
      !isValid && pageChange && setAlert("ERROR");
    }
  );

  const sendOnSaveAnalytics = (prevProfileData: ProfileData, newProfileData: ProfileData): void => {
    if (
      prevProfileData.dateOfFormation !== newProfileData.dateOfFormation &&
      !!newProfileData.dateOfFormation
    ) {
      analytics.event.profile_formation_date.submit.formation_date_changed();
    }

    if (prevProfileData.dateOfFormation !== undefined && newProfileData.dateOfFormation === undefined) {
      analytics.event.profile_formation_date.submit.formation_date_deleted();
    }

    const municipalityEnteredForFirstTime =
      prevProfileData.municipality === undefined && newProfileData.municipality !== undefined;

    if (municipalityEnteredForFirstTime) {
      analytics.event.profile_location_question.submit.location_entered_for_first_time();
    }
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

  const isBusinessNameRequired = (): boolean => {
    if (!userData) return false;
    return LookupOperatingPhaseById(userData.profileData.operatingPhase).businessNameRequired;
  };

  const shouldShowNexusBusinessNameElements = (): boolean => {
    if (!userData) return false;
    return LookupLegalStructureById(userData.profileData.legalStructureId).elementsToDisplay.has(
      "nexusBusinessElements"
    );
  };

  const displayAltHomeBasedBusinessDescription = LookupOperatingPhaseById(
    userData?.profileData.operatingPhase
  ).displayAltHomeBasedBusinessDescription;

  const displayHomedBaseBusinessQuestion = (): boolean => {
    if (!userData) {
      return false;
    }
    if (!profileData.industryId) {
      return true;
    }
    if (profileData.foreignBusinessType === "NEXUS" && profileData.nexusLocationInNewJersey) {
      return false;
    }
    return isHomeBasedBusinessApplicable(profileData.industryId);
  };

  const shouldLockFormationFields = userData?.formationData.getFilingResponse?.success;
  const shouldLockTaxId =
    userData?.taxFilingData.state === "SUCCESS" || userData?.taxFilingData.state === "PENDING";

  const nexusBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileField fieldName="foreignBusinessTypeIds">
          <OnboardingForeignBusinessType required />
        </ProfileField>

        <ProfileField
          fieldName="businessName"
          isVisible={shouldShowNexusBusinessNameElements()}
          noLabel={true}
        >
          <ProfileNexusBusinessNameField />
        </ProfileField>

        <ProfileField
          fieldName="nexusDbaName"
          isVisible={shouldShowNexusBusinessNameElements() && !!profileData.nexusDbaName}
        >
          <ProfileNexusDBANameField />
        </ProfileField>

        <ProfileField fieldName="industryId">
          <OnboardingIndustry />
        </ProfileField>

        <ProfileField
          fieldName="legalStructureId"
          locked={shouldLockFormationFields}
          lockedValueFormatter={(value: string) => LookupLegalStructureById(value).name}
        >
          <OnboardingLegalStructureDropdown />
        </ProfileField>

        <ProfileField fieldName="nexusLocationInNewJersey">
          <OnboardingLocationInNewJersey />
        </ProfileField>

        <ProfileField fieldName="municipality" isVisible={profileData.nexusLocationInNewJersey === true}>
          <OnboardingMunicipality />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          isVisible={displayHomedBaseBusinessQuestion()}
        >
          <OnboardingHomeBasedBusiness />
        </ProfileField>
      </>
    ),
    documents: <></>,
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={shouldLockTaxId} />
          {!shouldLockTaxId && <TaxDisclaimer legalStructureId={userData?.profileData.legalStructureId} />}
          <div className={"max-width-38rem"}>
            {shouldLockTaxId ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    ),
  };

  const foreignBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileField fieldName="foreignBusinessTypeIds">
          <OnboardingForeignBusinessType required />
        </ProfileField>
      </>
    ),
    documents: <></>,
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={shouldLockTaxId} />
          {!shouldLockTaxId && <TaxDisclaimer legalStructureId={userData?.profileData.legalStructureId} />}
          <div className={"max-width-38rem"}>
            {shouldLockTaxId ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    ),
  };

  const startingNewBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    documents: (
      <>
        <ProfileTabHeader tab="documents" />

        <ProfileField
          fieldName="documents"
          isVisible={LookupLegalStructureById(userData?.profileData.legalStructureId).elementsToDisplay.has(
            "formationDocuments"
          )}
        >
          <Documents />
        </ProfileField>
      </>
    ),
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileField fieldName="businessName" locked={shouldLockFormationFields}>
          <OnboardingBusinessName required={isBusinessNameRequired()} />
        </ProfileField>

        <ProfileField fieldName="industryId">
          <OnboardingIndustry />
        </ProfileField>

        <ProfileField
          fieldName="sectorId"
          isVisible={profileData.industryId === "generic" || !!props.CMS_ONLY_fakeUserData}
        >
          <OnboardingSectors />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!userData?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <OnboardingDateOfFormation futureAllowed={true} />
        </ProfileField>

        <ProfileField
          fieldName="legalStructureId"
          locked={shouldLockFormationFields}
          lockedValueFormatter={(id) => LookupLegalStructureById(id).name}
        >
          <OnboardingLegalStructureDropdown />
        </ProfileField>

        <ProfileField fieldName="municipality">
          <OnboardingMunicipality />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          isVisible={displayHomedBaseBusinessQuestion()}
          displayAltDescription={displayAltHomeBasedBusinessDescription}
        >
          <OnboardingHomeBasedBusiness />
        </ProfileField>

        <ProfileField
          fieldName="ownershipTypeIds"
          isVisible={
            LookupOperatingPhaseById(userData?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields
          }
        >
          <OnboardingOwnership />
        </ProfileField>

        <ProfileField
          fieldName="existingEmployees"
          isVisible={
            LookupOperatingPhaseById(userData?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields
          }
        >
          <OnboardingExistingEmployees required />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="naicsCode" noLabel={true}>
          <ProfileNaicsCode />
        </ProfileField>

        <ProfileField
          fieldName="entityId"
          isVisible={LookupLegalStructureById(userData?.profileData.legalStructureId).elementsToDisplay.has(
            "entityId"
          )}
          locked={shouldLockFormationFields}
        >
          <OnboardingEntityId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <OnboardingEmployerId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={shouldLockTaxId} />
          {!shouldLockTaxId && <TaxDisclaimer legalStructureId={userData?.profileData.legalStructureId} />}
          <div className="max-width-38rem">
            {shouldLockTaxId ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    ),
  };

  const owningBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <OnboardingNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    documents: <></>,
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileField fieldName="businessName">
          <OnboardingBusinessName />
        </ProfileField>

        <ProfileField fieldName="sectorId">
          <OnboardingSectors />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={LookupLegalStructureById(userData?.profileData.legalStructureId).elementsToDisplay.has(
            "formationDate"
          )}
        >
          <OnboardingDateOfFormation futureAllowed={false} />
        </ProfileField>

        <ProfileField fieldName="existingEmployees">
          <OnboardingExistingEmployees />
        </ProfileField>

        <ProfileField fieldName="municipality">
          <OnboardingMunicipality />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          isVisible={displayHomedBaseBusinessQuestion()}
          displayAltDescription={displayAltHomeBasedBusinessDescription}
        >
          <OnboardingHomeBasedBusiness />
        </ProfileField>

        <ProfileField fieldName="ownershipTypeIds">
          <OnboardingOwnership />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="entityId">
          <OnboardingEntityId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <OnboardingEmployerId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={shouldLockTaxId} />
          {!shouldLockTaxId && <TaxDisclaimer legalStructureId={userData?.profileData.legalStructureId} />}
          <div className={"max-width-38rem"}>
            {shouldLockTaxId ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <OnboardingTaxPin handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
  };

  return (
    <profileFormContext.Provider value={formContextState}>
      <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData),
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
                  close={() => {
                    return setEscapeModal(false);
                  }}
                  primaryButtonOnClick={() => {
                    return redirect();
                  }}
                />
                <FormationDateDeletionModal
                  isOpen={isFormationDateDeletionModalOpen}
                  handleCancel={() => setFormationDateDeletionModalOpen(false)}
                  handleDelete={onSubmit}
                />
                <SingleColumnContainer>
                  {alert && (
                    <ProfileSnackbarAlert
                      alert={alert}
                      close={() => {
                        return setAlert(undefined);
                      }}
                    />
                  )}
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
                        {LookupOperatingPhaseById(profileData.operatingPhase)
                          .displayProfileOpportunityAlert && <ProfileOpportunitiesAlert />}
                        <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                          {getElements()}

                          <div className="float-right fdr margin-top-2">
                            <SecondaryButton
                              isColor="primary"
                              onClick={() => {
                                return onBack();
                              }}
                              dataTestId="back"
                            >
                              {Config.profileDefaults.backButtonText}
                            </SecondaryButton>
                            <PrimaryButton
                              isColor="primary"
                              isSubmitButton={true}
                              onClick={() => {}}
                              isRightMarginRemoved={true}
                              dataTestId="save"
                              isLoading={isLoading}
                            >
                              {Config.profileDefaults.saveButtonText}
                            </PrimaryButton>
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
      </MunicipalitiesContext.Provider>
    </profileFormContext.Provider>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  return {
    props: {
      municipalities: loadAllMunicipalities(),
    },
  };
};

export default ProfilePage;
