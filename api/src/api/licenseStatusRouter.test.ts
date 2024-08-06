/* eslint-disable @typescript-eslint/no-unused-vars */
import { licenseStatusRouterFactory } from "@api/licenseStatusRouter";
import { getSignedInUserId } from "@api/userRouter";
import { setupExpress } from "@libs/express";
import {
  generateBusiness,
  generateLicenseData,
  generateLicenseSearchNameAndAddress,
  generateUserDataForBusiness,
} from "@shared/test";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { UserDataClient } from "src/domain/types";
import request from "supertest";

jest.mock("@api/userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("licenseStatusRouter", () => {
  let app: Express;

  let stubUpdateLicenseStatus: jest.Mock;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
    stubUpdateLicenseStatus = jest.fn();
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
    };
    stubUserDataClient.put.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    app = setupExpress(false);
    app.use(licenseStatusRouterFactory(stubUpdateLicenseStatus, stubUserDataClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  it("returns user data with updated license status when search is not initiated by user from a license task", async () => {
    const licenseData = generateLicenseData({});
    const userData = generateUserDataForBusiness(generateBusiness({ licenseData }));
    stubUpdateLicenseStatus.mockResolvedValue(userData);

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    const licenseTaskID = undefined;
    stubUserDataClient.get.mockResolvedValue(userData);
    const response = await request(app).post(`/license-status`).send({ nameAndAddress, licenseTaskID });
    expect(response.status).toEqual(StatusCodes.OK);
    expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
    expect(stubUserDataClient.put).toHaveBeenCalledWith(userData);
    expect(response.body).toEqual(userData);
    expect(stubUpdateLicenseStatus).toHaveBeenCalledWith(userData, nameAndAddress, licenseTaskID);
  });

  it("returns user data with updated license status when search initiated by user from a license task", async () => {
    const licenseData = generateLicenseData({});
    const userData = generateUserDataForBusiness(generateBusiness({ licenseData }));
    stubUpdateLicenseStatus.mockResolvedValue(userData);

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    const licenseTaskID = "some-task-id";
    stubUserDataClient.get.mockResolvedValue(userData);
    const response = await request(app).post(`/license-status`).send({ nameAndAddress, licenseTaskID });
    expect(response.status).toEqual(StatusCodes.OK);
    expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
    expect(stubUserDataClient.put).toHaveBeenCalledWith(userData);
    expect(response.body).toEqual(userData);
    expect(stubUpdateLicenseStatus).toHaveBeenCalledWith(userData, nameAndAddress, licenseTaskID);
  });

  it("returns INTERNAL SERVER ERROR if license search errors", async () => {
    stubUpdateLicenseStatus.mockRejectedValue({});
    const response = await request(app)
      .post(`/license-status`)
      .send({ nameAndAddress: generateLicenseSearchNameAndAddress({}) });
    expect(stubUserDataClient.put).not.toHaveBeenCalled();
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
