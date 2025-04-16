import { EmergencyTripPermitFieldErrorState } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";

export const getErrorStateForEmergencyTripPermitField = (
  fieldName: EmergencyTripPermitFieldNames,
  state: EmergencyTripPermitApplicationInfo
): EmergencyTripPermitFieldErrorState => {
  const value = state[fieldName];
  const notRequiredFields: EmergencyTripPermitFieldNames[] = ["requestorAddress2"];

  if (value === "" && !notRequiredFields.includes(fieldName)) {
    return {
      field: fieldName,
      hasError: true,
      label: "Enter a ${fieldName}.",
    };
  }

  let maxLen = -1;
  switch (fieldName) {
    case "requestorFirstName":
    case "requestorLastName":
    case "requestorAddress1":
    case "requestorAddress2":
    case "requestorCity":
    case "vehicleMake":
    case "deliveryAddress":
    case "deliveryCity":
    case "pickupAddress":
    case "pickupCity":
    case "payerAddress1":
    case "payerAddress2":
      maxLen = 35;
      break;
    case "requestorEmail":
    case "additionalEmail":
    case "additionalConfirmemail":
      maxLen = 60;
      break;
    case "vehicleVinSerial":
      maxLen = 17;
      break;
    case "vehicleLicensePlateNum":
      maxLen = 8;
      break;
    case "requestorZipPostalCode":
      maxLen = 10;
      break;
    case "pickupSiteName":
    case "deliverySiteName":
      maxLen = 100;
      break;
    case "requestorPhone":
    case "payerPhoneNumber":
    case "textMsgMobile":
      maxLen = 15;
      break;
  }
  if (maxLen !== -1 && value && value?.length > maxLen) {
    return {
      field: fieldName,
      hasError: true,
      label: templateEval("${fieldName} must be ${maxLen} characters or fewer.", {
        maxLen: maxLen.toString(),
      }),
    };
  }

  return {
    field: fieldName,
    hasError: false,
    label: "",
  };
};
