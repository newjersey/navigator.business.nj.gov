/* eslint-disable unicorn/no-null */
// The API we are integrating with only accepts null and not undefined
import { EmergencyTripPermitApplicationInfo } from "@shared/emergencyTripPermit";
import { StateShortCodesDomestic } from "@shared/states";

export interface ApiSubmission {
  Account: string; //API User Account id
  Key: string; //API Account Key
  ReturnUrl: string | null;
  FailureReturnUrl: string | null;
  Payer: Payer | null;
  PermitApplication: PermitApplication;
}

export interface Payer {
  FirstName: string;
  LastName: string;
  CompanyName: string;
  Address1: string;
  Address2: string | null;
  City: string;
  StateAbbreviation: StateShortCodesDomestic;
  PhoneNumber: string | null;
  Email: string | null;
  Country: string;
}

export interface PermitApplication {
  RequestorFirstName: string;
  RequestorLastName: string;
  RequestorEmail: string;
  RequestorConfirmemail: string;
  RequestorPhone: string;
  Carrier: string;
  RequestorAddress1: string;
  RequestAddress2: string | null;
  RequestorCity: string;
  RequestorCountry: string;
  RequestorStateProvince: StateShortCodesDomestic;
  RequestorZipPostalCode: string;
  VehicleYear: string;
  VehicleMake: string;
  VehicleVinSerial: string;
  VehicleCountry: string;
  VehicleStateProvince: string;
  VehicleLicensePlateNum: string;
  PermitDate: string;
  PermitStartTime: string;
  DeliverySiteName: string;
  DeliveryAddress: string;
  DeliveryCity: string;
  DeliveryStateProvince: StateShortCodesDomestic;
  DeliveryZipPostalCode: string;
  DeliveryCountry: string;
  PickupSiteName: string;
  PickupAddress: string;
  PickupCity: string;
  PickupStateProvince: StateShortCodesDomestic;
  PickupCountry: string;
  PickupZipPostalCode: string;
  AdditionalEmail: string | null;
  AdditionalConfirmemail: string | null;
  TextMsg: string;
  TextMsgMobile: string | null;
  PdfAttach: string;
}

export type ApiConfig = {
  account: string;
  key: string;
  baseUrl: string;
};

export const getApiSubmissionBody = (
  applicationInfo: EmergencyTripPermitApplicationInfo,
  config: ApiConfig
): ApiSubmission => {
  return {
    Account: config.account,
    FailureReturnUrl: null,
    Key: config.key,
    Payer: {
      FirstName: applicationInfo.payerFirstName ?? "",
      LastName: applicationInfo.payerLastName ?? "",
      CompanyName: applicationInfo.payerCompanyName ?? "",
      Address1: applicationInfo.payerAddress1 ?? "",
      Address2: applicationInfo.payerAddress2 ?? "",
      City: applicationInfo.payerCity ?? "",
      StateAbbreviation: applicationInfo.payerStateAbbreviation ?? "NJ",
      PhoneNumber: applicationInfo.payerPhoneNumber ?? "",
      Email: applicationInfo.payerEmail ?? "",
      Country: applicationInfo.payerCountry ?? "",
    },
    PermitApplication: {
      RequestorFirstName: applicationInfo.requestorFirstName,
      RequestorLastName: applicationInfo.requestorLastName,
      RequestorEmail: applicationInfo.requestorEmail,
      RequestorConfirmemail: applicationInfo.requestorConfirmemail,
      RequestorPhone: applicationInfo.requestorPhone,
      Carrier: applicationInfo.carrier,
      RequestorAddress1: applicationInfo.requestorAddress1,
      RequestAddress2: applicationInfo.requestAddress2 ?? null,
      RequestorCity: applicationInfo.requestorCity,
      RequestorCountry: applicationInfo.requestorCountry,
      RequestorStateProvince: applicationInfo.requestorStateProvince,
      RequestorZipPostalCode: applicationInfo.requestorZipPostalCode,
      VehicleYear: applicationInfo.vehicleYear,
      VehicleMake: applicationInfo.vehicleMake,
      VehicleVinSerial: applicationInfo.vehicleVinSerial,
      VehicleCountry: applicationInfo.vehicleCountry,
      VehicleStateProvince: applicationInfo.vehicleStateProvince,
      VehicleLicensePlateNum: applicationInfo.vehicleLicensePlateNum,
      PermitDate: applicationInfo.permitDate,
      PermitStartTime: applicationInfo.permitStartTime,
      DeliverySiteName: applicationInfo.deliverySiteName,
      DeliveryAddress: applicationInfo.deliveryAddress,
      DeliveryCity: applicationInfo.deliveryCity,
      DeliveryStateProvince: applicationInfo.deliveryStateProvince,
      DeliveryZipPostalCode: applicationInfo.deliveryZipPostalCode,
      DeliveryCountry: applicationInfo.deliveryCountry,
      PickupSiteName: applicationInfo.pickupSiteName,
      PickupAddress: applicationInfo.pickupAddress,
      PickupCity: applicationInfo.pickupCity,
      PickupStateProvince: applicationInfo.pickupStateProvince,
      PickupCountry: applicationInfo.pickupCountry,
      PickupZipPostalCode: applicationInfo.pickupZipPostalCode,
      AdditionalEmail: applicationInfo.additionalEmail ?? null,
      AdditionalConfirmemail: applicationInfo.additionalConfirmemail ?? null,
      TextMsg: applicationInfo.textMsg,
      TextMsgMobile: applicationInfo.textMsgMobile ?? null,
      PdfAttach: applicationInfo.pdfAttach,
    },
    ReturnUrl: null,
  };
};

export const generateSampleAPISubmissionBody = (overrides: Partial<ApiSubmission>): ApiSubmission => {
  return {
    Account: "",
    Key: "",
    ReturnUrl: null,
    FailureReturnUrl: null,
    ...overrides,
    Error: null,
    PermitApplication: {
      RequestorFirstName: "John",
      RequestorLastName: "Smith",
      RequestorEmail: "j.smith@yahoo.com",
      RequestorConfirmemail: "j.smith@yahoo.com",
      RequestorPhone: "888-555-1212",
      Carrier: "Cardinal",
      RequestorAddress1: "110 Main Street",
      RequestAddress2: null,
      RequestorCity: "Titusville",
      RequestorCountry: "US",
      RequestorStateProvince: "GA",
      RequestorZipPostalCode: "12121",
      VehicleYear: "2012",
      VehicleMake: "Ford",
      VehicleVinSerial: "1z58d489a5181a58r",
      VehicleCountry: "US",
      VehicleStateProvince: "GA",
      VehicleLicensePlateNum: "A32422",
      PermitDate: "12/31/2024",
      PermitStartTime: "13:45",
      DeliverySiteName: "Joe Diner",
      DeliveryAddress: "1 Owl Lane",
      DeliveryCity: "Trenton",
      DeliveryStateProvince: "NJ",
      DeliveryZipPostalCode: "01922",
      DeliveryCountry: "US",
      PickupSiteName: "Joshs Liquors",
      PickupAddress: "121 Fairmont Avenue",
      PickupCity: "Trenton",
      PickupStateProvince: "NJ",
      PickupCountry: "US",
      PickupZipPostalCode: "07198",
      AdditionalEmail: null,
      AdditionalConfirmemail: null,
      TextMsg: "0",
      TextMsgMobile: null,
      PdfAttach: "0",
      ...overrides.PermitApplication,
    },
    Payer: {
      FirstName: "Gary",
      LastName: "Savage",
      CompanyName: "Savage Industries",
      Address1: "3 Tree Lane",
      Address2: null,
      City: "Smithville",
      StateAbbreviation: "GA",
      Country: "US",
      ZipCode: null,
      PhoneNumber: "888-555-1212",
      Email: "JohnSmith@aol.com",
      ...overrides.Payer,
    },
  } as ApiSubmission;
};
