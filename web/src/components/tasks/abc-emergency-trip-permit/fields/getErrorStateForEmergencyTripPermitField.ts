import { validateEmail } from "@/lib/utils/helpers";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
} from "@businessnjgovnavigator/shared";
import { EmergencyTripPermitFieldErrorState } from "@businessnjgovnavigator/shared/types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

export const getErrorStateForEmergencyTripPermitField = (
  fieldName: EmergencyTripPermitFieldNames,
  state: EmergencyTripPermitApplicationInfo,
): EmergencyTripPermitFieldErrorState => {
  const value = state[fieldName];
  const nonRequiredFields: EmergencyTripPermitFieldNames[] = [
    "requestorAddress2",
    "payerAddress2",
    "textMsgMobile",
    "additionalEmail",
    "additionalConfirmemail",
    "shouldAttachPdfToEmail",
    "requestorConfirmemail",
    "shouldSendTextConfirmation",
  ];
  const emailFields: EmergencyTripPermitFieldNames[] = [
    "requestorEmail",
    "additionalEmail",
    "additionalConfirmemail",
    "payerEmail",
    "requestorConfirmemail",
  ];
  const maxLength = getMaximumLengthForFieldName(fieldName);
  const minLength = getMinimumLengthForFieldName(fieldName);

  if (value === "" && !nonRequiredFields.includes(fieldName)) {
    return {
      field: fieldName,
      hasError: true,
      label: "Enter a ${fieldName}.",
    };
  }

  if (maxLength && value && value !== true && value?.length > maxLength) {
    return {
      field: fieldName,
      hasError: true,
      label: `$\{fieldName} must be ${maxLength} characters or fewer.`,
    };
  }

  if (minLength && value && value !== true && value?.length < minLength) {
    return {
      field: fieldName,
      hasError: true,
      label: `$\{fieldName} must be ${minLength} characters or more.`,
    };
  }

  if (fieldName === "permitStartTime" && value && value !== true && value !== "") {
    dayjs.extend(timezone);
    const permitDate = dayjs(state["permitDate"]);
    const timeParts = value.split(":");
    const permitDateTime = permitDate
      .tz("America/New_York")
      .hour(Number(timeParts[0]))
      .minute(Number(timeParts[1]));
    const fifteenMinutesAgoInNJ = dayjs().tz("America/New_York").subtract(15, "minutes");
    const isPermitDateEarlierThanFifteenMinutesAgoInNJ =
      permitDateTime.isBefore(fifteenMinutesAgoInNJ);
    if (isPermitDateEarlierThanFifteenMinutesAgoInNJ) {
      return {
        field: fieldName,
        hasError: true,
        label: "${fieldName} must be no more than 15 minutes ago.",
      };
    }
    const fiveDaysFromNowInNJ = dayjs().tz("America/New_York").add(5, "days");
    const isPermitDateAfterFiveDaysFromNow = permitDateTime.isAfter(fiveDaysFromNowInNJ);
    if (isPermitDateAfterFiveDaysFromNow) {
      return {
        field: fieldName,
        hasError: true,
        label: "${fieldName} must be no more than 5 days from now.",
      };
    }
  }

  if (fieldName === "vehicleYear" && value && value !== true && value.length !== 4) {
    return {
      field: fieldName,
      hasError: true,
      label: "${fieldName} must be a 4 digit number.",
    };
  }

  if (fieldName === "vehicleVinSerial" && value && value !== true && value.length !== 17) {
    return {
      field: fieldName,
      hasError: true,
      label: "${fieldName} must be 17 characters.",
    };
  }

  if (emailFields.includes(fieldName) && value && value !== true && !validateEmail(value)) {
    return {
      field: fieldName,
      hasError: true,
      label: "${fieldName} is an invalid email.",
    };
  }

  return {
    field: fieldName,
    hasError: false,
    label: "",
  };
};

export const getMaximumLengthForFieldName = (
  fieldName: EmergencyTripPermitFieldNames,
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
    case "payerFirstName":
    case "payerLastName":
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

export const getMinimumLengthForFieldName = (
  fieldName: EmergencyTripPermitFieldNames,
): number | undefined => {
  switch (fieldName) {
    case "requestorPhone":
      return 10;
    case "requestorZipPostalCode":
      return 5;
  }
};
