import { Express } from "express";
import { setupExpress } from "@libs/express";
import { employerRatesRouterFactory } from "@api/employerRatesRouter";
import request from "supertest";
import {
  generateEmployerRatesRequestData,
  generateEmployerRatesResponse,
  generateUserData,
} from "@shared/test";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { EmployerRatesClient } from "@domain/types";
import { StatusCodes } from "http-status-codes";

describe("employerRatesRouter", () => {
  let app: Express;
  let logger: LogWriterType;
  let stubEmployerRatesClient: jest.Mocked<EmployerRatesClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    stubEmployerRatesClient = {
      getEmployerRates: jest.fn(),
    };

    app = setupExpress(false);
    app.use(employerRatesRouterFactory(stubEmployerRatesClient, logger));
  });

  describe("POST checkEmployerRates", () => {
    it("sends employerRatesRequest and userData to client and returns client response", async () => {
      const employerRatesRequest = generateEmployerRatesRequestData({});
      const userData = generateUserData({});
      const employerRatesResponse = generateEmployerRatesResponse({});
      stubEmployerRatesClient.getEmployerRates.mockResolvedValue(employerRatesResponse);

      const response = await request(app)
        .post(`/checkEmployerRates`)
        .send({ employerRates: employerRatesRequest, userData });

      expect(stubEmployerRatesClient.getEmployerRates).toHaveBeenCalledWith(employerRatesRequest);
      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual(employerRatesResponse);
    });

    it("sends employerRatesRequest and userData to client and returns error response", async () => {
      const employerRatesRequest = generateEmployerRatesRequestData({});
      const userData = generateUserData({});
      stubEmployerRatesClient.getEmployerRates.mockRejectedValue(new Error("error"));

      const response = await request(app)
        .post(`/checkEmployerRates`)
        .send({ employerRates: employerRatesRequest, userData });

      expect(stubEmployerRatesClient.getEmployerRates).toHaveBeenCalledWith(employerRatesRequest);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual("error");
    });
  });
});
