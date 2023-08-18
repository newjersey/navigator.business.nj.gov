import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { CircularIndicator } from "@/components/CircularIndicator";
import { FormationDateDeletionModal } from "@/components/FormationDateDeletionModal";
import { NavBar } from "@/components/navbar/NavBar";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { DisabledTaxId } from "@/components/onboarding/taxId/DisabledTaxId";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { PageSkeleton } from "@/components/PageSkeleton";
import { DevOnlyResetUserDataButton } from "@/components/profile/DevOnlyResetUserDataButton";
import { Documents } from "@/components/profile/Documents";
import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileBusinessName } from "@/components/profile/ProfileBusinessName";
import { ProfileBusinessStructure } from "@/components/profile/ProfileBusinessStructure";
import { ProfileDateOfFormation } from "@/components/profile/ProfileDateOfFormation";
import { ProfileEmployerId } from "@/components/profile/ProfileEmployerId";
import { ProfileEntityId } from "@/components/profile/ProfileEntityId";
import { ProfileExistingEmployees } from "@/components/profile/ProfileExistingEmployees";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileMunicipality } from "@/components/profile/ProfileMunicipality";
import { ProfileNaicsCode } from "@/components/profile/ProfileNaicsCode";
import { ProfileNexusBusinessNameField } from "@/components/profile/ProfileNexusBusinessNameField";
import { ProfileNexusDBANameField } from "@/components/profile/ProfileNexusDBANameField";
import { ProfileNonEssentialQuestionsSection } from "@/components/profile/ProfileNonEssentialQuestionsSection";
import { ProfileNotes } from "@/components/profile/ProfileNotes";
import { ProfileOpportunitiesAlert } from "@/components/profile/ProfileOpportunitiesAlert";
import { ProfileOwnership } from "@/components/profile/ProfileOwnership";
import { ProfileResponsibleOwnerName } from "@/components/profile/ProfileResponsibleOwnerName";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { ProfileTabNav } from "@/components/profile/ProfileTabNav";
import { ProfileTaxPin } from "@/components/profile/ProfileTaxPin";
import { ProfileTradeName } from "@/components/profile/ProfileTradeName";
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
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { ROUTES } from "@/lib/domain-logic/routes";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { createProfileFieldErrorMap, OnboardingStatus, profileTabs, ProfileTabs } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getFlow, useMountEffectWhenDefined, useScrollToPathAnchor } from "@/lib/utils/helpers";
import {
  Business,
  BusinessPersona,
  createEmptyProfileData,
  einTaskId,
  ForeignBusinessType,
  formationTaskId,
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  Municipality,
  naicsCodeTaskId,
  ProfileData
} from "@businessnjgovnavigator/shared";
import { hasCompletedFormation } from "@businessnjgovnavigator/shared/";
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
  CMS_ONLY_fakeBusiness?: Business; // for CMS only
}

const ProfilePage = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldLockFormationFields, setShouldLockFormationFields] = useState<boolean>(false);
  const [isFormationDateDeletionModalOpen, setFormationDateDeletionModalOpen] = useState<boolean>(false);

  const userDataFromHook = useUserData();
  const updateQueue = userDataFromHook.updateQueue;
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);
  const { Config } = useConfig();
  const businessPersona: BusinessPersona = props.CMS_ONLY_businessPersona ?? profileData.businessPersona;
  const foreignBusinessType: ForeignBusinessType =
    props.CMS_ONLY_foreignBusinessType ?? profileData.foreignBusinessType;
  const {
    FormFuncWrapper,
    onSubmit,
    tab: profileTab,
    onTabChange: setProfileTab,
    state: formContextState
  } = useFormContextHelper(createProfileFieldErrorMap(), props.CMS_ONLY_tab ?? profileTabs[0]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redirect = (params?: { [key: string]: any }, routerType = router.push): Promise<boolean> => {
    const urlParams = params ? `?${new URLSearchParams(params).toString()}` : "";
    return routerType(`${ROUTES.dashboard}${urlParams}`);
  };

  useScrollToPathAnchor();

  useMountEffectWhenDefined(() => {
    if (business) {
      setProfileData(business.profileData);
      setShouldLockFormationFields(hasCompletedFormation(business));
    }
  }, business);

  const formatDate = (date: string): string => {
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

  const onBack = async (): Promise<void> => {
    if (!business) return;
    if (businessPersona === "STARTING") {
      analytics.event.profile_back_to_roadmap.click.view_roadmap();
    }
    if (deepEqual(profileData, business.profileData)) {
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
      if (!updateQueue || !business) {
        return;
      }

      const dateOfFormationHasBeenDeleted =
        business.profileData.dateOfFormation !== profileData.dateOfFormation &&
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

      sendOnSaveAnalytics(business.profileData, profileData);

      if (profileData.employerId && profileData.employerId.length > 0) {
        updateQueue.queueTaskProgress({ [einTaskId]: "COMPLETED" });
      }

      if (business.profileData.taxId !== profileData.taxId) {
        updateQueue.queueTaxFilingData({ state: undefined, registeredISO: undefined, filings: [] });
      }

      if (business.profileData.industryId !== profileData.industryId) {
        updateQueue
          .queueBusiness({ ...updateQueue.currentBusiness(), taskItemChecklist: {} })
          .queueTaskProgress({ [naicsCodeTaskId]: "NOT_STARTED" });
      }

      updateQueue.queueProfileData(profileData);

      (async (): Promise<void> => {
        updateQueue
          .queue(await postGetAnnualFilings(updateQueue.current()))
          .update()
          .then(async () => {
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
    if (prevProfileData.dateOfFormation !== newProfileData.dateOfFormation) {
      analytics.event.profile_formation_date.submit.formation_date_changed();
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
    if (!business) return false;
    return LookupOperatingPhaseById(business.profileData.operatingPhase).businessNameRequired;
  };

  const shouldShowNexusBusinessNameElements = (): boolean => {
    if (!business) return false;
    return LookupLegalStructureById(business.profileData.legalStructureId).elementsToDisplay.has(
      "nexusBusinessElements"
    );
  };

  const shouldShowTradeNameElements = (): boolean => {
    if (!business) return false;
    return LookupLegalStructureById(business.profileData.legalStructureId).hasTradeName;
  };

  const displayOpportunityAlert = LookupOperatingPhaseById(
    profileData.operatingPhase
  ).displayProfileOpportunityAlert;

  const shouldLockMunicipality = (): boolean => {
    return !!profileData.municipality && business?.taxFilingData.state === "SUCCESS";
  };

  const displayAltHomeBasedBusinessDescription = LookupOperatingPhaseById(
    business?.profileData.operatingPhase
  ).displayAltHomeBasedBusinessDescription;

  const displayHomedBaseBusinessQuestion = (): boolean => {
    if (!business) return false;
    if (!profileData.industryId) {
      return true;
    }
    if (profileData.foreignBusinessType === "NEXUS" && profileData.nexusLocationInNewJersey) {
      return false;
    }
    return isHomeBasedBusinessApplicable(profileData.industryId);
  };

  const hasSubmittedTaxData =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";

  const nexusBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <ProfileTabHeader tab="info" />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}

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
          <ProfileNonEssentialQuestionsSection />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!business?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <ProfileDateOfFormation futureAllowed={true} />
        </ProfileField>

        <ProfileField
          fieldName="legalStructureId"
          noLabel={true}
          locked={shouldLockFormationFields}
          lockedValueFormatter={(legalStructureId): string => LookupLegalStructureById(legalStructureId).name}
        >
          <ProfileBusinessStructure />
        </ProfileField>

        <ProfileField fieldName="nexusLocationInNewJersey">
          <OnboardingLocationInNewJersey />
        </ProfileField>

        <ProfileField
          fieldName="municipality"
          isVisible={profileData.nexusLocationInNewJersey}
          locked={shouldLockMunicipality()}
        >
          <CannabisLocationAlert />
          <ProfileMunicipality />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          isVisible={displayHomedBaseBusinessQuestion()}
          hideHeader={true}
          boldAltDescription={true}
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
          <ProfileNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className={"max-width-38rem"}>
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
          {business?.profileData.naicsCode && (
            <div data-testid={"profile-naics-code"}>
              <ProfileField fieldName="naicsCode" noLabel={true}>
                <ProfileNaicsCode />
              </ProfileField>
            </div>
          )}
        </ProfileField>
      </>
    )
  };

  const foreignBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <ProfileTabHeader tab="info" />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}

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
          <ProfileNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className={"max-width-38rem"}>
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    )
  };

  const startingNewBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <ProfileNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    documents: (
      <>
        <ProfileTabHeader tab="documents" />

        <ProfileField
          fieldName="documents"
          isVisible={LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
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
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}

        <ProfileField
          fieldName="businessName"
          locked={shouldLockFormationFields}
          isVisible={!shouldShowTradeNameElements()}
        >
          <ProfileBusinessName required={isBusinessNameRequired()} />
        </ProfileField>
        <ProfileField
          fieldName="responsibleOwnerName"
          isVisible={shouldShowTradeNameElements()}
          locked={hasSubmittedTaxData}
        >
          <ProfileResponsibleOwnerName />
        </ProfileField>
        <ProfileField fieldName="tradeName" isVisible={shouldShowTradeNameElements()}>
          <ProfileTradeName />
        </ProfileField>
        <ProfileField fieldName="industryId">
          <OnboardingIndustry />
          <ProfileNonEssentialQuestionsSection />
        </ProfileField>
        <ProfileField
          fieldName="sectorId"
          isVisible={profileData.industryId === "generic" || !!props.CMS_ONLY_fakeBusiness}
        >
          <OnboardingSectors />
        </ProfileField>
        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!business?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <ProfileDateOfFormation futureAllowed={true} />
        </ProfileField>
        <ProfileField
          fieldName="legalStructureId"
          noLabel={true}
          locked={shouldLockFormationFields}
          lockedValueFormatter={(legalStructureId): string => LookupLegalStructureById(legalStructureId).name}
        >
          <ProfileBusinessStructure />
        </ProfileField>

        <ProfileField fieldName="municipality" locked={shouldLockMunicipality()}>
          <CannabisLocationAlert />
          <ProfileMunicipality />
        </ProfileField>
        <ProfileField
          fieldName="homeBasedBusiness"
          isVisible={displayHomedBaseBusinessQuestion()}
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          hideHeader={true}
          boldAltDescription={true}
        >
          <OnboardingHomeBasedBusiness />
        </ProfileField>
        <ProfileField
          fieldName="ownershipTypeIds"
          isVisible={
            LookupOperatingPhaseById(business?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields
          }
        >
          <ProfileOwnership />
        </ProfileField>
        <ProfileField
          fieldName="existingEmployees"
          isVisible={
            LookupOperatingPhaseById(business?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields
          }
        >
          <ProfileExistingEmployees required />
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
          isVisible={LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
            "entityId"
          )}
          locked={shouldLockFormationFields}
        >
          <ProfileEntityId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <ProfileEmployerId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className="max-width-38rem">
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    )
  };

  const owningBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <ProfileNotes handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    ),
    documents: <></>,
    info: (
      <>
        <ProfileTabHeader tab="info" />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}

        <ProfileField fieldName="businessName" isVisible={!shouldShowTradeNameElements()}>
          <ProfileBusinessName />
        </ProfileField>

        <ProfileField
          fieldName="responsibleOwnerName"
          isVisible={shouldShowTradeNameElements()}
          locked={hasSubmittedTaxData}
        >
          <ProfileResponsibleOwnerName />
        </ProfileField>

        <ProfileField fieldName="tradeName" isVisible={shouldShowTradeNameElements()}>
          <ProfileTradeName />
        </ProfileField>

        <ProfileField fieldName="sectorId">
          <OnboardingSectors />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
            "formationDate"
          )}
        >
          <ProfileDateOfFormation futureAllowed={false} />
        </ProfileField>

        <ProfileField fieldName="existingEmployees">
          <ProfileExistingEmployees />
        </ProfileField>

        <ProfileField fieldName="municipality" locked={shouldLockMunicipality()}>
          <ProfileMunicipality />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          isVisible={displayHomedBaseBusinessQuestion()}
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          hideHeader={true}
          boldAltDescription={true}
        >
          <OnboardingHomeBasedBusiness />
        </ProfileField>

        <ProfileField fieldName="ownershipTypeIds">
          <ProfileOwnership />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        {business?.profileData.naicsCode && (
          <div data-testid={"profile-naics-code"}>
            <ProfileField fieldName="naicsCode" noLabel={true}>
              <ProfileNaicsCode />
            </ProfileField>
          </div>
        )}

        <ProfileField fieldName="entityId">
          <ProfileEntityId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <ProfileEmployerId handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="taxId" noLabel={true}>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className={"max-width-38rem"}>
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <OnboardingTaxId handleChangeOverride={showRegistrationModalForGuest()} />
            )}
          </div>
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <ProfileTaxPin handleChangeOverride={showRegistrationModalForGuest()} />
        </ProfileField>
      </>
    )
  };

  return (
    <profileFormContext.Provider value={formContextState}>
      <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData)
            },
            setProfileData,
            onBack
          }}
        >
          <PageSkeleton>
            <NavBar showSidebar={true} hideMiniRoadmap={true} />
            <main id="main" data-testid={"main"}>
              <div className="usa-section padding-top-0 desktop:padding-top-3">
                <EscapeModal
                  isOpen={escapeModal}
                  close={(): void => setEscapeModal(false)}
                  primaryButtonOnClick={(): void => {
                    redirect();
                  }}
                />
                <FormationDateDeletionModal
                  isOpen={isFormationDateDeletionModalOpen}
                  handleCancel={(): void => setFormationDateDeletionModalOpen(false)}
                  handleDelete={onSubmit}
                />
                <SingleColumnContainer>
                  {alert && <ProfileSnackbarAlert alert={alert} close={(): void => setAlert(undefined)} />}
                  <UserDataErrorAlert />
                </SingleColumnContainer>
                <div className="margin-top-6 desktop:margin-top-0">
                  <SidebarPageLayout
                    divider={false}
                    outlineBox={false}
                    stackNav={true}
                    navChildren={
                      <ProfileTabNav
                        business={business}
                        businessPersona={businessPersona}
                        foreignBusinessType={foreignBusinessType}
                        activeTab={profileTab}
                        setProfileTab={(tab: ProfileTabs): void => {
                          setProfileTab(tab);
                        }}
                      />
                    }
                  >
                    {business === undefined ? (
                      <div className="padding-top-0 desktop:padding-top-6 padding-bottom-15">
                        <CircularIndicator />
                      </div>
                    ) : (
                      <>
                        <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                          {getElements()}
                          <div className="margin-top-2">
                            <DevOnlyResetUserDataButton />
                            <div className="float-right fdr">
                              <SecondaryButton
                                isColor="primary"
                                onClick={(): Promise<void> => onBack()}
                                dataTestId="back"
                              >
                                {Config.profileDefaults.default.backButtonText}
                              </SecondaryButton>
                              <PrimaryButton
                                isColor="primary"
                                isSubmitButton={true}
                                onClick={(): void => {}}
                                isRightMarginRemoved={true}
                                dataTestId="save"
                                isLoading={isLoading}
                              >
                                {Config.profileDefaults.default.saveButtonText}
                              </PrimaryButton>
                            </div>
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
      municipalities: loadAllMunicipalities()
    }
  };
};

export default ProfilePage;
