import { ApiPowerAutomateClientFactory } from "@client/ApiPowerAutomateClientFactory";
import { PowerAutomateClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import axios from "axios";
import { ReasonPhrases } from "http-status-codes";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("ApiPowerAutomateClient", () => {
  let client: PowerAutomateClient;

  beforeEach(() => {
    const logger = DummyLogWriter;
    client = ApiPowerAutomateClientFactory({
      baseUrl: "some-base-url",
      apiKey: "some-api-key",
      logger,
    });
  });

  describe("startWorkflow", () => {
    it("makes a post request to initiate the Power Automate workflow", async () => {
      mockAxios.post.mockResolvedValue({ data: {} });

      await client.startWorkflow({ body: { some: "data" } });

      expect(mockAxios.post).toHaveBeenCalledWith(
        "some-base-url",
        { "api-key": "some-api-key", "health-check": false, some: "data" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });

    it("returns the response from the Power Automate workflow", async () => {
      const axiosResponse = { data: { some: "response" } };
      mockAxios.post.mockResolvedValue(axiosResponse);

      const response = await client.startWorkflow({ body: { some: "data" } });

      expect(response).toBe(axiosResponse);
    });

    it("throws an error if the Power Automate workflow fails", async () => {
      const axiosError = new Error("Some error");
      mockAxios.post.mockRejectedValue(axiosError);

      await expect(client.startWorkflow({ body: { some: "data" } })).rejects.toThrow("Some error");
    });
  });

  describe("health", () => {
    it("returns a passing health check if the service is available", async () => {
      mockAxios.post.mockResolvedValue({});

      expect(await client.health()).toEqual({ success: true, data: { message: ReasonPhrases.OK } });
    });

    it("returns a failing health check if the service is unavailable", async () => {
      mockAxios.post.mockRejectedValue({});

      expect(await client.health()).toEqual({
        success: false,
        data: { message: ReasonPhrases.INTERNAL_SERVER_ERROR },
      });
    });

    it("requests to start the workflow include the health-check body param", async () => {
      mockAxios.post.mockResolvedValue({});

      await client.health();

      expect(mockAxios.post).toHaveBeenCalledWith(
        "some-base-url",
        { "api-key": "some-api-key", "health-check": true },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });
  });
});
