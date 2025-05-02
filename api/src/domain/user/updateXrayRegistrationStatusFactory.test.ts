import { XrayRegistrationStatus } from "@businessnjgovnavigator/shared";
import { UpdateXrayRegistration, XrayRegistrationStatusLookup } from "@domain/types";
import { updateXrayRegistrationStatusFactory } from "@domain/user/updateXrayRegistrationStatusFactory";
import { generateUserData } from "@shared/test";

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

  it("returns updated userData with updated task progress", async () => {
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
    expect(
      updatedUserData.businesses[updatedUserData.currentBusinessId].xrayRegistrationData,
    ).toEqual({
      facilityDetails: facilityDetails,
      status: xrayRegistrationResponse.status,
      expirationDate: xrayRegistrationResponse.expirationDate,
      machines: xrayRegistrationResponse.machines,
    });
    expect(
      updatedUserData.businesses[updatedUserData.currentBusinessId].taskProgress["xray-reg"],
    ).toBe("COMPLETED");
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
