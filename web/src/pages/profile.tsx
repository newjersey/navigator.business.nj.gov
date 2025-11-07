import { BusinessName } from "@/components/data-fields/BusinessName";
import { BusinessStructure } from "@/components/data-fields/BusinessStructure";
import { DateOfFormation } from "@/components/data-fields/DateOfFormation";
import { EmployerId } from "@/components/data-fields/EmployerId";
import { EntityId } from "@/components/data-fields/EntityId";
import { ForeignBusinessTypeField } from "@/components/data-fields/ForeignBusinessTypeField";
import { Industry } from "@/components/data-fields/Industry";
import { NaicsCode } from "@/components/data-fields/NaicsCode";
import { NexusBusinessNameField } from "@/components/data-fields/NexusBusinessNameField";
import { NexusDBANameField } from "@/components/data-fields/NexusDBANameField";
import { CertificationsAndFundingNonEssentialQuestions } from "@/components/data-fields/non-essential-questions/CertificationsAndFundingNonEssentialQuestions";
import { IndustryBasedNonEssentialQuestionsSection } from "@/components/data-fields/non-essential-questions/IndustryBasedNonEssentialQuestionsSection";
import { LocationBasedNonEssentialQuestions } from "@/components/data-fields/non-essential-questions/LocationBasedNonEssentialQuestions";
import { NonEssentialQuestionForPersonas } from "@/components/data-fields/non-essential-questions/nonEssentialQuestionsHelpers";
import { Notes } from "@/components/data-fields/Notes";
import { RaffleBingoGamesQuestion } from "@/components/data-fields/RaffleBingoGamesQuestion";
import { ResponsibleOwnerName } from "@/components/data-fields/ResponsibleOwnerName";
import { Sectors } from "@/components/data-fields/Sectors";
import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { TradeName } from "@/components/data-fields/TradeName";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { FormationDateDeletionModal } from "@/components/FormationDateDeletionModal";
import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { ContactTabPanel } from "@/components/profile/ContactTabPanel";
import { DevOnlyResetUserDataButton } from "@/components/profile/DevOnlyResetUserDataButton";
import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { PersonalizeYourTasksTab } from "@/components/profile/PersonalizeYourTasksTab";
import { ProfileAddress } from "@/components/profile/ProfileAddress";
import { displayAltHomeBasedBusinessDescription } from "@/components/profile/profileDisplayLogicHelpers";
import { ProfileDocuments } from "@/components/profile/ProfileDocuments";
import { ProfileErrorAlert } from "@/components/profile/ProfileErrorAlert";
import { ProfileEscapeModal } from "@/components/profile/ProfileEscapeModal";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileLinkToPermitsTabCallout } from "@/components/profile/ProfileLinkToPermitsTabCallout";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ProfileSubSection } from "@/components/profile/ProfileSubSection";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { ProfileTabNav } from "@/components/profile/ProfileTabNav";
import { ProfileTabPanel } from "@/components/profile/ProfileTabPanel";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { AddressContext } from "@/contexts/addressContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";

import { sendChangedNonEssentialQuestionAnalytics } from "@/lib/domain-logic/sendChangedNonEssentialQuestionAnalytics";
import analytics from "@/lib/utils/analytics";
import {
  getFlow,
  scrollToTopOfElement,
  useMountEffectWhenDefined,
  useScrollToPathAnchor,
} from "@/lib/utils/helpers";
import {
  Business,
  BusinessPersona,
  createEmptyProfileData,
  determineForeignBusinessType,
  einTaskId,
  emptyFormationAddressData,
  ForeignBusinessType,
  FormationAddress,
  formationTaskId,
  hasCompletedFormation,
  LookupLegalStructureById,
  Municipality,
  naicsCodeTaskId,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { formatDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { isStartingBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { loadAllMunicipalities } from "@businessnjgovnavigator/shared/static";
import { OnboardingStatus, ProfileTabs, profileTabs } from "@businessnjgovnavigator/shared/types";
import deepEqual from "fast-deep-equal/es6/react";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/compat/router";
import { ReactElement, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EmployerRates } from "@/components/employer-rates/EmployerRates";

interface Props {
  municipalities: Municipality[];
  CMS_ONLY_businessPersona?: BusinessPersona;
  CMS_ONLY_tab?: ProfileTabs;
  CMS_ONLY_fakeBusiness?: Business;
}

const ProfilePage = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [alert, setAlert] = useState<OnboardingStatus | undefined>(undefined);
  const [escapeModal, setEscapeModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shouldLockFormationFields, setShouldLockFormationFields] = useState<boolean>(false);
  const [isFormationDateDeletionModalOpen, setFormationDateDeletionModalOpen] =
    useState<boolean>(false);
  const config = getMergedConfig();
  const userDataFromHook = useUserData();
  const updateQueue = userDataFromHook.updateQueue;
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { Config } = useConfig();
  const businessPersona: BusinessPersona =
    props.CMS_ONLY_businessPersona ?? profileData.businessPersona;
  const foreignBusinessType: ForeignBusinessType = determineForeignBusinessType(
    profileData.foreignBusinessTypeIds,
  );
  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);
  const profileAlertRef = useRef<HTMLDivElement>(null);

  const FEATURE_EMPLOYER_RATES_ENABLED = process.env.FEATURE_EMPLOYER_RATES === "true";

  const getInitTab = (): ProfileTabs => {
    if (props.CMS_ONLY_tab) return props.CMS_ONLY_tab;

    const tabValue = router?.query[QUERIES.tab] as string;

    const initTab = profileTabs.includes(tabValue as ProfileTabs)
      ? (tabValue as ProfileTabs)
      : profileTabs[0];

    return initTab;
  };

  const {
    FormFuncWrapper,
    onSubmit,
    tab: profileTab,
    onTabChange: setProfileTab,
    state: formContextState,
    getInvalidFieldIds,
  } = useFormContextHelper(createDataFormErrorMap(), getInitTab());

  const permitsRef = useRef<HTMLDivElement>(null);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const redirect = (
    params?: { [key: string]: any },
    routerType = router!.push,
  ): Promise<boolean> => {
    const urlParams = params ? `?${new URLSearchParams(params).toString()}` : "";
    return routerType(`${ROUTES.dashboard}${urlParams}`);
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  useScrollToPathAnchor();

  useMountEffectWhenDefined(() => {
    if (business) {
      setProfileData(business.profileData);
      setShouldLockFormationFields(hasCompletedFormation(business));
    }
  }, business);

  const onBack = async (): Promise<void> => {
    if (!business) return;
    if (isStartingBusiness(business)) {
      analytics.event.profile_back_to_roadmap.click.view_roadmap();
    }
    if (deepEqual(profileData, business.profileData)) {
      router && (await redirect(undefined, router.replace));
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

  const hasErrors = useMemo(() => getInvalidFieldIds().length > 0, [getInvalidFieldIds]);

  useEffect(() => {
    if (hasErrors) {
      scrollToTopOfElement(profileAlertRef.current, { focusElement: true });
    }
  }, [hasErrors]);

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
          updateQueue.queueTaskProgress({ [formationTaskId]: "TO_DO" });
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
          .queueTaskProgress({ [naicsCodeTaskId]: "TO_DO" });
      }

      updateQueue.queueProfileData(profileData);
      updateQueue.queueFormationFormData(formationAddressData);
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
    },
  );

  const sendOnSaveAnalytics = (prevProfileData: ProfileData, newProfileData: ProfileData): void => {
    if (prevProfileData.dateOfFormation !== newProfileData.dateOfFormation) {
      analytics.event.profile_formation_date.submit.formation_date_changed();
    }

    sendChangedNonEssentialQuestionAnalytics(prevProfileData, newProfileData);

    const municipalityEnteredForFirstTime =
      prevProfileData.municipality === undefined && newProfileData.municipality !== undefined;

    if (municipalityEnteredForFirstTime) {
      analytics.event.profile_location_question.submit.location_entered_for_first_time();
    }
  };

  const isDomesticEmployer =
    profileData.businessPersona === "STARTING" && profileData.industryId === "domestic-employer";

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
      "nexusBusinessElements",
    );
  };

  const shouldShowTradeNameElements = (): boolean => {
    if (!business) return false;
    return LookupLegalStructureById(business.profileData.legalStructureId).hasTradeName;
  };

  const displayRaffleBingoGameQuestion = (): boolean => {
    if (!business) return false;
    return profileData.legalStructureId === "nonprofit";
  };

  const hasSubmittedTaxData =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";

  const nexusBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <div id="tabpanel-info" role="tabpanel" aria-labelledby="tab-info">
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />

        <ProfileField
          fieldName="businessName"
          isVisible={shouldShowNexusBusinessNameElements()}
          noLabel
        >
          <NexusBusinessNameField />
        </ProfileField>

        <ProfileField
          fieldName="nexusDbaName"
          isVisible={shouldShowNexusBusinessNameElements() && !!profileData.nexusDbaName}
        >
          <NexusDBANameField />
        </ProfileField>

        <ProfileAddress />

        <ProfileField fieldName="foreignBusinessTypeIds">
          <ForeignBusinessTypeField required />
        </ProfileField>

        <ProfileField fieldName="industryId">
          <Industry />
          <ProfileLinkToPermitsTabCallout permitsRef={permitsRef} setProfileTab={setProfileTab} />
        </ProfileField>

        <ProfileField
          fieldName="legalStructureId"
          noLabel
          locked={shouldLockFormationFields}
          lockedValueFormatter={(legalStructureId): string =>
            LookupLegalStructureById(legalStructureId).name
          }
        >
          <BusinessStructure />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!business?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <DateOfFormation futureAllowed />
        </ProfileField>

        <CertificationsAndFundingNonEssentialQuestions showCannabisAlert />
      </div>
    ),
    contact: (
      <ContactTabPanel fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
    ),
    permits: (
      <div id="tabpanel-permits" role="tabpanel" aria-labelledby="tab-permits">
        <ProfileTabHeader tab="permits" />
        <ProfileSubSection
          heading={Config.profileDefaults.default.locationBasedRequirementsHeader}
          subText={Config.profileDefaults.default.locationBasedRequirementsSubText}
        >
          <LocationBasedNonEssentialQuestions />
        </ProfileSubSection>

        <ProfileSubSection
          heading={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionHeader}
          subText={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionSubText}
        >
          <IndustryBasedNonEssentialQuestionsSection />
        </ProfileSubSection>
      </div>
    ),
    numbers: (
      <div id="tabpanel-numbers" role="tabpanel" aria-labelledby="tab-numbers">
        <ProfileTabHeader tab="numbers" />
        {hasErrors && (
          <Alert dataTestid={"profile-header-inline-alert"} variant={"error"} ref={profileAlertRef}>
            {getProfileErrorAlertText(getInvalidFieldIds().length)}
          </Alert>
        )}
        <ProfileField fieldName="taxId" noLabel>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className={"max-width-38rem"}>
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <TaxId
                dbBusinessTaxId={business?.profileData.taxId}
                handleChangeOverride={showNeedsAccountModalForGuest()}
              />
            )}
          </div>
          {business?.profileData.naicsCode && (
            <div data-testid={"profile-naics-code"}>
              <ProfileField fieldName="naicsCode" noLabel>
                <NaicsCode />
              </ProfileField>
            </div>
          )}
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <TaxPin
            dbBusinessTaxPin={business?.profileData?.taxPin}
            handleChangeOverride={showNeedsAccountModalForGuest()}
          />
        </ProfileField>
      </div>
    ),
    documents: <></>,
    notes: (
      <div id="tabpanel-notes" role="tabpanel" aria-labelledby="tab-notes">
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </div>
    ),
    personalize: (
      <PersonalizeYourTasksTab
        fieldErrors={getInvalidFieldIds()}
        isFormationDateFieldVisible={!!business?.profileData.dateOfFormation}
        lockFormationDateField={shouldLockFormationFields}
        futureAllowed={true}
        profileAlertRef={profileAlertRef}
      />
    ),
  };

  const foreignBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <div id="tabpanel-info" role="tabpanel" aria-labelledby="tab-info">
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
        <ProfileField ignoreContextualInfo fieldName="businessName">
          <BusinessName />
        </ProfileField>
        <ProfileAddress />
        <ProfileField fieldName="foreignBusinessTypeIds">
          <ForeignBusinessTypeField required />
        </ProfileField>
      </div>
    ),
    contact: (
      <ContactTabPanel fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
    ),
    permits: <></>,
    numbers: (
      <div id="tabpanel-numbers" role="tabpanel" aria-labelledby="tab-numbers">
        <ProfileTabHeader tab="numbers" />
        {hasErrors && (
          <Alert dataTestid={"profile-header-inline-alert"} variant={"error"} ref={profileAlertRef}>
            {getProfileErrorAlertText(getInvalidFieldIds().length)}
          </Alert>
        )}
        <ProfileField fieldName="taxId" noLabel>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className={"max-width-38rem"}>
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <TaxId
                dbBusinessTaxId={business?.profileData.taxId}
                handleChangeOverride={showNeedsAccountModalForGuest()}
              />
            )}
          </div>
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <TaxPin
            dbBusinessTaxPin={business?.profileData?.taxPin}
            handleChangeOverride={showNeedsAccountModalForGuest()}
          />
        </ProfileField>
      </div>
    ),
    documents: <></>,
    notes: (
      <div id="tabpanel-notes" role="tabpanel" aria-labelledby="tab-notes">
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </div>
    ),
    personalize: (
      <PersonalizeYourTasksTab
        fieldErrors={getInvalidFieldIds()}
        isFormationDateFieldVisible={false}
        lockFormationDateField={shouldLockFormationFields}
        futureAllowed={false}
        profileAlertRef={profileAlertRef}
      />
    ),
  };

  const startingNewBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <div id="tabpanel-info" role="tabpanel" aria-labelledby="tab-info">
        <ProfileTabHeader tab="info" />
        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
        <ProfileField
          fieldName="businessName"
          locked={shouldLockFormationFields}
          isVisible={!shouldShowTradeNameElements()}
          ignoreContextualInfo
        >
          <BusinessName />
        </ProfileField>
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
        <ProfileAddress />
        <ProfileField fieldName="industryId">
          <Industry />
          <ProfileLinkToPermitsTabCallout permitsRef={permitsRef} setProfileTab={setProfileTab} />
        </ProfileField>
        <ProfileField
          fieldName="sectorId"
          isVisible={profileData.industryId === "generic" || !!props.CMS_ONLY_fakeBusiness}
        >
          <Sectors />
        </ProfileField>
        <ProfileField
          fieldName="legalStructureId"
          noLabel
          locked={shouldLockFormationFields}
          lockedValueFormatter={(legalStructureId): string =>
            LookupLegalStructureById(legalStructureId).name
          }
        >
          <BusinessStructure />
        </ProfileField>
        <ProfileField
          fieldName="raffleBingoGames"
          isVisible={displayRaffleBingoGameQuestion()}
          hideHeader
          displayAltDescription
          boldAltDescription
        >
          <RaffleBingoGamesQuestion />
        </ProfileField>
        <ProfileField
          fieldName="dateOfFormation"
          isVisible={!!business?.profileData.dateOfFormation}
          locked={shouldLockFormationFields}
          lockedValueFormatter={formatDate}
        >
          <DateOfFormation futureAllowed />
        </ProfileField>
        <CertificationsAndFundingNonEssentialQuestions showCannabisAlert />
      </div>
    ),
    contact: (
      <ContactTabPanel fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
    ),
    permits: (
      <div id="tabpanel-permits" role="tabpanel" aria-labelledby="tab-permits">
        <ProfileTabHeader ref={permitsRef} tab="permits" />
        <ProfileSubSection
          heading={Config.profileDefaults.default.locationBasedRequirementsHeader}
          subText={Config.profileDefaults.default.locationBasedRequirementsSubText}
        >
          <LocationBasedNonEssentialQuestions />
        </ProfileSubSection>

        <ProfileSubSection
          heading={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionHeader}
          subText={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionSubText}
        >
          <IndustryBasedNonEssentialQuestionsSection />
        </ProfileSubSection>
      </div>
    ),
    numbers: (
      <div id="tabpanel-numbers" role="tabpanel" aria-labelledby="tab-numbers">
        <ProfileTabHeader tab="numbers" />
        {hasErrors && (
          <Alert dataTestid={"profile-header-inline-alert"} variant={"error"} ref={profileAlertRef}>
            {getProfileErrorAlertText(getInvalidFieldIds().length)}
          </Alert>
        )}
        <ProfileField fieldName="naicsCode" noLabel>
          <NaicsCode />
        </ProfileField>

        <ProfileField
          fieldName="entityId"
          isVisible={LookupLegalStructureById(
            business?.profileData.legalStructureId,
          ).elementsToDisplay.has("entityId")}
          locked={shouldLockFormationFields}
        >
          <EntityId handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="employerId">
          <EmployerId handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>

        <ProfileField fieldName="taxId" noLabel>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className="max-width-38rem">
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <TaxId
                dbBusinessTaxId={business?.profileData.taxId}
                handleChangeOverride={showNeedsAccountModalForGuest()}
              />
            )}
          </div>
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <TaxPin
            dbBusinessTaxPin={business?.profileData?.taxPin}
            handleChangeOverride={showNeedsAccountModalForGuest()}
          />
        </ProfileField>
        {FEATURE_EMPLOYER_RATES_ENABLED && <EmployerRates />}
      </div>
    ),
    documents: (
      <div id="tabpanel-documents" role="tabpanel" aria-labelledby="tab-documents">
        <ProfileTabHeader tab="documents" />

        <ProfileField
          fieldName="documents"
          isVisible={LookupLegalStructureById(
            business?.profileData.legalStructureId,
          ).elementsToDisplay.has("formationDocuments")}
        >
          <ProfileDocuments />
        </ProfileField>
      </div>
    ),
    notes: (
      <div id="tabpanel-notes" role="tabpanel" aria-labelledby="tab-notes">
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </div>
    ),
    personalize: (
      <PersonalizeYourTasksTab
        fieldErrors={getInvalidFieldIds()}
        isFormationDateFieldVisible={!!business?.profileData.dateOfFormation}
        lockFormationDateField={shouldLockFormationFields}
        futureAllowed={true}
        profileAlertRef={profileAlertRef}
      />
    ),
  };

  const owningBusinessElements: Record<ProfileTabs, ReactNode> = {
    info: (
      <div id="tabpanel-info" role="tabpanel" aria-labelledby="tab-info">
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />

        <ProfileField
          ignoreContextualInfo
          fieldName="businessName"
          isVisible={!shouldShowTradeNameElements()}
        >
          <BusinessName />
        </ProfileField>

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

        <ProfileAddress />

        <ProfileField fieldName="sectorId">
          <Sectors />
          <ProfileLinkToPermitsTabCallout permitsRef={permitsRef} setProfileTab={setProfileTab} />
        </ProfileField>

        <ProfileField
          fieldName="dateOfFormation"
          isVisible={LookupLegalStructureById(
            business?.profileData.legalStructureId,
          ).elementsToDisplay.has("formationDate")}
        >
          <DateOfFormation futureAllowed={false} />
        </ProfileField>

        <CertificationsAndFundingNonEssentialQuestions />
      </div>
    ),
    contact: (
      <ContactTabPanel fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
    ),
    permits: (
      <div id="tabpanel-permits" role="tabpanel" aria-labelledby="tab-permits">
        <ProfileTabHeader ref={permitsRef} tab="permits" />
        <ProfileSubSection
          heading={Config.profileDefaults.default.locationBasedRequirementsHeader}
          subText={Config.profileDefaults.default.locationBasedRequirementsSubText}
        >
          <NonEssentialQuestionForPersonas
            questionId={"homeBasedBusiness"}
            displayAltDescription={displayAltHomeBasedBusinessDescription(profileData)}
          />
        </ProfileSubSection>

        <ProfileSubSection
          heading={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionHeader}
          subText={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionSubText}
        >
          <IndustryBasedNonEssentialQuestionsSection />
        </ProfileSubSection>
      </div>
    ),
    numbers: (
      <div id="tabpanel-numbers" role="tabpanel" aria-labelledby="tab-numbers">
        <ProfileTabHeader tab="numbers" />
        {hasErrors && (
          <Alert dataTestid={"profile-header-inline-alert"} variant={"error"} ref={profileAlertRef}>
            {getProfileErrorAlertText(getInvalidFieldIds().length)}
          </Alert>
        )}
        {business?.profileData.naicsCode && (
          <div data-testid={"profile-naics-code"}>
            <ProfileField fieldName="naicsCode" noLabel>
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

        <ProfileField fieldName="taxId" noLabel>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className={"max-width-38rem"}>
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <TaxId
                dbBusinessTaxId={business?.profileData.taxId}
                handleChangeOverride={showNeedsAccountModalForGuest()}
              />
            )}
          </div>
        </ProfileField>

        <ProfileField fieldName="taxPin">
          <TaxPin
            dbBusinessTaxPin={business?.profileData?.taxPin}
            handleChangeOverride={showNeedsAccountModalForGuest()}
          />
        </ProfileField>
        {FEATURE_EMPLOYER_RATES_ENABLED && <EmployerRates />}
      </div>
    ),
    documents: <></>,
    notes: (
      <div id="tabpanel-notes" role="tabpanel" aria-labelledby="tab-notes">
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </div>
    ),
    personalize: (
      <PersonalizeYourTasksTab
        fieldErrors={getInvalidFieldIds()}
        isFormationDateFieldVisible={LookupLegalStructureById(
          business?.profileData.legalStructureId,
        ).elementsToDisplay.has("formationDate")}
        lockFormationDateField={shouldLockFormationFields}
        futureAllowed={false}
        profileAlertRef={profileAlertRef}
      />
    ),
  };

  const domesticEmployerBusinessElements: Record<ProfileTabs, ReactNode> = {
    contact: (
      <ContactTabPanel fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
    ),
    info: (
      <div id="tabpanel-info" role="tabpanel" aria-labelledby="tab-info">
        <ProfileTabHeader tab="info" />

        <ProfileErrorAlert fieldErrors={getInvalidFieldIds()} profileAlertRef={profileAlertRef} />
        <ProfileField
          fieldName="businessName"
          locked={shouldLockFormationFields}
          isVisible={!shouldShowTradeNameElements()}
          ignoreContextualInfo
        >
          <BusinessName />
        </ProfileField>

        <ProfileField fieldName="industryId">
          <Industry />
        </ProfileField>
      </div>
    ),
    permits: <></>,
    numbers: (
      <div id="tabpanel-numbers" role="tabpanel" aria-labelledby="tab-numbers">
        <ProfileTabHeader tab="numbers" />
        {hasErrors && (
          <Alert dataTestid={"profile-header-inline-alert"} variant={"error"} ref={profileAlertRef}>
            {getProfileErrorAlertText(getInvalidFieldIds().length)}
          </Alert>
        )}
        <ProfileField fieldName="naicsCode" noLabel>
          <NaicsCode />
        </ProfileField>
        <ProfileField fieldName="employerId">
          <EmployerId handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
        <ProfileField fieldName="taxId" noLabel>
          <FieldLabelProfile fieldName="taxId" locked={hasSubmittedTaxData} />
          {!hasSubmittedTaxData && (
            <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
          )}
          <div className="max-width-38rem">
            {hasSubmittedTaxData ? (
              <DisabledTaxId />
            ) : (
              <TaxId
                dbBusinessTaxId={business?.profileData.taxId}
                handleChangeOverride={showNeedsAccountModalForGuest()}
              />
            )}
          </div>
        </ProfileField>
      </div>
    ),
    documents: <></>,
    notes: (
      <div id="tabpanel-notes" role="tabpanel" aria-labelledby="tab-notes">
        <ProfileTabHeader tab="notes" />

        <ProfileField fieldName="notes">
          <Notes handleChangeOverride={showNeedsAccountModalForGuest()} />
        </ProfileField>
      </div>
    ),
    personalize: (
      <PersonalizeYourTasksTab
        fieldErrors={getInvalidFieldIds()}
        isFormationDateFieldVisible={false}
        lockFormationDateField={shouldLockFormationFields}
        futureAllowed={false}
        profileAlertRef={profileAlertRef}
      />
    ),
  };

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
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
          <AddressContext.Provider
            value={{
              state: { formationAddressData },
              setAddressData,
            }}
          >
            <NextSeo title={getNextSeoTitle(config.pagesMetadata.profileTitle)} />
            <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
              <main id="main" data-testid={"main"}>
                <div className="padding-top-0 padding-x-2 desktop:padding-top-3 desktop:padding-x-0">
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
                    {alert === "SUCCESS" && (
                      <ProfileSnackbarAlert alert={alert} close={(): void => setAlert(undefined)} />
                    )}
                    <UserDataErrorAlert />
                  </SingleColumnContainer>
                  <div className="margin-top-1 desktop:margin-top-0">
                    {business === undefined ? (
                      <PageCircularIndicator />
                    ) : (
                      <ProfileTabPanel
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
                          <form
                            onSubmit={onSubmit}
                            className={`usa-prose onboarding-form margin-top-2`}
                          >
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
                                      isSubmitButton
                                      onClick={(): void => {
                                        if (hasErrors && profileAlertRef.current) {
                                          profileAlertRef.current.focus();
                                        }
                                      }}
                                      isRightMarginRemoved
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
                      </ProfileTabPanel>
                    )}
                  </div>
                </div>
              </main>
            </PageSkeleton>{" "}
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </MunicipalitiesContext.Provider>
    </DataFormErrorMapContext.Provider>
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
