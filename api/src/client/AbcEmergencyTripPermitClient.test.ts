import { AbcEmergencyTripPermitClient } from "@client/AbcEmergencyTripPermitClient";
import { EmergencyTripPermitClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import { EmergencyTripPermitApplicationInfo } from "@shared/emergencyTripPermit";
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const generateApplicationInfo = (
  overrides: Partial<EmergencyTripPermitApplicationInfo>,
): EmergencyTripPermitApplicationInfo => {
  return {
    additionalConfirmemail: "test@test.com",
    additionalEmail: "test2@test.com",
    carrier: "Carrier",
    deliveryAddress: "123 Street",
    deliveryCity: "Newark",
    deliveryCountry: "US",
    deliverySiteName: "The Spot",
    deliveryStateProvince: "NJ",
    deliveryZipPostalCode: "12345",
    payerAddress1: "123 Ave",
    payerAddress2: "",
    payerCity: "Houston",
    payerCompanyName: "Howdy",
    payerCountry: "US",
    payerEmail: "email3@email.com",
    payerFirstName: "John",
    payerLastName: "Smith",
    payerPhoneNumber: "1234567890",
    payerStateAbbreviation: "NJ",
    shouldAttachPdfToEmail: false,
    permitDate: "01/02/03",
    permitStartTime: "9:15",
    pickupAddress: "Boolean Street",
    pickupCity: "Milltown",
    pickupCountry: "US",
    pickupSiteName: "Bobs",
    pickupStateProvince: "NJ",
    pickupZipPostalCode: "12345",
    requestorAddress2: "",
    requestorAddress1: "Another Street",
    requestorCity: "Fiji",
    requestorConfirmemail: "email98989@email.com",
    requestorCountry: "US",
    requestorEmail: "testemail5@email.com",
    requestorFirstName: "Liz",
    requestorLastName: "Lime",
    requestorPhone: "0988765421",
    requestorStateProvince: "NJ",
    requestorZipPostalCode: "08850",
    shouldSendTextConfirmation: false,
    textMsgMobile: "8787878787",
    vehicleCountry: "US",
    vehicleLicensePlateNum: "123456",
    vehicleMake: "Toyota",
    vehicleStateProvince: "NJ",
    vehicleVinSerial: "213412341234",
    vehicleYear: "1990",
    ...overrides,
  };
};

describe("AbcEmergencyTripPermitClient", () => {
  let client: EmergencyTripPermitClient;

  beforeEach(() => {
    jest.resetAllMocks();
    client = AbcEmergencyTripPermitClient(
      { account: "12345", key: "abcdef", baseUrl: "example.com/formation" },
      DummyLogWriter,
    );
  });

  it("submits to the api on wellformed data", () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    client.apply(generateApplicationInfo({}));
    expect(mockAxios.post).toHaveBeenCalled();
  });
});
