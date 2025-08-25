import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared";
import { EmergencyTripPermitStepNames } from "@businessnjgovnavigator/shared/types";

export const EmergencyTripPermitStepsConfiguration: {
  name: EmergencyTripPermitStepNames;
  stepIndex: number;
}[] = [
  { name: "Instructions", stepIndex: 0 },
  { name: "Requestor", stepIndex: 1 },
  { name: "Trip", stepIndex: 2 },
  { name: "Billing", stepIndex: 3 },
  { name: "Review", stepIndex: 4 },
];

export const LookupStepIndexByName = (name: EmergencyTripPermitStepNames): number => {
  return (
    EmergencyTripPermitStepsConfiguration.find((x) => {
      return x.name === name;
    })?.stepIndex ?? 0
  );
};

export const LookupNameByStepIndex = (index: number): EmergencyTripPermitStepNames => {
  const foundName = EmergencyTripPermitStepsConfiguration.find((x) => {
    return x.stepIndex === index;
  })?.name;
  if (!foundName) {
    throw new Error("No step exists for index");
  }
  return foundName;
};

export const generateEmptyErrorMap = (): Record<EmergencyTripPermitFieldNames, boolean> => {
  return {
    additionalConfirmemail: false,
    additionalEmail: false,
    carrier: false,
    deliveryAddress: false,
    deliveryCity: false,
    deliveryCountry: false,
    deliverySiteName: false,
    deliveryStateProvince: false,
    deliveryZipPostalCode: false,
    payerAddress1: false,
    payerAddress2: false,
    payerCity: false,
    payerCompanyName: false,
    payerCountry: false,
    payerZipCode: false,
    payerEmail: false,
    payerFirstName: false,
    payerLastName: false,
    payerPhoneNumber: false,
    payerStateAbbreviation: false,
    shouldAttachPdfToEmail: false,
    permitDate: false,
    permitStartTime: false,
    pickupAddress: false,
    pickupCity: false,
    pickupCountry: false,
    pickupSiteName: false,
    pickupStateProvince: false,
    pickupZipPostalCode: false,
    requestorAddress1: false,
    requestorAddress2: false,
    requestorCity: false,
    requestorConfirmemail: false,
    requestorCountry: false,
    requestorEmail: false,
    requestorFirstName: false,
    requestorLastName: false,
    requestorPhone: false,
    requestorStateProvince: false,
    requestorZipPostalCode: false,
    shouldSendTextConfirmation: false,
    textMsgMobile: false,
    vehicleCountry: false,
    vehicleLicensePlateNum: false,
    vehicleMake: false,
    vehicleStateProvince: false,
    vehicleVinSerial: false,
    vehicleYear: false,
  };
};

export const getStepFromFieldName = (
  fieldName: EmergencyTripPermitFieldNames,
): EmergencyTripPermitStepNames => {
  switch (fieldName) {
    case "carrier":
    case "requestorFirstName":
    case "requestorLastName":
    case "requestorEmail":
    case "requestorPhone":
    case "requestorCountry":
    case "requestorAddress1":
    case "requestorAddress2":
    case "requestorCity":
    case "requestorStateProvince":
    case "requestorZipPostalCode":
    case "vehicleMake":
    case "vehicleYear":
    case "vehicleVinSerial":
    case "vehicleLicensePlateNum":
    case "vehicleStateProvince":
    case "vehicleCountry":
      return "Requestor";
    case "permitDate":
    case "permitStartTime":
    case "pickupSiteName":
    case "pickupCountry":
    case "pickupAddress":
    case "pickupCity":
    case "pickupZipPostalCode":
    case "deliverySiteName":
    case "deliveryCountry":
    case "deliveryAddress":
    case "deliveryCity":
    case "deliveryStateProvince":
    case "deliveryZipPostalCode":
      return "Trip";
    case "payerFirstName":
    case "payerLastName":
    case "payerCompanyName":
    case "payerEmail":
    case "payerPhoneNumber":
    case "payerCountry":
    case "payerAddress1":
    case "payerAddress2":
    case "payerCity":
    case "payerStateAbbreviation":
    case "payerZipCode":
    case "additionalEmail":
    case "additionalConfirmemail":
    case "textMsgMobile":
      return "Billing";
    default:
      return "Review";
  }
};

export const doesStepHaveError = (
  stepName: EmergencyTripPermitStepNames,
  invalidFieldIds: EmergencyTripPermitFieldNames[],
): boolean => {
  if (stepName === "Review" && invalidFieldIds.length > 0) {
    return true;
  }
  for (const fieldName of invalidFieldIds) {
    if (getStepFromFieldName(fieldName) === stepName) {
      return true;
    }
  }
  return false;
};

export const isStepComplete = (
  stepName: EmergencyTripPermitStepNames,
  invalidFieldIds: EmergencyTripPermitFieldNames[],
): boolean => {
  return !doesStepHaveError(stepName, invalidFieldIds);
};
