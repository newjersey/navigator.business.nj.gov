/* eslint-disable @typescript-eslint/no-unused-vars */

import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { LicenseStatusItem, UserHandler } from "../domain/types";
import { licenseStatusRouterFactory } from "./licenseStatusRouter";
import {
  generateLicenseSearchCriteria,
  generateLicenseStatusItem,
  generateNameAndAddress,
} from "../domain/factories";
import { getSignedInUserId } from "./userRouter";

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

  it("when failed, updates the user license completedSearch to be false", async () => {
    stubSearchLicenseStatus.mockRejectedValue({});

    const searchCriteria = generateLicenseSearchCriteria({});
    await request(app).post(`/license-status`).send(searchCriteria);

    const { licenseType, ...nameAndAddress } = searchCriteria;

    expect(stubUserHandler.update).toHaveBeenCalledWith("some-id", {
      licenseSearchData: { nameAndAddress, completedSearch: false },
    });
  });

  it("when success, updates the user license completedSearch to be false, then true", async () => {
    stubSearchLicenseStatus.mockResolvedValue([]);

    const searchCriteria = generateLicenseSearchCriteria({});
    await request(app).post(`/license-status`).send(searchCriteria);

    const { licenseType, ...nameAndAddress } = searchCriteria;
    expect(stubUserHandler.update).toHaveBeenNthCalledWith(1, "some-id", {
      licenseSearchData: { nameAndAddress, completedSearch: false },
    });
    expect(stubUserHandler.update).toHaveBeenNthCalledWith(2, "some-id", {
      licenseSearchData: { nameAndAddress, completedSearch: true },
    });
  });

  it("returns 500 if license search errors", async () => {
    stubSearchLicenseStatus.mockRejectedValue({});
    const response = await request(app).post(`/license-status`).send(generateNameAndAddress({}));
    expect(response.status).toEqual(500);
  });
});
