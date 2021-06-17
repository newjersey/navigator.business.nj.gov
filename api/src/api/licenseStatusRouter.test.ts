/* eslint-disable @typescript-eslint/no-unused-vars */

import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { LicenseStatusItem, UserData, UserHandler } from "../domain/types";
import { licenseStatusRouterFactory } from "./licenseStatusRouter";
import {
  generateLicenseData,
  generateLicenseSearchCriteria,
  generateLicenseStatusItem,
  generateLicenseStatusResult,
  generateNameAndAddress,
  generateUserData,
} from "../domain/factories";
import { getSignedInUserId } from "./userRouter";
import dayjs from "dayjs";

jest.mock("./userRouter", () => ({
  getSignedInUserId: jest.fn(),
}));
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("licenseStatusRouter", () => {
  let app: Express;

  let stubSearchLicenseStatus: jest.Mock;
  let stubUserHandler: jest.Mocked<UserHandler>;

  beforeEach(async () => {
    fakeSignedInUserId.mockReturnValue("some-id");
    stubSearchLicenseStatus = jest.fn();
    stubUserHandler = {
      get: jest.fn(),
      put: jest.fn(),
      update: jest.fn(),
    };
    app = express();
    app.use(bodyParser.json());
    app.use(licenseStatusRouterFactory(stubSearchLicenseStatus, stubUserHandler));
    stubUserHandler.get.mockResolvedValue(generateUserData({}));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns the status of each license item", async () => {
    const result: LicenseStatusItem[] = [generateLicenseStatusItem({})];
    stubSearchLicenseStatus.mockResolvedValue(result);

    const searchCriteria = generateLicenseSearchCriteria({});

    const response = await request(app).post(`/license-status`).send(searchCriteria);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(result);
    expect(stubSearchLicenseStatus).toHaveBeenCalledWith(searchCriteria);
  });

  it("when failed with existing licenseData, updates licenseData with new nameAndAddress and completedSearch false", async () => {
    stubSearchLicenseStatus.mockRejectedValue({});
    const userData = generateUserData({ licenseData: generateLicenseData({}) });
    stubUserHandler.get.mockResolvedValue(userData);

    const searchCriteria = generateLicenseSearchCriteria({});
    await request(app).post(`/license-status`).send(searchCriteria);

    const { licenseType, ...nameAndAddress } = searchCriteria;

    expect(stubUserHandler.update).toHaveBeenCalledWith("some-id", {
      licenseData: { ...userData.licenseData, nameAndAddress, completedSearch: false },
    });
  });

  it("when failed without existing licenseData, saved licenseData with defaults and new nameAndAddress and completedSearch false", async () => {
    stubSearchLicenseStatus.mockRejectedValue({});
    const userData = generateUserData({ licenseData: undefined });
    stubUserHandler.get.mockResolvedValue(userData);

    const searchCriteria = generateLicenseSearchCriteria({});
    await request(app).post(`/license-status`).send(searchCriteria);

    const { licenseType, ...nameAndAddress } = searchCriteria;

    expect(stubUserHandler.update).toHaveBeenCalledWith("some-id", {
      licenseData: {
        status: "UNKNOWN",
        items: [],
        lastCheckedStatus: "1970-01-01T00:00:00.000Z",
        nameAndAddress: nameAndAddress,
        completedSearch: false,
      },
    });
  });

  it("when success, updates the user licenseData completedSearch to be false, then true (with results)", async () => {
    const results = generateLicenseStatusResult({});
    stubSearchLicenseStatus.mockResolvedValue(results);

    const userData = generateUserData({ licenseData: generateLicenseData({}) });
    stubUserHandler.get.mockResolvedValue(userData);

    const searchCriteria = generateLicenseSearchCriteria({});
    await request(app).post(`/license-status`).send(searchCriteria);

    const { licenseType, ...nameAndAddress } = searchCriteria;
    expect(stubUserHandler.update).toHaveBeenNthCalledWith(1, "some-id", {
      licenseData: { ...userData.licenseData, nameAndAddress, completedSearch: false },
    });

    const [userId, { licenseData }] = userHandlerLastCalledWith();
    expect(licenseData?.status).toEqual(results.status);
    expect(licenseData?.items).toEqual(results.checklistItems);
    expect(licenseData?.nameAndAddress).toEqual(nameAndAddress);
    expect(licenseData?.completedSearch).toEqual(true);
    expect(dayjs(licenseData?.lastCheckedStatus).isSame(dayjs(), "minute")).toEqual(true);
  });

  it("returns 500 if license search errors", async () => {
    stubSearchLicenseStatus.mockRejectedValue({});
    const response = await request(app).post(`/license-status`).send(generateNameAndAddress({}));
    expect(response.status).toEqual(500);
  });

  const userHandlerLastCalledWith = (): [userId: string, userData: Partial<UserData>] => {
    const callCount = stubUserHandler.update.mock.calls.length;
    return stubUserHandler.update.mock.calls[callCount - 1];
  };
});
