import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { BusinessStructure } from "@/components/data-fields/BusinessStructure";
import { DateOfFormation } from "@/components/data-fields/DateOfFormation";
import { ElevatorOwningBusiness } from "@/components/data-fields/ElevatorOwningBusiness";
import { EmployerId } from "@/components/data-fields/EmployerId";
import { EntityId } from "@/components/data-fields/EntityId";
import { ExistingEmployees } from "@/components/data-fields/ExistingEmployees";
import { ForeignBusinessTypeField } from "@/components/data-fields/ForeignBusinessTypeField";
import { HomeBasedBusiness } from "@/components/data-fields/HomeBasedBusiness";
import { Industry } from "@/components/data-fields/Industry";
import { MunicipalityField } from "@/components/data-fields/MunicipalityField";
import { NaicsCode } from "@/components/data-fields/NaicsCode";
import { NexusBusinessNameField } from "@/components/data-fields/NexusBusinessNameField";
import { NexusDBANameField } from "@/components/data-fields/NexusDBANameField";
import { NonEssentialQuestionsSection } from "@/components/data-fields/non-essential-questions/NonEssentialQuestionsSection";
import { Notes } from "@/components/data-fields/Notes";
import { Ownership } from "@/components/data-fields/Ownership";
import { RenovationQuestion } from "@/components/data-fields/RenovationQuestion";
import { ResponsibleOwnerName } from "@/components/data-fields/ResponsibleOwnerName";
import { Sectors } from "@/components/data-fields/Sectors";
import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { TradeName } from "@/components/data-fields/TradeName";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { FormationDateDeletionModal } from "@/components/FormationDateDeletionModal";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SidebarPageLayout } from "@/components/njwds-layout/SidebarPageLayout";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { DevOnlyResetUserDataButton } from "@/components/profile/DevOnlyResetUserDataButton";
import { ProfileDocuments } from "@/components/profile/ProfileDocuments";
import { ProfileErrorAlert } from "@/components/profile/ProfileErrorAlert";
import { ProfileEscapeModal } from "@/components/profile/ProfileEscapeModal";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileNewJerseyAddress } from "@/components/profile/ProfileNewJerseyAddress";
import { ProfileNoteDisclaimerForSubmittingData } from "@/components/profile/ProfileNoteForBusinessesFormedOutsideNavigator";
import { ProfileOpportunitiesAlert } from "@/components/profile/ProfileOpportunitiesAlert";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { ProfileTabNav } from "@/components/profile/ProfileTabNav";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AddressContext } from "@/contexts/addressContext";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
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
  determineForeignBusinessType,
  einTaskId,
  emptyAddressData,
  ForeignBusinessType,
  formationTaskId,
  hasCompletedFormation,
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  Municipality,
  naicsCodeTaskId,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import {
  isNexusBusiness,
  isOwningBusiness,
  isStartingBusiness,
} from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { nexusLocationInNewJersey } from "@businessnjgovnavigator/shared/domain-logic/nexusLocationInNewJersey";
import dayjs from "dayjs";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useContext, useState } from "react";

interface Props {
  municipalities: Municipality[];
  CMS_ONLY_businessPersona?: BusinessPersona; // for CMS only
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
  const config = getMergedConfig();
  const userDataFromHook = useUserData();
  const updateQueue = userDataFromHook.updateQueue;
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { Config } = useConfig();
  const businessPersona: BusinessPersona = props.CMS_ONLY_businessPersona ?? profileData.businessPersona;
  const foreignBusinessType: ForeignBusinessType = determineForeignBusinessType(
    profileData.foreignBusinessTypeIds
  );
  const [addressData, setAddressData] = useState(emptyAddressData);
  const {
    FormFuncWrapper,
    onSubmit,
    tab: profileTab,
    onTabChange: setProfileTab,
    state: formContextState,
    getInvalidFieldIds,
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
    if (isStartingBusiness(business)) {
      analytics.event.profile_back_to_roadmap.click.view_roadmap();
    }
    if (deepEqual(profileData, business.profileData)) {
      await redirect(undefined, router.replace);
    } else {
      setEscapeModal(true);
    }
  };

  const showNeedsAccountModalForGuest = (): (() => void) | undefined => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return () => {
        return setShowNeedsAccountModal(true);
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

      if (isStartingBusiness(business) || isOwningBusiness(business)) {
        updateQueue.queueFormationFormData(addressData);
      }

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
    if (isDomesticEmployer) {
      return domesticEmployerBusinessElements[profileTab];
    }
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
    if (nexusLocationInNewJersey(profileData)) {
      return false;
    }
    return isHomeBasedBusinessApplicable(profileData.industryId);
  };

  const displayPlannedRenovationQuestionQuestion = (): boolean => {
    return (
      profileData.homeBasedBusiness === false &&
      (isNexusBusiness(business) || profileData.businessPersona === "STARTING")
    );
  };

  const displayElevatorQuestion = (): boolean => {
    if (!business) return false;
    return profileData.homeBasedBusiness === false && profileData.businessPersona === "STARTING";
  };

  const hasSubmittedTaxData =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";

  const nexusBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}
        <ProfileNoteDisclaimerForSubmittingData business={business} isAuthenticated={isAuthenticated} />

        <ProfileField fieldName="foreignBusinessTypeIds">
          <ForeignBusinessTypeField required />
        </ProfileField>

        <ProfileField
          fieldName="businessName"
          isVisible={shouldShowNexusBusinessNameElements()}
          noLabel={true}
        >
          <NexusBusinessNameField />
        </ProfileField>

        <ProfileField
          fieldName="nexusDbaName"
          isVisible={shouldShowNexusBusinessNameElements() && !!profileData.nexusDbaName}
        >
          <NexusDBANameField />
        </ProfileField>

        <ProfileField fieldName="industryId">
          <Industry />
          <NonEssentialQuestionsSection />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!business?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <DateOfFormation futureAllowed={true} />
        </ProfileField>

        <ProfileField
          fieldName="legalStructureId"
          noLabel={true}
          locked={shouldLockFormationFields}
          lockedValueFormatter={(legalStructureId): string => LookupLegalStructureById(legalStructureId).name}
        >
          <BusinessStructure />
        </ProfileField>

        <ProfileField
          fieldName="municipality"
          isVisible={nexusLocationInNewJersey(profileData)}
          locked={shouldLockMunicipality()}
        >
          <CannabisLocationAlert industryId={business?.profileData.industryId} />
          <MunicipalityField />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          isVisible={displayHomedBaseBusinessQuestion()}
          hideHeader={true}
          boldAltDescription={true}
        >
          <HomeBasedBusiness />
        </ProfileField>

        <ProfileField
          fieldName="plannedRenovationQuestion"
          isVisible={displayPlannedRenovationQuestionQuestion()}
          hideHeader={true}
          displayAltDescription={true}
          boldAltDescription={true}
        >
          <RenovationQuestion />
        </ProfileField>
      </>
    ),
    documents: <></>,
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
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
              <TaxId handleChangeOverride={showNeedsAccountModalForGuest()} />
            )}
          </div>
          {business?.profileData.naicsCode && (
            <div data-testid={"profile-naics-code"}>
              <ProfileField fieldName="naicsCode" noLabel={true}>
                <NaicsCode />
              </ProfileField>
            </div>
          )}
        </ProfileField>
      </>
    ),
  };

  const foreignBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}
        <ProfileNoteDisclaimerForSubmittingData business={business} isAuthenticated={isAuthenticated} />
        <ProfileField fieldName="businessName">
          <BusinessName />
        </ProfileField>
        <ProfileField fieldName="foreignBusinessTypeIds">
          <ForeignBusinessTypeField required />
        </ProfileField>
      </>
    ),
    documents: <></>,
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
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
              <TaxId handleChangeOverride={showNeedsAccountModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    ),
  };

  const isDomesticEmployer =
    profileData.businessPersona === "STARTING" && profileData.industryId === "domestic-employer";

  const startingNewBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
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
          <ProfileDocuments />
        </ProfileField>
      </>
    ),
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}
        <ProfileNoteDisclaimerForSubmittingData business={business} isAuthenticated={isAuthenticated} />

        <ProfileField
          fieldName="businessName"
          locked={shouldLockFormationFields}
          isVisible={!shouldShowTradeNameElements()}
        >
          <BusinessName />
        </ProfileField>

        <ProfileNewJerseyAddress />

        <ProfileField
          fieldName="responsibleOwnerName"
          isVisible={shouldShowTradeNameElements()}
          locked={hasSubmittedTaxData}
        >
          <ResponsibleOwnerName />
        </ProfileField>
        <ProfileField fieldName="tradeName" isVisible={shouldShowTradeNameElements()}>
          <TradeName />
        </ProfileField>
        <ProfileField fieldName="industryId">
          <Industry />
          <NonEssentialQuestionsSection />
        </ProfileField>
        <ProfileField
          fieldName="sectorId"
          isVisible={profileData.industryId === "generic" || !!props.CMS_ONLY_fakeBusiness}
        >
          <Sectors />
        </ProfileField>
        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!business?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <DateOfFormation futureAllowed={true} />
        </ProfileField>
        <ProfileField
          fieldName="legalStructureId"
          noLabel={true}
          locked={shouldLockFormationFields}
          lockedValueFormatter={(legalStructureId): string => LookupLegalStructureById(legalStructureId).name}
        >
          <BusinessStructure />
        </ProfileField>

        <ProfileField fieldName="municipality" locked={shouldLockMunicipality()}>
          <CannabisLocationAlert industryId={business?.profileData.industryId} />
          <MunicipalityField />
        </ProfileField>
        <ProfileField
          fieldName="homeBasedBusiness"
          isVisible={displayHomedBaseBusinessQuestion()}
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          hideHeader={true}
          boldAltDescription={true}
        >
          <HomeBasedBusiness />
        </ProfileField>

        <ProfileField
          fieldName="plannedRenovationQuestion"
          isVisible={displayPlannedRenovationQuestionQuestion()}
          hideHeader={true}
          displayAltDescription={true}
          boldAltDescription={true}
        >
          <RenovationQuestion />
        </ProfileField>

        <ProfileField
          fieldName="elevatorOwningBusiness"
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          isVisible={displayElevatorQuestion()}
          hideHeader={true}
          boldAltDescription={true}
        >
          <ElevatorOwningBusiness />
        </ProfileField>
        <ProfileField
          fieldName="ownershipTypeIds"
          isVisible={
            LookupOperatingPhaseById(business?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields
          }
        >
          <Ownership />
        </ProfileField>
        <ProfileField
          fieldName="existingEmployees"
          isVisible={
            LookupOperatingPhaseById(business?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields
          }
        >
          <ExistingEmployees />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="naicsCode" noLabel={true}>
          <NaicsCode />
        </ProfileField>

        <ProfileField
          fieldName="entityId"
          isVisible={LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
            "entityId"
          )}
          locked={shouldLockFormationFields}
        >
          <EntityId handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <EmployerId handleChangeOverride={showNeedsAccountModalForGuest()} />
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
              <TaxId handleChangeOverride={showNeedsAccountModalForGuest()} />
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
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </>
    ),
    documents: <></>,
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} />
        {displayOpportunityAlert && <ProfileOpportunitiesAlert />}
        <ProfileNoteDisclaimerForSubmittingData business={business} isAuthenticated={isAuthenticated} />

        <ProfileField fieldName="businessName" isVisible={!shouldShowTradeNameElements()}>
          <BusinessName />
        </ProfileField>

        <ProfileNewJerseyAddress />

        <ProfileField
          fieldName="responsibleOwnerName"
          isVisible={shouldShowTradeNameElements()}
          locked={hasSubmittedTaxData}
        >
          <ResponsibleOwnerName />
        </ProfileField>

        <ProfileField fieldName="tradeName" isVisible={shouldShowTradeNameElements()}>
          <TradeName />
        </ProfileField>

        <ProfileField fieldName="sectorId">
          <Sectors />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
            "formationDate"
          )}
        >
          <DateOfFormation futureAllowed={false} />
        </ProfileField>

        <ProfileField fieldName="existingEmployees">
          <ExistingEmployees />
        </ProfileField>

        <ProfileField fieldName="municipality" locked={shouldLockMunicipality()}>
          <MunicipalityField />
        </ProfileField>

        <ProfileField
          fieldName="homeBasedBusiness"
          isVisible={displayHomedBaseBusinessQuestion()}
          displayAltDescription={displayAltHomeBasedBusinessDescription}
          hideHeader={true}
          boldAltDescription={true}
        >
          <HomeBasedBusiness />
        </ProfileField>

        <ProfileField fieldName="ownershipTypeIds">
          <Ownership />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        {business?.profileData.naicsCode && (
          <div data-testid={"profile-naics-code"}>
            <ProfileField fieldName="naicsCode" noLabel={true}>
              <NaicsCode />
            </ProfileField>
          </div>
        )}

        <ProfileField fieldName="entityId">
          <EntityId handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <EmployerId handleChangeOverride={showNeedsAccountModalForGuest()} />
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
              <TaxId handleChangeOverride={showNeedsAccountModalForGuest()} />
            )}
          </div>
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <TaxPin handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </>
    ),
  };

  const domesticEmployerBusinessElements: Record<ProfileTabs, ReactNode> = {
    notes: (
      <>
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </>
    ),
    documents: <></>,
    info: (
      <>
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} />
        <ProfileNoteDisclaimerForSubmittingData business={business} isAuthenticated={isAuthenticated} />
        <ProfileField
          fieldName="businessName"
          locked={shouldLockFormationFields}
          isVisible={!shouldShowTradeNameElements()}
        >
          <BusinessName />
        </ProfileField>

        <ProfileField fieldName="industryId">
          <Industry />
        </ProfileField>
      </>
    ),
    numbers: (
      <>
        <ProfileTabHeader tab="numbers" />

        <ProfileField fieldName="naicsCode" noLabel={true}>
          <NaicsCode />
        </ProfileField>
        <ProfileField fieldName="employerId">
          <EmployerId handleChangeOverride={showNeedsAccountModalForGuest()} />
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
              <TaxId handleChangeOverride={showNeedsAccountModalForGuest()} />
            )}
          </div>
        </ProfileField>
      </>
    ),
  };

  return (
    <ProfileFormContext.Provider value={formContextState}>
      <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData),
            },
            setProfileData,
            onBack,
          }}
        >
          {" "}
          <AddressContext.Provider
            value={{
              state: { addressData },
              setAddressData,
            }}
          >
            <NextSeo title={getNextSeoTitle(config.pagesMetadata.profileTitle)} />
            <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
              <main id="main" data-testid={"main"}>
                <div className="padding-top-0 desktop:padding-top-3">
                  <ProfileEscapeModal
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
                  <div className="margin-top-1 desktop:margin-top-0">
                    {business === undefined ? (
                      <PageCircularIndicator />
                    ) : (
                      <SidebarPageLayout
                        divider={false}
                        outlineBox={false}
                        stackNav={true}
                        nonWrappingLeftColumn={true}
                        titleOverColumns={
                          <ProfileHeader business={business} isAuthenticated={isAuthenticated === "TRUE"} />
                        }
                        navChildren={
                          <ProfileTabNav
                            business={business}
                            businessPersona={businessPersona}
                            activeTab={profileTab}
                            setProfileTab={(tab: ProfileTabs): void => {
                              setProfileTab(tab);
                            }}
                          />
                        }
                      >
                        <>
                          <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
                            {getElements()}
                            <div className="margin-top-2">
                              <ActionBarLayout>
                                <div className="margin-top-2 mobile-lg:margin-top-0">
                                  <SecondaryButton
                                    isColor="primary"
                                    onClick={(): Promise<void> => onBack()}
                                    dataTestId="back"
                                  >
                                    {Config.profileDefaults.default.backButtonText}
                                  </SecondaryButton>
                                </div>
                                <div>
                                  <div className="mobile-lg:display-inline">
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
                              </ActionBarLayout>
                            </div>
                            <DevOnlyResetUserDataButton />
                          </form>
                        </>
                      </SidebarPageLayout>
                    )}
                  </div>
                </div>
              </main>
            </PageSkeleton>{" "}
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </MunicipalitiesContext.Provider>
    </ProfileFormContext.Provider>
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
