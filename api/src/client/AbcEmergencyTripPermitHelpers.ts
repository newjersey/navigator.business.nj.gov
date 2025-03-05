/* eslint-disable unicorn/no-null */
// The API we are integrating with only accepts null and not undefined
import { StateShortCodes } from "@shared/states";

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
  StateAbbreviation: StateShortCodes;
  PhoneNumber: string | null;
  Email: string | null;
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
  RequestorStateProvince: string;
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
  DeliveryStateProvince: string;
  DeliveryZipPostalCode: string;
  DeliveryCountry: string;
  PickupSiteName: string;
  PickupAddress: string;
  PickupCity: string;
  PickupStateProvince: string;
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

export type EmergencyTripPermitSubmitResponse = {
  Success: boolean;
  Id: string;
  PortalPayID: string;
  RedirectToUrl: string;
  StatusCode: number;
};

export const generateAPISubmissionBody = (overrides: Partial<ApiSubmission>): ApiSubmission => {
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
