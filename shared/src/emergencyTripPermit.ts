export interface emergencyTripPermitApplication {
  requestorCarrier: string;
  requestorFirstName: string;
  requestorLastName: string;
  requestorEmailAddress: string;
  requestorPhoneNumber: string;
  requestorCountry: string;
  requestorAddress1: string;
  requestorAddress2?: string;
  requestorCity: string;
  requestorStateProvince: string;
  requestorZipCode: string;
  vehicleMake: string;
  vehicleYear: string;
  vehicleVIN: string;
  vehicleLicensePlateNumber: string;
  vehicleStateOfRegistration: string;
  vehicleCountry: string;
  permitDate: string;
  permitStartTime: string;
  deliverySiteName: string;
  deliveryAddress: string;
}

export interface RequestorInformation {
  carrier: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  country: string;
  address1: string;
  address2?: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  vehicleMake: string;
  vehicleYear: string;
  vehicleVIN: string;
  licensePlateNumber: string;
  stateOfRegistration: string;
  countryOfResidence: string;
}

export interface emergencyTripPermitSubmitResponse {
  Success: true;
  Id: string;
  PayUrl: string;
  RedirectToUrl: string;
  StatusCode: number;
}

export const createEmptyRequestorInformation = (): RequestorInformation => {
  return {
    carrier: "",
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    country: "US",
    address1: "",
    address2: "",
    city: "",
    stateProvince: "",
    zipCode: "",
    vehicleMake: "",
    vehicleYear: "",
    vehicleVIN: "",
    licensePlateNumber: "",
    stateOfRegistration: "",
    countryOfResidence: "US",
  };
};

export type EmergencyTripPermitTextField = keyof RequestorInformation;
