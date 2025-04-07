import { updateXrayRegistrationStatusFactory } from "@domain/user/updateXrayRegistrationStatusFactory";
import { generateUserData } from "@shared/test";
import { UpdateXrayRegistration, XrayRegistrationStatus, XrayRegistrationStatusLookup } from "@shared/xray";

describe("updateXrayRegistrationStatusFactory", () => {
  let xrayRegistrationLookupClient: jest.Mocked<XrayRegistrationStatusLookup>;
  let updateXrayRegistrationStatus: UpdateXrayRegistration;

  beforeEach(() => {
    jest.resetAllMocks();
    xrayRegistrationLookupClient = {
      getStatus: jest.fn(),
    };
    updateXrayRegistrationStatus = updateXrayRegistrationStatusFactory(xrayRegistrationLookupClient);
  });

  it("returns updated userData", async () => {
    const xrayRegistrationResponse = {
      machines: [
        {
          registrationNumber: "registrationNumber-123",
          roomId: "01",
          registrationCategory: "DENTIST",
          manufacturer: "CORP",
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
    expect(updatedUserData.businesses[updatedUserData.currentBusinessId].xrayRegistrationData).toEqual({
      facilityDetails: facilityDetails,
      status: xrayRegistrationResponse.status,
      expirationDate: xrayRegistrationResponse.expirationDate,
      machines: xrayRegistrationResponse.machines,
    });
  });

  it("throws an error when lookup throws an error", async () => {
    xrayRegistrationLookupClient.getStatus.mockRejectedValue(new Error("NO_ENTRIES_FOUND"));
    const userData = generateUserData({});
    const facilityDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 4B",
      addressZipCode: "12345",
    };
    await expect(updateXrayRegistrationStatus(userData, facilityDetails)).rejects.toThrow("NO_ENTRIES_FOUND");
  });
});
