import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { ExistingEmployees } from "@/components/data-fields/ExistingEmployees";
import { Sectors } from "@/components/data-fields/Sectors";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { ModalOneButton } from "@/components/ModalOneButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { filterFundings, sortFundingsForUser } from "@/lib/domain-logic/sidebarCardsHelpers";
import {
  createEmptyUser,
  createEmptyUserData,
  OperatingPhaseId,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { loadAllFundings } from "@businessnjgovnavigator/shared/static";
import { Funding } from "@businessnjgovnavigator/shared/types";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/compat/router";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  fundings: Funding[];
  noAuth: boolean;
  CMS_PREVIEW_ONLY_OPEN_MODAL?: number;
}

const FundingsHeader = (): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();

  return (
    <div
      className={
        "bg-accent-cool-lightest padding-bottom-4 padding-top-3 border-bottom border-accent-cool-light"
      }
    >
      <div className={"margin-left-3ch"}>
        <div className="desktop:grid-col-6 display-block padding-bottom-3">
          <UnStyledButton
            dataTestid={"njeda-logo-button"}
            isButtonALink={true}
            ariaLabel={Config.fundingsOnboardingModal.pageHeader.logoAriaText}
            onClick={() => {
              router && router.push(Config.fundingsOnboardingModal.pageHeader.logoLink);
            }}
          >
            <img src="/img/njeda-logo.webp" alt="" />
          </UnStyledButton>
        </div>
        <Heading
          level={1}
          className="text-base-darkest margin-bottom-4 desktop:margin-bottom-3 text-accent-cool-darker"
        >
          {Config.fundingsOnboardingModal.pageHeader.headerText}
        </Heading>
        <div className={"text-lg-left text-accent-cool-dark-medium margin-bottom-1"}>
          {Config.fundingsOnboardingModal.pageHeader.subHeaderText}
        </div>
        <PrimaryButton
          isColor={"accent-cool-darker"}
          onClick={() => {
            router && router.push(ROUTES.dashboard);
          }}
        >
          {Config.fundingsOnboardingModal.pageHeader.buttonText}
        </PrimaryButton>
      </div>
    </div>
  );
};

const NJEDAFundingsOnboardingPage = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const currentUserData = createEmptyUserData(createEmptyUser());
  const { business, updateQueue, createUpdateQueue } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(
    business?.profileData ||
      currentUserData.businesses[currentUserData.currentBusinessId].profileData,
  );
  const [isNonProfit, setIsNonProfit] = useState<boolean | undefined>(undefined);
  const [numberOfEmployees, setNumberofEmployees] = useState<string>(
    business?.profileData.existingEmployees ?? "",
  );
  const [shouldCloseModal, setShouldCloseModal] = useState<boolean>(
    props.CMS_PREVIEW_ONLY_OPEN_MODAL !== undefined && props.CMS_PREVIEW_ONLY_OPEN_MODAL <= 0,
  );

  const [filteredFundings, setFilteredFundings] = useState<Funding[]>(props.fundings);
  const [shouldShowErrorAlert, setShouldShowErrorAlert] = useState<boolean>(false);

  const getQuestionsAnsweredCount = (): number => {
    let count = 0;
    if (profileData.sectorId !== undefined) {
      count += 1;
    }

    if (numberOfEmployees !== "") {
      count += 1;
    }

    if (isNonProfit !== undefined) {
      count += 1;
    }
    return count;
  };

  const allQuestionsAnswered = getQuestionsAnsweredCount() === 3;

  useEffect(() => {
    if (!updateQueue) {
      createUpdateQueue(currentUserData);
    }
  }, [updateQueue, createUpdateQueue, currentUserData]);

  const saveUserData = async (): Promise<void> => {
    onSubmit();

    if (allQuestionsAnswered) {
      updateQueue?.queueBusiness({
        ...updateQueue?.currentBusiness(),
        onboardingFormProgress: "COMPLETED",
      });
      updateQueue?.queueProfileData({
        businessPersona: "OWNING",
        operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        industryId: "generic",
        legalStructureId: isNonProfit ? "nonprofit" : undefined,
        existingEmployees: numberOfEmployees,
        sectorId: profileData.sectorId,
      });
      updateQueue?.queuePreferences({
        visibleSidebarCards: ["not-registered-up-and-running"],
        isNonProfitFromFunding: isNonProfit,
      });
      updateQueue?.queueUser({
        accountCreationSource: "NJEDA",
      });
      await updateQueue?.update();
      setShouldCloseModal(true);
      setFilteredFundings(getFilteredAndSortedFundings());
    } else {
      setShouldShowErrorAlert(true);
    }
  };

  const getFilteredAndSortedFundings = (): Funding[] => {
    if (updateQueue?.currentBusiness().profileData.sectorId === "cannabis") {
      return [];
    }

    return sortFundingsForUser(
      filterFundings({
        fundings: filteredFundings,
        business: updateQueue?.currentBusiness(),
      }).filter((it) => {
        return it.agency?.includes("njeda");
      }),
      updateQueue?.current(),
    );
  };

  const shouldShowEmployeeCountError = (): boolean => {
    return shouldShowErrorAlert && numberOfEmployees.length === 0;
  };

  const shouldShowNonProfitError = (): boolean => {
    return shouldShowErrorAlert && isNonProfit === undefined;
  };

  const { onSubmit, state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  const fundingEntry = (funding: Funding, hideTopBorder: boolean): ReactElement => {
    return (
      <div className={"margin-left-3ch"} key={funding.id}>
        <OpportunityCard
          key={funding.id}
          opportunity={funding}
          urlPath="funding"
          removeHideButton={true}
          removeLabel={true}
          hideTopBorder={hideTopBorder}
        />
      </div>
    );
  };

  const radioButtonOption = (option: string, error: boolean): ReactElement => {
    return (
      <div key={option}>
        <FormControlLabel
          aria-label={option}
          style={{ alignItems: "center" }}
          labelPlacement="end"
          key={option}
          data-testid={option}
          value={option}
          control={<Radio color={error ? "error" : "primary"} />}
          label={option}
        />
      </div>
    );
  };

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "OWNING",
          },
          setProfileData,
          onBack: () => {},
        }}
      >
        <>
          <ModalOneButton
            isOpen={!shouldCloseModal}
            title={Config.fundingsOnboardingModal.modalHeader}
            primaryButtonOnClick={() => {
              saveUserData();
            }}
            primaryButtonText={Config.fundingsOnboardingModal.saveButtonText}
            maxWidth={true}
          >
            <div>
              <div className={"padding-bottom-3"}>
                {shouldShowErrorAlert && (
                  <Alert variant={"error"}>
                    {getQuestionsAnsweredCount() === 2
                      ? Config.fundingsOnboardingModal.incompleteWarningSingularText
                      : Config.fundingsOnboardingModal.incompleteWarningMultipleText}
                  </Alert>
                )}
                {!shouldShowErrorAlert && (
                  <Alert variant={"info"}>
                    <Content>{Config.fundingsOnboardingModal.headerTooltip}</Content>
                  </Alert>
                )}
              </div>
              <div className={"text-bold"}>
                <FieldLabelDescriptionOnly fieldName="sectorId" />
                <Sectors />
              </div>

              <div className={"padding-top-1 border-error error-side-border"}>
                <WithErrorBar hasError={shouldShowEmployeeCountError()} type={"ALWAYS"}>
                  <div>
                    <div className={"text-bold"}>
                      {Config.fundingsOnboardingModal.numberOfEmployeesQuestion.questionText}
                    </div>
                    <ExistingEmployees
                      onChange={(val) => {
                        setNumberofEmployees(val);
                      }}
                    />
                  </div>
                  {shouldShowEmployeeCountError() && (
                    <div
                      className="text-error-dark text-bold"
                      data-testid="business-structure-error"
                    >
                      {Config.fundingsOnboardingModal.numberOfEmployeesQuestion.selectAnAnswerText}
                    </div>
                  )}
                </WithErrorBar>
              </div>

              <div className={"padding-top-1"}>
                <WithErrorBar hasError={shouldShowNonProfitError()} type={"ALWAYS"}>
                  <div className={"text-bold"}>
                    {Config.fundingsOnboardingModal.nonProfitQuestion.questionText}
                  </div>
                  <FormControl variant="outlined" fullWidth>
                    <RadioGroup
                      aria-label="Nonprofit status"
                      name="nonprofit-status"
                      onChange={(event) => {
                        setIsNonProfit(
                          (event.target.value as string) ===
                            Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes,
                        );
                      }}
                      row={true}
                    >
                      {radioButtonOption(
                        Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes,
                        shouldShowNonProfitError(),
                      )}
                      {radioButtonOption(
                        Config.fundingsOnboardingModal.nonProfitQuestion.responses.no,
                        shouldShowNonProfitError(),
                      )}
                    </RadioGroup>
                  </FormControl>
                  {shouldShowNonProfitError() && (
                    <div
                      className="text-error-dark text-bold"
                      data-testid="business-structure-error"
                    >
                      {Config.fundingsOnboardingModal.nonProfitQuestion.selectAnAnswerText}
                    </div>
                  )}
                </WithErrorBar>
              </div>
            </div>
          </ModalOneButton>
          <FundingsHeader />
          {filteredFundings.length === 0 && (
            <Alert variant={"info"} dataTestid={"alert-no-results"}>
              <Content>{Config.fundingsOnboardingModal.page.noResultsFoundAlertText}</Content>
            </Alert>
          )}
          {filteredFundings.map((funding, index) => {
            return fundingEntry(funding, index === 0);
          })}
        </>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  return {
    props: {
      fundings: loadAllFundings(),
      noAuth: true,
    },
  };
};

export default NJEDAFundingsOnboardingPage;
