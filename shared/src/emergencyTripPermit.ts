import { Dayjs } from "dayjs";
import { getCurrentDateInNewJersey } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { StateShortCodesDomestic } from "@businessnjgovnavigator/shared/states";

export interface EmergencyTripPermitApplicationInfo {
  payerFirstName?: string;
  payerLastName?: string;
  payerCompanyName?: string;
  payerAddress1?: string;
  payerAddress2?: string;
  payerCity?: string;
  payerStateAbbreviation?: StateShortCodesDomestic;
  payerPhoneNumber?: string;
  payerEmail?: string;
  payerCountry?: string;
  payerZipCode?: string;
  requestorFirstName: string;
  requestorLastName: string;
  requestorEmail: string;
  requestorConfirmemail: string;
  requestorPhone: string;
  carrier: string;
  requestorAddress1: string;
  requestorAddress2?: string;
  requestorCity: string;
  requestorCountry: string;
  requestorStateProvince: StateShortCodesDomestic;
  requestorZipPostalCode: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleVinSerial: string;
  vehicleCountry: string;
  vehicleStateProvince: string;
  vehicleLicensePlateNum: string;
  permitDate: string;
  permitStartTime: string;
  deliverySiteName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryStateProvince: StateShortCodesDomestic;
  deliveryZipPostalCode: string;
  deliveryCountry: string;
  pickupSiteName: string;
  pickupAddress: string;
  pickupCity: string;
  pickupStateProvince: StateShortCodesDomestic;
  pickupCountry: string;
  pickupZipPostalCode: string;
  additionalEmail?: string;
  additionalConfirmemail?: string;
  shouldSendTextConfirmation: boolean;
  textMsgMobile?: string;
  shouldAttachPdfToEmail: boolean;
}

export const getEarliestPermitDate = (): Dayjs => {
  const currentDateInNewJersey = getCurrentDateInNewJersey();
  return currentDateInNewJersey.hour() === 23 && currentDateInNewJersey.minute() >= 45
    ? currentDateInNewJersey.add(1, "day")
    : currentDateInNewJersey;
};

export const generateNewEmergencyTripPermitData = (): EmergencyTripPermitApplicationInfo => {
  return {
    additionalConfirmemail: "",
    additionalEmail: "",
    carrier: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryCountry: "US",
    deliverySiteName: "",
    deliveryStateProvince: "NJ",
    deliveryZipPostalCode: "",
    payerCountry: "US",
    payerStateAbbreviation: "NJ",
    payerFirstName: "",
    payerLastName: "",
    payerCompanyName: "",
    payerCity: "",
    payerEmail: "",
    payerZipCode: "",
    payerPhoneNumber: "",
    payerAddress1: "",
    payerAddress2: "",
    shouldAttachPdfToEmail: false,
    permitDate: getEarliestPermitDate().format(defaultDateFormat),
    permitStartTime: "",
    pickupAddress: "",
    pickupCity: "",
    pickupCountry: "US",
    pickupSiteName: "",
    pickupStateProvince: "NJ",
    pickupZipPostalCode: "",
    requestorAddress2: "",
    requestorAddress1: "",
    requestorCity: "",
    requestorConfirmemail: "",
    requestorCountry: "US",
    requestorEmail: "",
    requestorFirstName: "",
    requestorLastName: "",
    requestorPhone: "",
    requestorStateProvince: "NJ",
    requestorZipPostalCode: "",
    shouldSendTextConfirmation: false,
    textMsgMobile: "",
    vehicleCountry: "US",
    vehicleLicensePlateNum: "",
    vehicleMake: "",
    vehicleStateProvince: "NJ",
    vehicleVinSerial: "",
    vehicleYear: "",
  };
};

export interface EmergencyTripPermitSubmitSuccessResponse {
  Success: true;
  Id: string;
  PayUrl: {
    PortalPayId: string;
    RedirectToUrl: string;
    StatusCode: number;
  };
}

export interface EmergencyTripPermitSubmitErrorResponse {
  results: string[];
}

export type EmergencyTripPermitSubmitResponse =
  | EmergencyTripPermitSubmitSuccessResponse
  | EmergencyTripPermitSubmitErrorResponse;

export type EmergencyTripPermitFieldNames = keyof EmergencyTripPermitApplicationInfo;
export type EmergencyTripPermitUserEnteredFieldNames = Exclude<
  EmergencyTripPermitFieldNames,
  | "requestorConfirmemail"
  | "additionalConfirmemail"
  | "shouldAttachPdfToEmail"
  | "shouldSendTextConfirmation"
>;
