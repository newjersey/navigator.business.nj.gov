import { FieldStateActionKind } from "@/contexts/formContext";
import { postTaxFilingsOnboarding } from "@/lib/api-client/apiClient";
import { ProfileFields, UpdateQueue } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  Business,
  getCurrentBusiness,
  LookupLegalStructureById,
  UserData,
} from "@businessnjgovnavigator/shared";
import { Dispatch, SetStateAction } from "react";
import { FormContextType, ReducedFieldStates } from "react-hook-form";

export const displayBusinessName = (business?: Business): boolean => {
  return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
    "businessName"
  );
};

export const displayResponsibleOwnerName = (business?: Business): boolean => {
  return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
    "responsibleOwnerName"
  );
};

interface EncryptedTaxIdProps {
  tempProfileDataTaxId: string | undefined;
  businessTaxId: string | undefined;
  encryptedTaxId: string | undefined;
}

export const checkEncryptedTaxId = (props: EncryptedTaxIdProps): string | undefined => {
  return props.tempProfileDataTaxId === props.businessTaxId ? props.encryptedTaxId : undefined;
};

interface NameToSubmitToTaxApiProps {
  business: Business;
  tempProfileData: Business["profileData"];
}

export const nameToSubmitToTaxApi = (props: NameToSubmitToTaxApiProps): string => {
  let businessNameToSubmitToTaxApi = "";

  if (displayBusinessName(props.business)) {
    businessNameToSubmitToTaxApi = props.tempProfileData.businessName;
  }
  if (displayResponsibleOwnerName(props.business)) {
    businessNameToSubmitToTaxApi = props.tempProfileData.responsibleOwnerName;
  }

  return businessNameToSubmitToTaxApi;
};

interface updateQueueProfileDataProps {
  updateQueue: UpdateQueue;
  userDataToSet: UserData;
  tempProfileDataTaxId: string | undefined;
  encryptedTaxId: string | undefined;
}

export const updateQueueProfileData = (props: updateQueueProfileDataProps): void => {
  props.updateQueue.queue(props.userDataToSet).queueProfileData({
    taxId: props.tempProfileDataTaxId,
    encryptedTaxId: props.encryptedTaxId,
  });
};

interface RegisterForTaxFilingEventsProps {
  business: Business;
  businessProfileDataTaxId: string | undefined;
  queueUpdateTaskProgress: (taskId: string, newValue: TaskProgress) => void;
  tempProfileDataTaxId: string | undefined;
  updateQueue: UpdateQueue;
  closeTaxCalendarModal?: () => void;
  formContextState?: FormContextType<ReducedFieldStates<ProfileFields, unknown>, unknown>;
  setIsLoading?: Dispatch<SetStateAction<boolean>>;
  setOnAPIfailed?: Dispatch<SetStateAction<string>>;
  successCallback?: () => void;
  tempBusinessName?: string;
  tempResponsibleOwnerName?: string;
}

export const registerForGov2GoAndFetchTaxFilingEvents = async (
  props: RegisterForTaxFilingEventsProps
): Promise<void> => {
  const fields: ProfileFields[] = ["businessName", "taxId", "responsibleOwnerName"];
  if (!props.business || !props.updateQueue) return;
  console.log("registerForGov2GoAndFetchTaxFilingEvents");
  if (props.setIsLoading) props.setIsLoading(true);

  const encryptedTaxId =
    props.tempProfileDataTaxId === props.businessProfileDataTaxId ? props.tempProfileDataTaxId : undefined;

  console.log({ encryptedTaxId });

  try {
    console.log("TRYING");
    let businessNameToSubmitToTaxApi = "";

    if (displayBusinessName(props.business)) {
      businessNameToSubmitToTaxApi = props.tempBusinessName;
    }
    if (displayResponsibleOwnerName(props.business)) {
      businessNameToSubmitToTaxApi = props.tempBusinessName;
    }

    if (!businessNameToSubmitToTaxApi) {
      return;
    }

    console.log("NAME TO SUBMIT TO TAX API", businessNameToSubmitToTaxApi);

    const userDataToSet = await postTaxFilingsOnboarding({
      taxId: props.tempProfileDataTaxId,
      businessName: businessNameToSubmitToTaxApi,
      encryptedTaxId: encryptedTaxId,
    });

    console.log("USER DATA TO SET");

    props.updateQueue.queue(userDataToSet).queueProfileData({
      taxId: props.tempProfileDataTaxId,
      encryptedTaxId,
    });

    console.log("UPDATE QUEUE");

    if (getCurrentBusiness(userDataToSet).taxFilingData.state === "SUCCESS") {
      console.log("TAX FILING DATA SUCCESS");
      if (displayBusinessName(props.business)) {
        console.log("DISPLAY BUSINESS NAME");
        props.updateQueue.queueProfileData({
          businessName: props.tempBusinessName,
        });
      }

      if (displayResponsibleOwnerName(props.business)) {
        console.log("DISPLAY RESPONSIBLE OWNER NAME");
        props.updateQueue.queueProfileData({
          responsibleOwnerName: props.tempResponsibleOwnerName,
        });
      }
    }

    console.log("UPDATE QUEUE");

    await props.updateQueue.update();
  } catch (error) {
    if (props.setOnAPIfailed) props.setOnAPIfailed("taxFiling");
    if (props.setIsLoading) props.setIsLoading(false);
    console.log(error);
    console.log("ERROR");
    return;
  }

  const { taxFilingData } = props.updateQueue.currentBusiness();

  if (taxFilingData.state === "SUCCESS") {
    if (props.setIsLoading) props.setIsLoading(false);
    analytics.event.tax_calendar_modal.submit.tax_deadlines_added_to_calendar();
    if (props.successCallback) props.successCallback();
    props.queueUpdateTaskProgress("determine-naics-code", "COMPLETED");
    props.updateQueue.update();
  }

  if (taxFilingData.state === "PENDING") {
    if (props.setIsLoading) props.setIsLoading(false);
    analytics.event.tax_calendar_modal.submit.business_exists_but_not_in_Gov2Go();
    if (props.closeTaxCalendarModal) props.closeTaxCalendarModal();
  }

  if (taxFilingData.state === "FAILED") {
    if (props.formContextState) {
      if (
        props.accessingTaxCalendar &&
        taxFilingData.errorField === "businessName" &&
        displayBusinessName(props.business)
      ) {
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
    }
    if (props.setOnAPIfailed) props.setOnAPIfailed("taxFiling");
    analytics.event.tax_calendar_modal.submit.tax_calendar_business_does_not_exist();
    if (props.setIsLoading) props.setIsLoading(false);
  }
};
