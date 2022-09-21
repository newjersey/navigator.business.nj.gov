/* eslint-disable @typescript-eslint/no-unused-vars */
import { Express } from "express";
import request from "supertest";
import { generateTaxFilingData, generateTaxIdAndBusinessName, generateUserData } from "../../test/factories";
import { TaxFilingInterface, UserDataClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { taxFilingRouterFactory } from "./taxFilingRouter";
import { getSignedInUserId } from "./userRouter";

jest.mock("./userRouter", () => ({
  getSignedInUserId: jest.fn(),
}));
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("taxFilingRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let apiTaxFilingClient: jest.Mocked<TaxFilingInterface>;
  const userData = generateUserData({ taxFilingData: generateTaxFilingData({ state: "PENDING" }) });
  const responseUserData = { ...userData, taxFilingData: generateTaxFilingData({ state: "SUCCESS" }) };

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");

    stubUserDataClient = {
      get: jest.fn(),
      findByEmail: jest.fn(),
      put: jest.fn(),
    };

    apiTaxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };
    stubUserDataClient.get.mockResolvedValue(userData);
    stubUserDataClient.put.mockImplementation((userData) => Promise.resolve(userData));
    app = setupExpress(false);
    app.use(taxFilingRouterFactory(stubUserDataClient, apiTaxFilingClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe("/lookup", () => {
    it("returns userData", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(apiTaxFilingClient.lookup).toHaveBeenCalledWith({ userData, ...taxIdAndBusinessName });
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("returns 500 on interface error", async () => {
      apiTaxFilingClient.lookup.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
    });

    it("returns 500 on userDataClient put error", async () => {
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubUserDataClient.put.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.lookup).toHaveBeenCalled();
    });

    it("returns 500 on userDataClient get error", async () => {
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubUserDataClient.get.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.lookup).not.toHaveBeenCalled();
    });
  });

  describe("/onboarding", () => {
    it("returns userData", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(apiTaxFilingClient.onboarding).toHaveBeenCalledWith({
        userData,
        ...taxIdAndBusinessName,
      });
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("returns 500 on client error", async () => {
      apiTaxFilingClient.onboarding.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
    });

    it("returns 500 on userDataClient put error", async () => {
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      stubUserDataClient.put.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.onboarding).toHaveBeenCalled();
    });

    it("returns 500 on userDataClient get error", async () => {
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      stubUserDataClient.get.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
    });
  });
});
