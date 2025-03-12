import { AbcEmergencyTripPermitStepNames } from "@/lib/types/types";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";

export const EmergencyTripPermitStepsConfiguration: {
  name: AbcEmergencyTripPermitStepNames;
  stepIndex: number;
}[] = [
  { name: "Instructions", stepIndex: 0 },
  { name: "Requestor", stepIndex: 1 },
  { name: "Trip", stepIndex: 2 },
  { name: "Billing", stepIndex: 3 },
  { name: "Review", stepIndex: 4 },
];

export const LookupStepIndexByName = (name: AbcEmergencyTripPermitStepNames): number => {
  return (
    EmergencyTripPermitStepsConfiguration.find((x) => {
      return x.name === name;
    })?.stepIndex ?? 0
  );
};

export const LookupNameByStepIndex = (index: number): AbcEmergencyTripPermitStepNames => {
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
    payerEmail: false,
    payerFirstName: false,
    payerLastName: false,
    payerPhoneNumber: false,
    payerStateAbbreviation: false,
    pdfAttach: false,
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
    textMsg: false,
    textMsgMobile: false,
    vehicleCountry: false,
    vehicleLicensePlateNum: false,
    vehicleMake: false,
    vehicleStateProvince: false,
    vehicleVinSerial: false,
    vehicleYear: false,
  };
};

export const getRequiredFieldsByStep = (
  step: AbcEmergencyTripPermitStepNames
): EmergencyTripPermitFieldNames[] => {
  switch (step) {
    case "Requestor":
      return [
        "requestorFirstName",
        "requestorLastName",
        "carrier",
        "requestorEmail",
        "requestorPhone",
        "requestorCountry",
        "requestorAddress1",
        "requestorCity",
        "requestorStateProvince",
        "requestorZipPostalCode",
        "vehicleMake",
        "vehicleYear",
        "vehicleVinSerial",
        "vehicleLicensePlateNum",
        "vehicleStateProvince",
        "vehicleCountry",
      ];
      break;
    default:
      return [];
  }
};
