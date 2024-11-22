import { FieldStateActionKind, FormContextType } from "@/contexts/formContext";
import { postTaxFilingsOnboarding } from "@/lib/api-client/apiClient";
import { ProfileFields, ReducedFieldStates, UpdateQueue } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Business, TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { Dispatch, SetStateAction } from "react";

const displayBusinessName = (business: Business): boolean => {
  return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
    "businessName"
  );
};

const displayResponsibleOwnerName = (business: Business): boolean => {
  return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
    "responsibleOwnerName"
  );
};

interface Props {
  business: Business;
  formContextState: FormContextType<ReducedFieldStates<ProfileFields, unknown>, unknown>;
  profileData: ProfileData;
  updateQueue: UpdateQueue;
  onSuccess: () => void;
  close: () => void;
  queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setOnAPIfailed: Dispatch<SetStateAction<"FAILED" | "UNKNOWN" | undefined>>;
}

export const gov2GoSignupAndFetchTaxEvents = async (props: Props): Promise<void> => {
  const fields: ProfileFields[] = ["businessName", "taxId", "responsibleOwnerName"];

  props.setIsLoading(true);

  const encryptedTaxId =
    props.profileData.taxId === props.business.profileData.taxId
      ? props.profileData.encryptedTaxId
      : undefined;

  try {
    let businessNameToSubmitToTaxApi = "";

    if (displayBusinessName(props.business)) {
      businessNameToSubmitToTaxApi = props.profileData.businessName;
    }
    if (displayResponsibleOwnerName(props.business)) {
      businessNameToSubmitToTaxApi = props.profileData.responsibleOwnerName;
    }

    const userDataToSet = await postTaxFilingsOnboarding({
      taxId: props.profileData.taxId as string,
      businessName: businessNameToSubmitToTaxApi,
      encryptedTaxId: encryptedTaxId as string,
    });

    props.updateQueue.queue(userDataToSet).queueProfileData({
      taxId: props.profileData.taxId,
      encryptedTaxId: encryptedTaxId,
    });

    if (getCurrentBusiness(userDataToSet).taxFilingData.state === "SUCCESS") {
      if (displayBusinessName(props.business)) {
        props.updateQueue.queueProfileData({
          businessName: props.profileData.businessName,
        });
      }

      if (displayResponsibleOwnerName(props.business)) {
        props.updateQueue.queueProfileData({
          responsibleOwnerName: props.profileData.responsibleOwnerName,
        });
      }
    }

    await props.updateQueue.update();
  } catch {
    props.setOnAPIfailed("UNKNOWN");
    props.setIsLoading(false);
    return;
  }

  const { taxFilingData } = props.updateQueue.currentBusiness();

  if (taxFilingData.state === "SUCCESS") {
    props.setIsLoading(false);
    analytics.event.tax_calendar_modal.submit.tax_deadlines_added_to_calendar();
    props.onSuccess();
    props.queueUpdateTaskProgress("determine-naics-code", "COMPLETED");
    props.updateQueue.update();
  }

  if (taxFilingData.state === "PENDING") {
    props.setIsLoading(false);
    analytics.event.tax_calendar_modal.submit.business_exists_but_not_in_Gov2Go();
    props.close();
  }

  if (taxFilingData.state === "FAILED") {
    if (taxFilingData.errorField === "businessName" && displayBusinessName(props.business)) {
      props.formContextState.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: "businessName", invalid: true },
      });
    } else if (taxFilingData.errorField === "businessName" && displayResponsibleOwnerName(props.business)) {
      props.formContextState.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: "responsibleOwnerName", invalid: true },
      });
    } else {
      props.formContextState.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: fields, invalid: true },
      });
    }
    props.setOnAPIfailed("FAILED");
    analytics.event.tax_calendar_modal.submit.tax_calendar_business_does_not_exist();
    props.setIsLoading(false);
  }

  if (taxFilingData.state === "API_ERROR") {
    props.setOnAPIfailed("UNKNOWN");
    props.setIsLoading(false);
  }
};
