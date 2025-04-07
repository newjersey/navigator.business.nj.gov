import { getSignedInUserId } from "@api/userRouter";
import { xrayRegistrationRouterFactory } from "@api/xrayRegistrationRouter";
import { setupExpress } from "@libs/express";
import { XrayRegistrationStatus } from "@shared/xray";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { DatabaseClient } from "src/domain/types";
import request from "supertest";

jest.mock("@api/userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("xrayRegistrationRouter", () => {
  let app: Express;

  let stubUpdateXrayRegistration: jest.Mock;

  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
    stubUpdateXrayRegistration = jest.fn();
    stubDynamoDataClient = {
      migrateData: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    stubDynamoDataClient.put.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    app = setupExpress(false);
    app.use(xrayRegistrationRouterFactory(stubUpdateXrayRegistration, stubDynamoDataClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  it("returns updated userData and updates db when xray registration update is successful", async () => {
    const facilityDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 1",
      addressZipCode: "12345",
    };
    const userData = {
      businesses: {
        "some-id": {
          xrayRegistrationData: {
            facilityDetails,
            status: "ACTIVE" as XrayRegistrationStatus,
            deactivationDate: undefined,
            expirationDate: "08/31/2025",
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
          },
        },
      },
    };
    stubUpdateXrayRegistration.mockResolvedValue(userData);

    const response = await request(app).post(`/xray-registration`).send({
      facilityDetails,
    });
    expect(stubDynamoDataClient.put).toHaveBeenCalledWith(userData);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual(userData);
  });

  it("returns INTERNAL SERVER ERROR update xray registration fails", async () => {
    stubUpdateXrayRegistration.mockRejectedValue({});
    const response = await request(app)
      .post(`/xray-registration`)
      .send({
        facilityDetails: {
          businessName: "Some Business LLC",
          addressLine1: "123 Main Street",
          addressLine2: "Apt 1",
          addressZipCode: "12345",
        },
      });
    expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
