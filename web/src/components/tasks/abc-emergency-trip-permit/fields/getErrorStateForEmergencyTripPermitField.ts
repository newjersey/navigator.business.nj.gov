import { EmergencyTripPermitFieldErrorState } from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";

export const getErrorStateForEmergencyTripPermitField = (
  fieldName: EmergencyTripPermitFieldNames,
  state: EmergencyTripPermitApplicationInfo
): EmergencyTripPermitFieldErrorState => {
  const value = state[fieldName];
  const nonRequiredFields: EmergencyTripPermitFieldNames[] = [
    "requestorAddress2",
    "payerAddress2",
    "textMsgMobile",
    "additionalEmail",
    "additionalConfirmemail",
    "pdfAttach",
    "requestorConfirmemail",
    "textMsg",
  ];
  const maxLength = getMaximumLengthForFieldName(fieldName);

  if (value === "" && !nonRequiredFields.includes(fieldName)) {
    return {
      field: fieldName,
      hasError: true,
      label: "Enter a ${fieldName}.",
    };
  }

  if (maxLength && value && value?.length > maxLength) {
    return {
      field: fieldName,
      hasError: true,
      label: `$\{fieldName} must be ${maxLength} characters or fewer.`,
    };
  }

  return {
    field: fieldName,
    hasError: false,
    label: "",
  };
};

export const getMaximumLengthForFieldName = (
  fieldName: EmergencyTripPermitFieldNames
): number | undefined => {
  switch (fieldName) {
    case "vehicleYear":
      return 4;
    case "payerZipCode":
      return 5;
    case "vehicleLicensePlateNum":
      return 9;
    case "requestorZipPostalCode":
    case "deliveryZipPostalCode":
    case "pickupZipPostalCode":
      return 10;
    case "payerPhoneNumber":
      return 12;
    case "requestorPhone":
    case "textMsgMobile":
      return 15;
    case "vehicleVinSerial":
      return 17;
    case "payerCity":
      return 32;
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
      return 35;
    case "payerCompanyName":
    case "payerEmail":
      return 50;
    case "requestorEmail":
    case "requestorConfirmemail":
    case "additionalEmail":
    case "additionalConfirmemail":
      return 60;
    case "carrier":
    case "deliverySiteName":
    case "pickupSiteName":
      return 100;
  }
};
