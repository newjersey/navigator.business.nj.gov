import { XrayRegistrationStatus } from "@businessnjgovnavigator/shared";
import { UpdateXrayRegistration, XrayRegistrationStatusLookup } from "@domain/types";
import { updateXrayRegistrationStatusFactory } from "@domain/user/updateXrayRegistrationStatusFactory";
import { getCurrentDate } from "@shared/dateHelpers";
import { generateUserData } from "@shared/test";
import dayjs from "dayjs";

describe("updateXrayRegistrationStatusFactory", () => {
  let xrayRegistrationLookupClient: jest.Mocked<XrayRegistrationStatusLookup>;
  let updateXrayRegistrationStatus: UpdateXrayRegistration;

  beforeEach(() => {
    jest.resetAllMocks();
    xrayRegistrationLookupClient = {
      getStatus: jest.fn(),
    };
    updateXrayRegistrationStatus = updateXrayRegistrationStatusFactory(
      xrayRegistrationLookupClient,
    );
  });

  it("returns updated userData with updated task progress when status is defined", async () => {
    const xrayRegistrationResponse = {
      machines: [
        {
          registrationNumber: "registrationNumber-123",
          roomId: "01",
          registrationCategory: "DENTIST",
          name: "CORP",
          modelNumber: "modelNumber-123",
          serialNumber: "serialNumber-123",
          annualFee: 92,
        },
      ],
      status: "ACTIVE" as XrayRegistrationStatus,
      expirationDate: "08/31/2025",
      deactivationDate: undefined,
    };

    xrayRegistrationLookupClient.getStatus.mockResolvedValue(xrayRegistrationResponse);

    const userData = generateUserData({});
    const facilityDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      addressZipCode: "12345",
    };

    const updatedUserData = await updateXrayRegistrationStatus(userData, facilityDetails);
    const xrayRegistrationData =
      updatedUserData.businesses[updatedUserData.currentBusinessId].xrayRegistrationData;

    expect(xrayRegistrationData?.facilityDetails).toEqual({
      ...facilityDetails,
    });
    expect(xrayRegistrationData?.status).toEqual(xrayRegistrationResponse.status);
    expect(xrayRegistrationData?.expirationDate).toEqual(xrayRegistrationResponse.expirationDate);
    expect(xrayRegistrationData?.machines).toEqual(xrayRegistrationResponse.machines);
    expect(dayjs(xrayRegistrationData?.lastUpdatedISO).minute()).toBe(getCurrentDate().minute());

    expect(
      updatedUserData.businesses[updatedUserData.currentBusinessId].taskProgress["xray-reg"],
    ).toBe("COMPLETED");
  });

  it("doesn't update task progress when status is undefined", async () => {
    const xrayRegistrationResponse = {
      machines: [],
      status: undefined,
      expirationDate: undefined,
      deactivationDate: undefined,
    };

    xrayRegistrationLookupClient.getStatus.mockResolvedValue(xrayRegistrationResponse);

    const userData = generateUserData({});
    const facilityDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      addressZipCode: "12345",
    };

    const updatedUserData = await updateXrayRegistrationStatus(userData, facilityDetails);
    expect(
      updatedUserData.businesses[updatedUserData.currentBusinessId].taskProgress["xray-reg"],
    ).toBe("TO_DO");
  });

  it("throws an error when lookup throws an error", async () => {
    xrayRegistrationLookupClient.getStatus.mockRejectedValue(new Error("SOME_ERROR"));
    const userData = generateUserData({});
    const facilityDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      addressZipCode: "12345",
    };
    await expect(updateXrayRegistrationStatus(userData, facilityDetails)).rejects.toThrow(
      "SOME_ERROR",
    );
  });
});
