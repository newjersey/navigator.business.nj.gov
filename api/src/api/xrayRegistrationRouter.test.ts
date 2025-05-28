import { getSignedInUserId } from "@api/userRouter";
import { xrayRegistrationRouterFactory } from "@api/xrayRegistrationRouter";
import type { FacilityDetails } from "@businessnjgovnavigator/shared";
import { setupExpress } from "@libs/express";
import {
  generateBusiness,
  generateUserDataForBusiness,
  generateXrayRegistrationData,
} from "@shared/test";
import type { Express } from "express";
import { StatusCodes } from "http-status-codes";
import type { DatabaseClient } from "src/domain/types";
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
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      migrateOutdatedVersionUsers: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
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

    const userData = generateUserDataForBusiness(
      generateBusiness({
        xrayRegistrationData: generateXrayRegistrationData({
          facilityDetails,
        }),
      }),
    );

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
    const facilityDetails: FacilityDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      addressLine2: "Apt 1",
      addressZipCode: "12345",
    };
    const response = await request(app).post(`/xray-registration`).send(facilityDetails);
    expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
