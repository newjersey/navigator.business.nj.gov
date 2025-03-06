import { StateShortCodesDomestic } from "./states";

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
  requestorFirstName: string;
  requestorLastName: string;
  requestorEmail: string;
  requestorConfirmemail: string;
  requestorPhone: string;
  carrier: string;
  requestorAddress1: string;
  requestAddress2?: string;
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
  textMsg: string;
  textMsgMobile?: string;
  pdfAttach: string;
}

export interface EmergencyTripPermitSubmitSuccessResponse {
  Success: true;
  Id: string;
  PayUrl: string;
  RedirectToUrl: string;
  StatusCode: number;
}

export interface EmergencyTripPermitSubmitErrorResponse {
  results: string[];
}

export type EmergencyTripPermitSubmitResponse =
  | EmergencyTripPermitSubmitSuccessResponse
  | EmergencyTripPermitSubmitErrorResponse;
