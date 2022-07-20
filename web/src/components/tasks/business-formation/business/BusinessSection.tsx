import { Button } from "@/components/njwds-extended/Button";
import { GenericTextbox } from "@/components/tasks/business-formation/business/GenericTextBox";
import { MainBusiness } from "@/components/tasks/business-formation/business/MainBusiness";
import { PartnershipRights } from "@/components/tasks/business-formation/business/PartnershipRights";
import { Provisions } from "@/components/tasks/business-formation/business/Provisions";
import { BusinessFormationEmptyFieldAlert } from "@/components/tasks/business-formation/BusinessFormationEmptyFieldAlert";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormationFieldErrorMap, FormationFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures, getCurrentDate, parseDate } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useMemo, useState } from "react";

export const BusinessSection = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap, setTab } = useContext(BusinessFormationContext);
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);
  const { userData, update } = useUserData();

  const requiredFieldsWithError = useMemo(() => {
    const requiredFields: FormationFields[] = [
      "businessName",
      "businessSuffix",
      "businessAddressCity",
      "businessAddressLine1",
      "businessAddressZipCode",
    ];

    const isStartDateValid = (): boolean => {
      if (!state.formationFormData.businessStartDate) return false;
      return (
        parseDate(state.formationFormData.businessStartDate).isValid() &&
        parseDate(state.formationFormData.businessStartDate).isAfter(
          getCurrentDate().subtract(1, "day"),
          "day"
        )
      );
    };

    const isCorp = corpLegalStructures.includes(state.legalStructureId);

    if (isCorp) requiredFields.push("businessTotalStock");

    if (state.legalStructureId == "limited-partnership") {
      state.formationFormData.withdrawals.length === 0 && requiredFields.push("withdrawals");
      state.formationFormData.combinedInvestment.length === 0 && requiredFields.push("combinedInvestment");
      state.formationFormData.dissolution.length === 0 && requiredFields.push("dissolution");
      if (state.formationFormData.canCreateLimitedPartner === undefined) {
        requiredFields.push("canCreateLimitedPartner");
      } else if (state.formationFormData.canCreateLimitedPartner) {
        state.formationFormData.createLimitedPartnerTerms.length === 0 &&
          requiredFields.push("createLimitedPartnerTerms");
      }
      if (state.formationFormData.canGetDistribution === undefined) {
        requiredFields.push("canGetDistribution");
      } else if (state.formationFormData.canGetDistribution) {
        state.formationFormData.getDistributionTerms.length === 0 &&
          requiredFields.push("getDistributionTerms");
      }
      if (state.formationFormData.canMakeDistribution === undefined) {
        requiredFields.push("canMakeDistribution");
      } else if (state.formationFormData.canMakeDistribution) {
        state.formationFormData.makeDistributionTerms.length === 0 &&
          requiredFields.push("makeDistributionTerms");
      }
    }

    const invalidFields = requiredFields.filter(
      (it) => state.errorMap[it].invalid || !state.formationFormData[it]
    );

    if (!isStartDateValid()) {
      invalidFields.push("businessStartDate");
    }

    const isValidBusinessAddressZipCode = (): boolean => {
      if (!state.formationFormData.businessAddressZipCode) return false;
      return zipCodeRange(state.formationFormData.businessAddressZipCode);
    };

    if (!isValidBusinessAddressZipCode() && !invalidFields.includes("businessAddressZipCode")) {
      invalidFields.push("businessAddressZipCode");
    }

    return invalidFields;
  }, [state.formationFormData, state.errorMap, state.legalStructureId]);

  const submitBusinessData = async () => {
    if (!userData) return;

    const filteredProvisions = state.formationFormData.provisions.filter((it) => it !== "");
    setFormationFormData({ ...state.formationFormData, provisions: filteredProvisions });

    const finalUserData = {
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: {
          ...state.formationFormData,
          provisions: filteredProvisions,
        },
      },
    };

    if (requiredFieldsWithError.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...state.errorMap, ...newErrorMappedFields });
      update(finalUserData);
      return;
    }

    update({
      ...finalUserData,
      profileData: {
        ...finalUserData.profileData,
        municipality: state.formationFormData.businessAddressCity,
      },
    });

    analytics.event.business_formation_business_step_continue_button.click.go_to_next_formation_step();

    setShowRequiredFieldsError(false);
    setTab(state.tab + 1);
    scrollToTop();
  };

  return (
    <div data-testid="business-section">
      <MainBusiness />
      {state.legalStructureId == "limited-partnership" ? (
        <>
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <GenericTextbox
            maxChars={400}
            fieldName={"combinedInvestment"}
            required={true}
            placeholderText={Config.businessFormationDefaults.combinedInvestmentPlaceholder}
            title={Config.businessFormationDefaults.combinedInvestmentTitle}
            contentMd={Config.businessFormationDefaults.combinedInvestmentBody}
          />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <GenericTextbox
            maxChars={400}
            fieldName={"withdrawals"}
            required={true}
            placeholderText={Config.businessFormationDefaults.withdrawalsPlaceholder}
            title={Config.businessFormationDefaults.withdrawalsTitle}
            contentMd={Config.businessFormationDefaults.withdrawalsBody}
          />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <PartnershipRights />
          <hr className="margin-bottom-2 margin-top-2" aria-hidden={true} />
          <GenericTextbox
            maxChars={400}
            fieldName={"dissolution"}
            required={true}
            placeholderText={Config.businessFormationDefaults.dissolutionPlaceholder}
            title={Config.businessFormationDefaults.dissolutionTitle}
            contentMd={Config.businessFormationDefaults.dissolutionBody}
          />
        </>
      ) : (
        <></>
      )}
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <GenericTextbox
        maxChars={300}
        fieldName={"businessPurpose"}
        required={false}
        placeholderText={Config.businessFormationDefaults.businessPurposePlaceholderText}
        inputLabel={Config.businessFormationDefaults.businessPurposeLabel}
        addButtonText={Config.businessFormationDefaults.businessPurposeAddButtonText}
        title={Config.businessFormationDefaults.businessPurposeTitle}
        contentMd={Config.businessFormationDefaults.businessPurposeBodyText}
      />
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <Provisions />
      <BusinessFormationEmptyFieldAlert
        showRequiredFieldsError={showRequiredFieldsError}
        requiredFieldsWithError={requiredFieldsWithError}
      />
      <div className="margin-top-2">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-top-3 margin-bottom-neg-205">
          <Button
            style="secondary"
            widthAutoOnMobile
            onClick={() => {
              setTab(state.tab - 1);
              scrollToTop();
            }}
          >
            {Config.businessFormationDefaults.previousButtonText}
          </Button>
          <Button style="primary" onClick={submitBusinessData} widthAutoOnMobile noRightMargin>
            {Config.businessFormationDefaults.nextButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
