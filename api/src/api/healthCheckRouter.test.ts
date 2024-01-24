import { healthCheckRouterFactory } from "@api/healthCheckRouter";
import type { HealthCheckMethod } from "@domain/types";
import { setupExpress } from "@libs/express";
import type { Express } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import request from "supertest";

const mockOKHealthCheckMethod: HealthCheckMethod = async () => {
  return new Promise((resolve) => {
    resolve({
      success: true,
      data: {
        message: ReasonPhrases.OK,
      },
    });
  });
};

const mockErrorHealthCheckMethod: HealthCheckMethod = async () => {
  return new Promise((resolve) => {
    resolve({
      success: false,
      error: {
        message: ReasonPhrases.BAD_GATEWAY,
        serverResponseBody: "",
        serverResponseCode: 404,
        timeout: false,
      },
    });
  });
};

const mockTimeoutHealthCheckMethod: HealthCheckMethod = async () => {
  return new Promise((resolve) => {
    resolve({
      success: false,
      error: {
        message: ReasonPhrases.GATEWAY_TIMEOUT,
        timeout: true,
      },
    });
  });
};

describe("healthCheckRouter", () => {
  let app: Express;

  beforeEach(async () => {
    app = setupExpress(false);
    app.use(
      healthCheckRouterFactory(new Map<string, HealthCheckMethod>([["mockOK", mockOKHealthCheckMethod]])),
      healthCheckRouterFactory(new Map<string, HealthCheckMethod>([["mockErr", mockErrorHealthCheckMethod]])),
      healthCheckRouterFactory(
        new Map<string, HealthCheckMethod>([["mockTimeout", mockTimeoutHealthCheckMethod]])
      )
    );
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("GET /self", () => {
    it("should return a successful response for the server's self check", async () => {
      const response = await request(app).get("/self");
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toEqual("OK");
    });
  });

  describe("GET /mockOK", () => {
    it("should return a successful response for a mocked health check", async () => {
      const response = await request(app).get("/mockOK");
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toEqual("OK");
    });
  });

  describe("GET /mockErr", () => {
    it("should return an unsuccessful response for a errored health check", async () => {
      const response = await request(app).get("/mockErr");
      expect(response.status).toBe(StatusCodes.BAD_GATEWAY);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toEqual(ReasonPhrases.BAD_GATEWAY);
    });
  });

  describe("GET /mockTimeout", () => {
    it("should return a successful response for a mocked health check", async () => {
      const response = await request(app).get("/mockTimeout");
      expect(response.status).toBe(StatusCodes.GATEWAY_TIMEOUT);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toEqual(ReasonPhrases.GATEWAY_TIMEOUT);
    });
  });
});
